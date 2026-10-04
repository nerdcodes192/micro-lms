import { Router } from 'express';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { requireAuth, optionalAuth, requireRole } from '../middleware/auth.js';
import { loadOwnedCourse, loadVisibleCourse } from '../services/ownership.js';
import { computeProgress } from '../services/progress.js';

const router = Router();

// Copy only the fields a client may set (never instructor or _id).
function pickCourseFields(body) {
  const fields = {};
  for (const key of ['title', 'description', 'category', 'status']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
}

// Catalogue: published courses only, with lesson count and total minutes.
router.get('/', optionalAuth, async (req, res) => {
  const found = await Course.find({ status: 'published' })
    .populate('instructor', 'name')
    .sort({ createdAt: -1 });
  // Skip orphaned courses whose instructor account no longer exists (unclean data).
  const courses = found.filter((c) => c.instructor);
  const courseIds = courses.map((c) => c._id);

  const stats = await Lesson.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: '$course',
        lessonCount: { $sum: 1 },
        totalDuration: { $sum: '$durationMinutes' },
      },
    },
  ]);
  const statsByCourse = new Map(stats.map((s) => [String(s._id), s]));

  let enrolledIds = null;
  if (req.user?.role === 'student') {
    const enrollments = await Enrollment.find({ student: req.user.id, course: { $in: courseIds } });
    enrolledIds = new Set(enrollments.map((e) => String(e.course)));
  }

  res.json({
    courses: courses.map((c) => {
      const s = statsByCourse.get(String(c._id));
      const item = {
        _id: c._id,
        title: c.title,
        description: c.description,
        category: c.category,
        instructor: { _id: c.instructor._id, name: c.instructor.name },
        lessonCount: s ? s.lessonCount : 0,
        totalDuration: s ? s.totalDuration : 0,
      };
      if (enrolledIds) item.enrolled = enrolledIds.has(String(c._id));
      return item;
    }),
  });
});

// Course page: summary + ordered lesson list (no lesson bodies).
// Enrolled students also get their progress, so the page can show checkmarks.
router.get('/:id', optionalAuth, async (req, res) => {
  const { course, enrollment } = await loadVisibleCourse(req);
  await course.populate('instructor', 'name');
  const lessons = await Lesson.find({ course: course._id })
    .sort({ order: 1 })
    .select('title contentType durationMinutes order');

  const result = { course, lessons };
  if (req.user?.role === 'student') {
    result.enrolled = Boolean(enrollment);
    if (enrollment) {
      result.progress = {
        ...computeProgress(enrollment, lessons.map((l) => l._id)),
        completedLessons: enrollment.completedLessons,
      };
    }
  }
  res.json(result);
});

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
