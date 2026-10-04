import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { httpError } from '../httpError.js';

// Load the course in req.params.id and make sure the logged-in instructor owns it.
// 404 if it doesn't exist, 403 if someone else owns it.
export async function loadOwnedCourse(req) {
  const course = await Course.findById(req.params.id);
  if (!course) throw httpError(404, 'Course not found');
  if (!course.instructor.equals(req.user.id)) throw httpError(403, 'You do not own this course');
  return course;
}

// Load the course in req.params.id for reading. Returns { course, isOwner, enrollment }
// (enrollment is null unless the requester is an enrolled student).
// A draft course is a 404 for everyone except its owner and already-enrolled students.
// Decision: if an instructor unpublishes a course, students who already enrolled keep
// access (their progress isn't stranded); nobody new can find or enroll in it.
export async function loadVisibleCourse(req) {
  const course = await Course.findById(req.params.id);
  if (!course) throw httpError(404, 'Course not found');

  const isOwner = Boolean(req.user) && course.instructor.equals(req.user.id);
  const enrollment =
    req.user?.role === 'student'
      ? await Enrollment.findOne({ student: req.user.id, course: course._id })
      : null;

  if (course.status !== 'published' && !isOwner && !enrollment) {
    throw httpError(404, 'Course not found');
  }
  return { course, isOwner, enrollment };
}
