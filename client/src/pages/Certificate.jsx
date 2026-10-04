import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { button } from '../components/ui.js';

// Printable certificate. "Save as PDF" uses the browser's print dialog,
// so no PDF library is needed; print:hidden hides the controls on paper.
export default function Certificate() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/courses/${id}/certificate`)
      .then((data) => setCert(data.certificate))
      .catch((err) => setError(err.message)); // e.g. 403 "Course not completed yet"
  }, [id]);

  if (!cert) return error ? <ErrorMessage error={error} /> : <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 print:hidden">
        <Link to={`/courses/${id}`} className="text-sm underline">
          Back to course
        </Link>
        <button onClick={() => window.print()} className={`${button} ml-auto`}>
          Print / Save as PDF
        </button>
      </div>

      <div className="rounded border-4 border-double border-slate-400 bg-white p-10 text-center shadow print:shadow-none">
        <p className="text-sm uppercase tracking-widest text-slate-500">Certificate of Completion</p>
        <p className="mt-6 text-slate-500">This certifies that</p>
        <h1 className="mt-2 text-3xl font-semibold">{cert.studentName}</h1>
        <p className="mt-6 text-slate-500">has completed the course</p>
        <h2 className="mt-2 text-2xl font-semibold">{cert.courseTitle}</h2>
        <p className="mt-2 text-slate-600">taught by {cert.instructorName}</p>
        <p className="mt-6 text-sm text-slate-500">
          {cert.totalLessons} lessons · {cert.totalDuration} minutes
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Issued {new Date(cert.issuedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
