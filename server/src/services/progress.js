import { Lesson } from '../models/Lesson.js';

// The ONLY place a progress percentage is computed. Nothing stores a %.
// Only completed IDs that are still lessons of the course count, so adding or
// deleting lessons can never make the number wrong, and duplicates can't inflate it.
export function computeProgress(enrollment, lessonIdsInOrder) {
  const completed = new Set(enrollment.completedLessons.map(String));
  const lessonIds = lessonIdsInOrder.map(String);

  const completedCount = lessonIds.filter((id) => completed.has(id)).length;
  const totalLessons = lessonIds.length;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const nextLessonId = lessonIds.find((id) => !completed.has(id)) ?? null;

  return { completedCount, totalLessons, percent, nextLessonId };
}

// One query for many courses: Map of courseId -> [lessonId, ...] in lesson order.
export async function lessonIdsByCourse(courseIds) {
  const lessons = await Lesson.find({ course: { $in: courseIds } }).sort({ order: 1 }).select('course');
  const byCourse = new Map(courseIds.map((id) => [String(id), []]));
  for (const lesson of lessons) byCourse.get(String(lesson.course)).push(lesson._id);
  return byCourse;
}
