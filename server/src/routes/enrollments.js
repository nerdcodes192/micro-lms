import { Router } from 'express';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Lesson } from '../models/Lesson.js';
import { computeProgress, lessonIdsByCourse } from '../services/progress.js';
import { loadVisibleCourse } from '../services/ownership.js';
import { httpError } from '../httpError.js';

// Mounted at /api.
const router = Router();
const studentOnly = [requireAuth, requireRole('student')];

router.post('/courses/:id/enroll', studentOnly, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || course.status !== 'published') throw httpError(404, 'Course not found');

  // No pre-check: the unique {student, course} index rejects duplicates,
  // which also covers two requests racing each other.
  try {
    const enrollment = await Enrollment.create({ student: req.user.id, course: course._id });
    res.status(201).json({ enrollment });
  } catch (err) {
    if (err.code === 11000) throw httpError(409, 'Already enrolled');
    throw err;
  }
});

// "My Learning": every enrolled course with computed progress. Courses unpublished
// after enrollment stay listed (course.status === 'draft') and remain readable.
router.get('/me/enrollments', studentOnly, async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user.id })
    .populate({
      path: 'course',
      select: 'title description category status instructor',
      populate: { path: 'instructor', select: 'name' },
    })
    .sort({ createdAt: -1 });
  const active = enrollments.filter((e) => e.course); // skip any course that no longer exists
  const lessonIds = await lessonIdsByCourse(active.map((e) => e.course._id));

  res.json({
    enrollments: active.map((e) => ({
      course: e.course,
      enrolledAt: e.createdAt,
      ...computeProgress(e, lessonIds.get(String(e.course._id))),
    })),
  });
});

// Certificate: derived on read, never stored (same idea as progress).
// Trade-off: if the instructor later adds a lesson, the student drops below 100%
// and the certificate is unavailable until they complete it.
router.get('/courses/:id/certificate', studentOnly, async (req, res) => {
  // loadVisibleCourse keeps courses unpublished after enrollment readable.
  const { course, enrollment } = await loadVisibleCourse(req);
  if (!enrollment) throw httpError(403, 'Not enrolled in this course');

  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 }).select('durationMinutes');
  const { percent, totalLessons } = computeProgress(enrollment, lessons.map((l) => l._id));
  if (totalLessons === 0 || percent < 100) throw httpError(403, 'Course not completed yet');

  await course.populate('instructor', 'name');
  await enrollment.populate('student', 'name');
  res.json({
    certificate: {
      studentName: enrollment.student.name,
      courseTitle: course.title,
      instructorName: course.instructor.name,
      totalLessons,
      totalDuration: lessons.reduce((sum, l) => sum + l.durationMinutes, 0),
      // The enrollment's last change is completing the final lesson, so updatedAt
      // is when the course was finished. (Approximate: re-marking an already
      // completed lesson also bumps updatedAt.)
      issuedAt: enrollment.updatedAt,
    },
  });
});

export default router;
