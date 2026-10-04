import { Course } from '../models/Course.js';
import { httpError } from '../httpError.js';

// Load the course in req.params.id and make sure the logged-in instructor owns it.
// 404 if it doesn't exist, 403 if someone else owns it.
export async function loadOwnedCourse(req) {
  const course = await Course.findById(req.params.id);
  if (!course) throw httpError(404, 'Course not found');
  if (!course.instructor.equals(req.user.id)) throw httpError(403, 'You do not own this course');
  return course;
}
