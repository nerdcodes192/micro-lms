import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { button } from '../components/ui.js';

export function StatusBadge({ status }) {
  const colors = status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600';
  return <span className={`rounded px-2 py-0.5 text-xs ${colors}`}>{status}</span>;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/instructor/courses')
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold">My courses</h1>
        <Link to="/instructor/courses/new" className={`${button} ml-auto`}>
          New course
        </Link>
      </div>
      <ErrorMessage error={error} />
      {!courses && !error && <p className="text-slate-500">Loading…</p>}
      {courses?.length === 0 && <p className="text-slate-500">You have no courses yet.</p>}
      {courses?.length > 0 && (
        <table className="w-full rounded bg-white text-sm shadow">
          <thead className="border-b text-left text-slate-500">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Lessons</th>
              <th className="p-3">Students</th>
              <th className="p-3">Avg completion</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((c) => (
              <tr key={c._id}>
                <td className="p-3 font-medium">{c.title}</td>
                <td className="p-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-3">{c.lessonCount}</td>
                <td className="p-3">{c.studentCount}</td>
                <td className="p-3">{c.avgCompletion}%</td>
                <td className="space-x-3 p-3 text-right">
                  <Link to={`/instructor/courses/${c._id}/edit`} className="underline">
                    Edit
                  </Link>
                  <Link to={`/instructor/courses/${c._id}/students`} className="underline">
                    Students
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
