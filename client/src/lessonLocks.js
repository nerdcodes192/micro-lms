// UX only: a lesson is locked if it comes after the first incomplete one.
// The server does not enforce sequential order (documented assumption).
export function isLocked(lessons, index, completedIds) {
  const firstIncomplete = lessons.findIndex((l) => !completedIds.includes(l._id));
  return firstIncomplete !== -1 && index > firstIncomplete;
}
