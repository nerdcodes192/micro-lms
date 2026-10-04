import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Printer } from 'lucide-react';
import { api } from '../api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Button from '../components/Button.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Logo from '../components/Logo.jsx';
import { usePageTitle } from '../components/PageTitle.jsx';
import { formatDuration } from '../format.js';

// Printable certificate. "Save as PDF" uses the browser's print dialog,
// so no PDF library is needed; print:hidden hides the controls (and app shell) on paper.
export default function Certificate() {
  usePageTitle('Certificate');
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/courses/${id}/certificate`)
      .then((data) => setCert(data.certificate))
      .catch((err) => setError(err.message)); // e.g. 403 "Course not completed yet"
  }, [id]);

  const back = (
    <Link
      to={`/courses/${id}`}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
    >
      <ArrowLeft size={16} /> Back to course
    </Link>
  );

  if (error) {
    return (
      <div className="space-y-4">
        {back}
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 print:hidden">
        {back}
        <Button icon={Printer} onClick={() => window.print()} disabled={!cert}>
          Print / Save as PDF
        </Button>
      </div>

      {!cert ? (
        <Skeleton className="aspect-[1.414] w-full rounded-2xl" />
      ) : (
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
          <div className="relative rounded-xl border border-indigo-100 px-6 py-12 text-center sm:px-16 sm:py-16">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="flex justify-center">
              <Logo />
            </div>
            <p className="mt-10 text-xs font-semibold tracking-[0.25em] text-indigo-600 uppercase">
              Certificate of Completion
            </p>
            <p className="mt-8 text-sm text-zinc-500">This certifies that</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{cert.studentName}</h1>
            <p className="mt-8 text-sm text-zinc-500">has successfully completed the course</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{cert.courseTitle}</h2>
            <p className="mt-2 text-sm text-zinc-600">taught by {cert.instructorName}</p>

            <div className="mx-auto mt-12 flex max-w-lg items-end justify-between gap-6 border-t border-zinc-200 pt-6 text-left text-sm">
              <div>
                <p className="text-xs text-zinc-500">Issued</p>
                <p className="font-medium text-zinc-900">
                  {new Date(cert.issuedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                <Award size={22} />
              </span>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Course</p>
                <p className="font-medium text-zinc-900">
                  {cert.totalLessons} lessons · {formatDuration(cert.totalDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
