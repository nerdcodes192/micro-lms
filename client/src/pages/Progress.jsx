import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, TrendingUp, ListChecks } from 'lucide-react';
import { api } from '../api.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { StatusBadge, progressStatus } from '../components/Badge.jsx';

function summarize(enrollments) {
  const n = enrollments.length;
  const completed = enrollments.filter((e) => e.totalLessons > 0 && e.percent === 100).length;
  const avg = n ? Math.round(enrollments.reduce((sum, e) => sum + e.percent, 0) / n) : 0;
  const lessonsDone = enrollments.reduce((sum, e) => sum + e.completedCount, 0);
  const lessonsTotal = enrollments.reduce((sum, e) => sum + e.totalLessons, 0);
  return { n, completed, avg, lessonsDone, lessonsTotal };
}

export default function Progress() {
  usePageTitle('Progress');
  const [enrollments, setEnrollments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/me/enrollments')
      .then((data) => setEnrollments(data.enrollments))
      .catch((err) => setError(err.message));
  }, []);

  const s = enrollments && summarize(enrollments);

  return (
    <>
      <PageHeader title="Your progress" subtitle="Track how far you've come." />
      <ErrorMessage error={error} />

      {!enrollments && !error && (
        <>
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </>
      )}

      {enrollments?.length === 0 && (
        <EmptyState
          icon={TrendingUp}
          title="Nothing to track yet"
          text="Enroll in a course and your progress will appear here."
          action={<Button to="/">Browse Courses</Button>}
        />
      )}

      {enrollments?.length > 0 && (
        <>
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Enrolled" value={s.n} context={s.n === 1 ? 'course' : 'courses'} />
            <StatCard icon={CheckCircle2} label="Completed" value={s.completed} context={`of ${s.n} enrolled`} />
            <StatCard icon={TrendingUp} label="Avg. Progress" value={`${s.avg}%`} context="across your courses" />
            <StatCard icon={ListChecks} label="Lessons Done" value={s.lessonsDone} context={`of ${s.lessonsTotal} lessons`} />
          </div>

          <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900">By course</h2>
          <Card className="divide-y divide-zinc-200">
            {enrollments.map((e) => (
              <div key={e.course._id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:gap-6">
                <div className="min-w-0 md:w-2/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/courses/${e.course._id}`}
                      className="truncate font-medium text-zinc-900 hover:text-indigo-700"
                    >
                      {e.course.title}
                    </Link>
                    <StatusBadge status={progressStatus(e.percent)} />
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {e.completedCount} / {e.totalLessons} lessons
                  </p>
                </div>
                <ProgressBar percent={e.percent} showLabel className="flex-1" />
                <div className="md:w-36 md:text-right">
                  {e.percent === 100 ? (
                    <Link
                      to={`/courses/${e.course._id}/certificate`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <Award size={15} /> Certificate
                    </Link>
                  ) : e.nextLessonId ? (
                    <Link
                      to={`/courses/${e.course._id}/lessons/${e.nextLessonId}`}
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                      {e.percent > 0 ? 'Resume' : 'Start'} →
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}
