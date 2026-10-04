import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { button } from '../components/ui.js';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/me/enrollments')
      .then((data) => setEnrollments(data.enrollments))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Learning</h1>
      <ErrorMessage error={error} />
      {!enrollments && !error && <p className="text-slate-500">Loading…</p>}
      {enrollments?.length === 0 && (
        <p className="text-slate-500">
          You are not enrolled in any course.{' '}
          <Link to="/courses" className="underline">
            Browse the catalogue
          </Link>
          .
        </p>
      )}
      {enrollments?.map((e) => (
        <div key={e.course._id} className="space-y-2 rounded bg-white p-4 shadow">
          <div className="flex items-center gap-2">
            <Link to={`/courses/${e.course._id}`} className="text-lg font-semibold hover:underline">
              {e.course.title}
            </Link>
            {/* Unpublished after enrollment: still accessible to enrolled students. */}
            {e.course.status === 'draft' && (
              <span className="rounded bg-amber-100 px-2 text-xs text-amber-700">Unpublished</span>
            )}
            <span className="ml-auto text-sm text-slate-500">
              {e.completedCount}/{e.totalLessons} lessons
            </span>
          </div>
          <p className="text-sm text-slate-500">by {e.course.instructor?.name}</p>
          <ProgressBar percent={e.percent} />
          {e.nextLessonId ? (
            <Link
              to={`/courses/${e.course._id}/lessons/${e.nextLessonId}`}
              className={`${button} inline-block`}
            >
              Resume
            </Link>
          ) : (
            <span className="text-sm font-medium text-emerald-600">
              {e.totalLessons ? 'Completed' : 'No lessons yet'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
