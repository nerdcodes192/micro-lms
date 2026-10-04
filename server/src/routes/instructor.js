import { Router } from 'express';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadOwnedCourse } from '../services/ownership.js';
import { computeProgress, lessonIdsByCourse } from '../services/progress.js';

// Mounted at /api/instructor. Every route is instructor-only.
const router = Router();
router.use(requireAuth, requireRole('instructor'));

// Dashboard: my courses (draft + published) with student count and average completion.
// Three queries in total, however many courses or students there are.
router.get('/courses', async (req, res) => {
  const courses = await Course.find({ instructor: req.user.id }).sort({ createdAt: -1 });
  const courseIds = courses.map((c) => c._id);
  const lessonIds = await lessonIdsByCourse(courseIds);
  const enrollments = await Enrollment.find({ course: { $in: courseIds } });

  // Group each enrollment's computed percent by course.
  const percents = new Map(courseIds.map((id) => [String(id), []]));
  for (const e of enrollments) {
    const key = String(e.course);
    percents.get(key).push(computeProgress(e, lessonIds.get(key)).percent);
  }

  res.json({
    courses: courses.map((c) => {
      const list = percents.get(String(c._id));
      const avg = list.length ? list.reduce((sum, p) => sum + p, 0) / list.length : 0;
      return {
        _id: c._id,
        title: c.title,
        category: c.category,
        status: c.status,
        lessonCount: lessonIds.get(String(c._id)).length,
        studentCount: list.length,
        avgCompletion: Math.round(avg),
      };
    }),
  });
});

// Students enrolled in one of my courses, with their progress.
router.get('/courses/:id/students', async (req, res) => {
  const course = await loadOwnedCourse(req);
  const lessonIds = (await lessonIdsByCourse([course._id])).get(String(course._id));
  const enrollments = await Enrollment.find({ course: course._id })
    .populate('student', 'name email')
    .sort({ createdAt: 1 });

  res.json({
    students: enrollments.map((e) => {
      const { completedCount, totalLessons, percent } = computeProgress(e, lessonIds);
      return {
        studentId: e.student._id,
        name: e.student.name,
        email: e.student.email,
        completedCount,
        totalLessons,
        percent,
        enrolledAt: e.createdAt,
      };
    }),
  });
});

export default router;
