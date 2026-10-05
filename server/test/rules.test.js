// Integration tests for the brief's "rules that must actually hold".
// Each test drives the real Express app against an in-memory MongoDB.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

// config.js reads JWT_SECRET at import time, so set it before loading the app.
process.env.JWT_SECRET ??= 'test-secret';
const { createApp } = await import('../src/app.js');
const { Enrollment } = await import('../src/models/Enrollment.js');

let mongod;
let app;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Enrollment.syncIndexes(); // the unique {student, course} index
  app = createApp();
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

// --- helpers ---------------------------------------------------------------

let userCount = 0;
async function signup(role) {
  userCount += 1;
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: `${role} ${userCount}`, email: `${role}${userCount}@test.dev`, password: 'secret123', role })
    .expect(201);
  return `Bearer ${res.body.token}`;
}

async function createCourse(instructor, { status = 'published', lessons = 2 } = {}) {
  const res = await request(app)
    .post('/api/courses')
    .set('Authorization', instructor)
    .send({ title: 'Test Course', status })
    .expect(201);
  const courseId = res.body.course._id;
  const lessonIds = [];
  for (let i = 0; i < lessons; i++) lessonIds.push(await addLesson(instructor, courseId, `Lesson ${i + 1}`));
  return { courseId, lessonIds };
}

async function addLesson(instructor, courseId, title) {
  const res = await request(app)
    .post(`/api/courses/${courseId}/lessons`)
    .set('Authorization', instructor)
    .send({ title, contentType: 'text', body: 'content', durationMinutes: 5 })
    .expect(201);
  return res.body.lesson._id;
}

function enroll(student, courseId) {
  return request(app).post(`/api/courses/${courseId}/enroll`).set('Authorization', student);
}

function complete(student, courseId, lessonId) {
  return request(app)
    .post(`/api/courses/${courseId}/lessons/${lessonId}/complete`)
    .set('Authorization', student)
    .expect(200);
}

// --- rules -----------------------------------------------------------------

test('a student cannot enroll in the same course twice', async () => {
  const instructor = await signup('instructor');
  const student = await signup('student');
  const { courseId } = await createCourse(instructor);

  await enroll(student, courseId).expect(201);
  const again = await enroll(student, courseId).expect(409);
  assert.equal(again.body.error, 'Already enrolled');

  // Even two simultaneous requests can't sneak a duplicate in (unique index).
  const other = await signup('student');
  const racing = await Promise.all([enroll(other, courseId), enroll(other, courseId)]);
  assert.deepEqual(racing.map((r) => r.status).sort(), [201, 409]);

  assert.equal(await Enrollment.countDocuments({ course: courseId }), 2);
});

test('a student cannot read lessons of a course they have not enrolled in', async () => {
  const instructor = await signup('instructor');
  const student = await signup('student');
  const { courseId, lessonIds } = await createCourse(instructor);
  const lessonUrl = `/api/courses/${courseId}/lessons/${lessonIds[0]}`;

  const refused = await request(app).get(lessonUrl).set('Authorization', student).expect(403);
  assert.equal(refused.body.lesson, undefined, 'lesson body must not leak');
  await request(app)
    .post(`${lessonUrl}/complete`)
    .set('Authorization', student)
    .expect(403); // can't record progress either

  await enroll(student, courseId).expect(201);
  const allowed = await request(app).get(lessonUrl).set('Authorization', student).expect(200);
  assert.equal(allowed.body.lesson.body, 'content');
});

test('draft courses are invisible to students entirely', async () => {
  const instructor = await signup('instructor');
  const student = await signup('student');
  const { courseId, lessonIds } = await createCourse(instructor, { status: 'draft' });

  const catalogue = await request(app).get('/api/courses').set('Authorization', student).expect(200);
  assert.ok(!catalogue.body.courses.some((c) => c._id === courseId), 'draft listed in catalogue');

  await request(app).get(`/api/courses/${courseId}`).set('Authorization', student).expect(404);
  await request(app).get(`/api/courses/${courseId}/lessons/${lessonIds[0]}`).set('Authorization', student).expect(404);
  await enroll(student, courseId).expect(404);

  // The owner can still see it.
  await request(app).get(`/api/courses/${courseId}`).set('Authorization', instructor).expect(200);
});

test('only the owning instructor can edit a course, add lessons, or see its students', async () => {
  const owner = await signup('instructor');
  const intruder = await signup('instructor');
  const { courseId } = await createCourse(owner, { lessons: 1 });

  await request(app)
    .patch(`/api/courses/${courseId}`)
    .set('Authorization', intruder)
    .send({ title: 'Hijacked' })
    .expect(403);
  await request(app)
    .post(`/api/courses/${courseId}/lessons`)
    .set('Authorization', intruder)
    .send({ title: 'Spam', contentType: 'text', body: 'x', durationMinutes: 1 })
    .expect(403);
  await request(app).get(`/api/instructor/courses/${courseId}/students`).set('Authorization', intruder).expect(403);

  // Nothing changed.
  const res = await request(app).get(`/api/courses/${courseId}`).set('Authorization', owner).expect(200);
  assert.equal(res.body.course.title, 'Test Course');
  assert.equal(res.body.lessons.length, 1);
});

test('marking a lesson complete twice does not inflate progress', async () => {
  const instructor = await signup('instructor');
  const student = await signup('student');
  const { courseId, lessonIds } = await createCourse(instructor, { lessons: 4 });
  await enroll(student, courseId).expect(201);

  const first = await complete(student, courseId, lessonIds[0]);
  const second = await complete(student, courseId, lessonIds[0]);

  assert.equal(first.body.progress.percent, 25);
  assert.deepEqual(second.body.progress, first.body.progress);
  const enrollment = await Enrollment.findOne({ course: courseId });
  assert.equal(enrollment.completedLessons.length, 1);
});

test('adding a lesson to a course in progress keeps existing percentages correct', async () => {
  const instructor = await signup('instructor');
  const student = await signup('student');
  const { courseId, lessonIds } = await createCourse(instructor, { lessons: 2 });
  await enroll(student, courseId).expect(201);
  await complete(student, courseId, lessonIds[0]);
  const done = await complete(student, courseId, lessonIds[1]);
  assert.equal(done.body.progress.percent, 100);

  const newLessonId = await addLesson(instructor, courseId, 'Bonus lesson');

  // Student's view: 2 of 3 done, and Resume points at the new lesson.
  const mine = await request(app).get('/api/me/enrollments').set('Authorization', student).expect(200);
  const entry = mine.body.enrollments[0];
  assert.equal(entry.completedCount, 2);
  assert.equal(entry.totalLessons, 3);
  assert.equal(entry.percent, 67);
  assert.equal(entry.nextLessonId, newLessonId);

  // Instructor's student list agrees.
  const roster = await request(app)
    .get(`/api/instructor/courses/${courseId}/students`)
    .set('Authorization', instructor)
    .expect(200);
  assert.equal(roster.body.students[0].percent, 67);
});
