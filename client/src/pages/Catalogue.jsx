import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { button, buttonLight } from '../components/ui.js';

export default function Catalogue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/courses')
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message));
  }, []);

  async function enroll(courseId) {
    setError('');
    try {
      await api(`/courses/${courseId}/enroll`, { method: 'POST' });
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.message); // e.g. 409 "Already enrolled"
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Course catalogue</h1>
      <ErrorMessage error={error} />
      {!courses && !error && <p className="text-slate-500">Loading…</p>}
      {courses?.length === 0 && <p className="text-slate-500">No published courses yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {courses?.map((c) => (
          <div key={c._id} className="flex flex-col rounded bg-white p-4 shadow">
            <p className="text-xs uppercase text-slate-400">{c.category}</p>
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-sm text-slate-500">by {c.instructor.name}</p>
            <p className="mt-2 flex-1 text-sm text-slate-700">{c.description}</p>
            <p className="mt-2 text-sm text-slate-500">
              {c.lessonCount} lessons · {c.totalDuration} min
            </p>
            <div className="mt-3 flex gap-2">
              <Link to={`/courses/${c._id}`} className={buttonLight}>
                Open
              </Link>
              {user?.role === 'student' && !c.enrolled && (
                <button onClick={() => enroll(c._id)} className={button}>
                  Enroll
                </button>
              )}
              {c.enrolled && <span className="self-center text-sm text-emerald-600">Enrolled</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
