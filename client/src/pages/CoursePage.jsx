import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { isLocked } from '../lessonLocks.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { button } from '../components/ui.js';

export default function CoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api(`/courses/${id}`).then(setData).catch((err) => setError(err.message));
  }
  useEffect(load, [id]);

  async function enroll() {
    setError('');
    try {
      await api(`/courses/${id}/enroll`, { method: 'POST' });
      load();
    } catch (err) {
      setError(err.message); // e.g. 409 "Already enrolled"
    }
  }

  if (!data) return error ? <ErrorMessage error={error} /> : <p className="text-slate-500">Loading…</p>;

  const { course, lessons, enrolled, progress } = data;
  const isOwner = user?.role === 'instructor' && course.instructor._id === user._id;
  const completed = progress?.completedLessons ?? [];
  const canOpen = enrolled || isOwner;

  return (
    <div className="space-y-4">
      <div className="rounded bg-white p-6 shadow">
        <p className="text-xs uppercase text-slate-400">{course.category}</p>
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-slate-500">by {course.instructor.name}</p>
        <p className="mt-3 text-slate-700">{course.description}</p>
        {isOwner && (
          <Link to={`/instructor/courses/${course._id}/edit`} className="mt-3 inline-block text-sm underline">
            Edit course
          </Link>
        )}
        <div className="mt-4">
          {progress && <ProgressBar percent={progress.percent} />}
          {user?.role === 'student' && !enrolled && (
            <button onClick={enroll} className={button}>Enroll</button>
          )}
          {!user && (
            <p className="text-sm text-slate-500">
              <Link to="/login" className="underline">Log in</Link> as a student to enroll.
            </p>
          )}
        </div>
      </div>
      <ErrorMessage error={error} />

      <ol className="divide-y rounded bg-white shadow">
        {lessons.map((lesson, i) => {
          const done = completed.includes(lesson._id);
          const locked = enrolled && isLocked(lessons, i, completed);
          const label = (
            <>
              <span className="w-6 text-center">{done ? '✓' : locked ? '🔒' : i + 1}</span>
              <span className="flex-1">{lesson.title}</span>
              <span className="text-xs text-slate-400">
                {lesson.contentType} · {lesson.durationMinutes} min
              </span>
            </>
          );
          return (
            <li key={lesson._id}>
              {canOpen && !locked ? (
                <Link
                  to={`/courses/${id}/lessons/${lesson._id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  {label}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 text-slate-400">{label}</div>
              )}
            </li>
          );
        })}
        {lessons.length === 0 && <li className="px-4 py-3 text-slate-500">No lessons yet.</li>}
      </ol>
    </div>
  );
}
