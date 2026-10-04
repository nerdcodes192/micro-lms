// Demo data: `npm run seed` (wipes and recreates everything; safe to re-run).
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Lesson } from './models/Lesson.js';
import { Enrollment } from './models/Enrollment.js';
import { computeProgress } from './services/progress.js';

const PASSWORD = 'password123';
const models = [User, Course, Lesson, Enrollment];

const text = (title, body, durationMinutes = 5) => ({ title, contentType: 'text', body, durationMinutes });
const video = (title, id, durationMinutes = 10) => ({
  title, contentType: 'video', body: `https://www.youtube.com/watch?v=${id}`, durationMinutes,
});

const instructors = [
  { name: 'Alice Johnson', email: 'alice.instructor@example.com' },
  { name: 'Bob Martinez', email: 'bob.instructor@example.com' },
];
const students = [
  { name: 'Sam Lee', email: 'sam.student@example.com' },
  { name: 'Priya Patel', email: 'priya.student@example.com' },
  { name: 'Diego Alvarez', email: 'diego.student@example.com' },
  { name: 'Emma Chen', email: 'emma.student@example.com' },
  { name: 'Noah Kim', email: 'noah.student@example.com' },
];

// owner = index into instructors
const courses = [
  {
    owner: 0, status: 'published', title: 'JavaScript Fundamentals', category: 'Programming',
    description: 'Variables, functions and control flow for absolute beginners.',
    lessons: [
      text('Welcome', 'This course covers the core building blocks of JavaScript. By the end you will write small programs with confidence.'),
      video('Variables and Types', 'W6NZfCO5SIk', 12),
      text('Functions', 'Functions let you name and reuse a piece of logic. They take inputs as parameters and return a result.', 8),
      video('Loops and Conditionals', 's9wW2PpJsmQ', 15),
    ],
  },
  {
    owner: 0, status: 'published', title: 'Intro to MongoDB', category: 'Databases',
    description: 'Documents, collections, queries and indexes.',
    lessons: [
      text('What is a document database?', 'MongoDB stores data as flexible JSON-like documents. Related data can live together instead of being spread across tables.'),
      video('Installing MongoDB', 'c2M-rlkkT5o', 9),
      video('CRUD Operations', 'ofme2o29ngU', 18),
      text('Indexes', 'An index lets the database find documents without scanning the whole collection. Unique indexes also enforce data rules.', 7),
      text('Schema Design Tips', 'Model your data around how the application reads it. Embed what is read together; reference what grows without bound.', 6),
    ],
  },
  {
    owner: 1, status: 'published', title: 'UI Design Basics', category: 'Design',
    description: 'Layout, typography and colour for developers.',
    lessons: [
      text('Why design matters', 'Good design makes an interface easy to understand at a glance. Small, consistent choices add up to a polished product.'),
      video('Visual Hierarchy', 'a5KYlHNKQB8', 11),
      text('Typography', 'Pick one or two typefaces and a clear size scale. Line length and spacing matter as much as the font itself.', 6),
      video('Colour Theory', 'Qj1FK8n7WgY', 14),
      text('Spacing and Grids', 'Use a consistent spacing unit and align elements to a grid. White space groups related items and separates unrelated ones.', 5),
      video('Designing a Landing Page', 'YqQx75OPRa0', 20),
    ],
  },
  {
    owner: 0, status: 'draft', title: 'Advanced Node.js (Draft)', category: 'Programming',
    description: 'Streams, workers and performance tuning. Work in progress.',
    lessons: [
      text('Course Outline', 'This course is still being written. It will cover streams, worker threads and profiling.'),
      video('Streams in Depth', 'GlybFFMXXmQ', 16),
      text('Worker Threads', 'Worker threads run CPU-heavy JavaScript off the main event loop. They communicate by passing messages.', 7),
    ],
  },
];

// [student index, course index, number of lessons completed (first n, in order)]
const enrollments = [
  [0, 0, 4], [0, 1, 2],
  [1, 0, 2], [1, 2, 6],
  [2, 1, 0], [2, 2, 3],
  [3, 0, 0], [3, 1, 5], [3, 2, 1],
  // student 4 (Noah) has no enrollments
];

await mongoose.connect(config.mongoUri);
console.log('Connected to MongoDB'); // URI deliberately not printed

for (const model of models) await model.deleteMany({});
for (const model of models) await model.syncIndexes();

const passwordHash = await bcrypt.hash(PASSWORD, 10); // same cost as routes/auth.js
const makeUsers = (list, role) => User.insertMany(list.map((u) => ({ ...u, role, passwordHash })));
const instructorDocs = await makeUsers(instructors, 'instructor');
const studentDocs = await makeUsers(students, 'student');

const courseDocs = [];
const lessonIds = []; // per course, in order
for (const { owner, lessons, ...fields } of courses) {
  const course = await Course.create({ ...fields, instructor: instructorDocs[owner]._id });
  const docs = await Lesson.insertMany(lessons.map((l, i) => ({ ...l, course: course._id, order: i + 1 })));
  courseDocs.push(course);
  lessonIds.push(docs.map((d) => d._id));
}

const enrollmentDocs = await Enrollment.insertMany(
  enrollments.map(([s, c, done]) => ({
    student: studentDocs[s]._id,
    course: courseDocs[c]._id,
    completedLessons: lessonIds[c].slice(0, done),
  }))
);

console.log('\nLogins (all passwords: password123)');
console.table(
  [...instructorDocs, ...studentDocs].map((u) => ({ role: u.role, name: u.name, email: u.email, password: PASSWORD }))
);

console.log('Enrollments');
console.table(
  enrollmentDocs.map((e, i) => {
    const [s, c] = enrollments[i];
    const { completedCount, totalLessons, percent } = computeProgress(e, lessonIds[c]);
    return { student: studentDocs[s].name, course: courseDocs[c].title, completed: `${completedCount}/${totalLessons}`, progress: `${percent}%` };
  })
);

console.log(`Seeded ${courseDocs.length} courses (${courseDocs.filter((c) => c.status === 'draft').length} draft), ` +
  `${lessonIds.flat().length} lessons, ${enrollmentDocs.length} enrollments.`);
await mongoose.disconnect();
