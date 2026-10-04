import { useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Users } from 'lucide-react';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';

// Loads GET /instructor/courses and exposes a publish/unpublish toggle.
// Shared by the instructor Dashboard, My Courses and Students pages.
export function useInstructorCourses() {
  const toast = useToast();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/instructor/courses')
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message));
  }, []);

  async function togglePublish(course) {
    const status = course.status === 'published' ? 'draft' : 'published';
    try {
      await api(`/courses/${course._id}`, { method: 'PATCH', body: { status } });
      setCourses((list) => list.map((c) => (c._id === course._id ? { ...c, status } : c)));
      toast.success(status === 'published' ? 'Course published' : 'Course moved to draft');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return { courses, error, togglePublish };
}

// "•••" menu items for one course row/card.
export function courseMenuItems(course, togglePublish) {
  const published = course.status === 'published';
  return [
    { label: 'Edit', icon: Pencil, to: `/instructor/courses/${course._id}/edit` },
    { label: 'View students', icon: Users, to: `/instructor/courses/${course._id}/students` },
    { label: published ? 'Unpublish' : 'Publish', icon: published ? EyeOff : Eye, onClick: () => togglePublish(course) },
  ];
}
