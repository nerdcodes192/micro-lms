import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function CourseStudents() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/courses/${id}`)
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message));
    api(`/instructor/courses/${id}/students`)
      .then((data) => setStudents(data.students))
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div className="space-y-4">
      <Link to="/instructor" className="text-sm underline">
        ← Dashboard
      </Link>
      <h1 className="text-2xl font-semibold">Students{course && `: ${course.title}`}</h1>
      <ErrorMessage error={error} />
      {!students && !error && <p className="text-slate-500">Loading…</p>}
      {students?.length === 0 && <p className="text-slate-500">No students enrolled yet.</p>}
      {students?.length > 0 && (
        <table className="w-full rounded bg-white text-sm shadow">
          <thead className="border-b text-left text-slate-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Lessons</th>
              <th className="w-1/4 p-3">Progress</th>
              <th className="p-3">Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((s) => (
              <tr key={s.studentId}>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">
                  {s.completedCount}/{s.totalLessons}
                </td>
                <td className="p-3">
                  <ProgressBar percent={s.percent} />
                </td>
                <td className="p-3">{new Date(s.enrolledAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
