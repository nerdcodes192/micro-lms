import { Router } from 'express';
import { Lesson } from '../models/Lesson.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadOwnedCourse } from '../services/ownership.js';
import { httpError } from '../httpError.js';

// Mounted at /api/courses/:id/lessons, so req.params.id is the course id.
const router = Router({ mergeParams: true });

// Fields a client may set on a lesson. `order` is managed by the server only.
function pickLessonFields(body) {
  const fields = {};
  for (const key of ['title', 'contentType', 'body', 'durationMinutes']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
}

// The lesson must belong to the course in the URL, otherwise 404.
async function findLessonInCourse(courseId, lessonId) {
  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
  if (!lesson) throw httpError(404, 'Lesson not found');
  return lesson;
}

// Rewrite order to 1..n following the given id sequence.
async function writeOrder(lessonIds) {
  if (lessonIds.length === 0) return;
  await Lesson.bulkWrite(
    lessonIds.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
    }))
  );
}

const ownerOnly = [requireAuth, requireRole('instructor')];

router.post('/', ownerOnly, async (req, res) => {
  const course = await loadOwnedCourse(req);
  const last = await Lesson.findOne({ course: course._id }).sort({ order: -1 });
  const lesson = await Lesson.create({
    ...pickLessonFields(req.body),
    course: course._id,
    order: last ? last.order + 1 : 1,
  });
  res.status(201).json({ lesson });
});

router.patch('/:lessonId', ownerOnly, async (req, res) => {
  const course = await loadOwnedCourse(req);
  const lesson = await findLessonInCourse(course._id, req.params.lessonId);
  lesson.set(pickLessonFields(req.body));
  await lesson.save();
  res.json({ lesson });
});

router.delete('/:lessonId', ownerOnly, async (req, res) => {
  const course = await loadOwnedCourse(req);
  const lesson = await findLessonInCourse(course._id, req.params.lessonId);
  await lesson.deleteOne();

  // Close the gap so orders stay 1..n. Progress needs no fix-up: it is computed
  // against the current lessons, so the deleted id simply stops counting.
  const remaining = await Lesson.find({ course: course._id }).sort({ order: 1 }).select('_id');
  await writeOrder(remaining.map((l) => l._id));
  res.status(204).end();
});

// Body: { lessonIds: [...] } — the course's full lesson list in the new order.
router.put('/reorder', ownerOnly, async (req, res) => {
  const course = await loadOwnedCourse(req);
  const { lessonIds } = req.body;
  const current = await Lesson.find({ course: course._id }).select('_id');
  const currentIds = new Set(current.map((l) => l.id));

  // Must be exactly this course's lessons: same count, no duplicates, nothing foreign.
  const valid =
    Array.isArray(lessonIds) &&
    lessonIds.length === currentIds.size &&
    new Set(lessonIds).size === lessonIds.length &&
    lessonIds.every((id) => currentIds.has(id));
  if (!valid) throw httpError(400, "lessonIds must list each of this course's lessons exactly once");

  await writeOrder(lessonIds);
  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
  res.json({ lessons });
});

export default router;
