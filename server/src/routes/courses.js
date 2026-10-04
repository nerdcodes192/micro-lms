import { Router } from 'express';
import { Course } from '../models/Course.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadOwnedCourse } from '../services/ownership.js';

const router = Router();

// Copy only the fields a client may set (never instructor or _id).
function pickCourseFields(body) {
  const fields = {};
  for (const key of ['title', 'description', 'category', 'status']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
}

router.post('/', requireAuth, requireRole('instructor'), async (req, res) => {
  const course = await Course.create({ ...pickCourseFields(req.body), instructor: req.user.id });
  res.status(201).json({ course });
});

router.patch('/:id', requireAuth, requireRole('instructor'), async (req, res) => {
  const course = await loadOwnedCourse(req);
  course.set(pickCourseFields(req.body));
  await course.save(); // runs schema validation (e.g. status enum)
  res.json({ course });
});

export default router;
