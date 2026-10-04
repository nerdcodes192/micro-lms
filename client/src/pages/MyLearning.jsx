import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, PlayCircle } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { firstName } from '../format.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import CourseCard from '../components/CourseCard.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { StatusBadge } from '../components/Badge.jsx';

const lessonUrl = (e) => `/courses/${e.course._id}/lessons/${e.nextLessonId}`;

// Most recent in-progress course (enrollments arrive newest first); else the newest one not finished.
function pickFeatured(enrollments) {
  return (
    enrollments.find((e) => e.nextLessonId && e.percent > 0) || enrollments.find((e) => e.nextLessonId) || null
  );
}

function FeaturedCard({ enrollment: e }) {
  const [lessonTitle, setLessonTitle] = useState('');
  useEffect(() => {
    api(`/courses/${e.course._id}`)
      .then((data) => setLessonTitle(data.lessons.find((l) => l._id === e.nextLessonId)?.title || ''))
      .catch(() => {}); // the card still works without the lesson title
  }, [e.course._id, e.nextLessonId]);

  return (
    <Card className="relative mb-10 overflow-hidden border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">Continue learning</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{e.course.title}</h2>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600">
        <PlayCircle size={16} className="shrink-0 text-indigo-500" />
        {lessonTitle ? (
          <span className="truncate">
            Up next: <span className="font-medium text-zinc-900">{lessonTitle}</span>
          </span>
        ) : (
          <Skeleton className="h-4 w-48" />
        )}
      </div>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="mb-2 text-sm text-zinc-500">
            {e.completedCount} of {e.totalLessons} lessons completed
          </p>
          <ProgressBar percent={e.percent} showLabel size="lg" />
        </div>
        <Button to={lessonUrl(e)} size="lg" iconRight={ArrowRight}>
          {e.percent > 0 ? 'Resume Course' : 'Start Course'}
        </Button>
      </div>
    </Card>
  );
}

function EnrollmentFooter({ enrollment: e }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">
        {e.completedCount} of {e.totalLessons} lessons
      </p>
      <ProgressBar percent={e.percent} showLabel size="sm" />
      <div className="flex flex-wrap items-center gap-3">
        {e.nextLessonId ? (
          <Button to={lessonUrl(e)} size="sm" variant="secondary" iconRight={ArrowRight}>
            {e.percent > 0 ? 'Resume' : 'Start'}
          </Button>
        ) : e.totalLessons ? (
          <StatusBadge status="completed" />
        ) : (
          <span className="text-sm text-zinc-500">No lessons yet</span>
        )}
        {e.percent === 100 && (
          <Link
            to={`/courses/${e.course._id}/certificate`}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Award size={15} /> View certificate
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MyLearning() {
  usePageTitle('My Learning');
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/me/enrollments')
      .then((data) => setEnrollments(data.enrollments))
      .catch((err) => setError(err.message));
  }, []);

  const featured = enrollments && pickFeatured(enrollments);

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName(user?.name)} 👋`} subtitle="Pick up where you left off." />
      <ErrorMessage error={error} />

      {!enrollments && !error && (
        <>
          <Skeleton className="mb-10 h-48 rounded-xl" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        </>
      )}

      {enrollments?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Your learning journey starts here."
          text="Enroll in a course and it will show up here."
          action={<Button to="/">Browse Courses</Button>}
        />
      )}

      {enrollments?.length > 0 && (
        <>
          {featured && <FeaturedCard enrollment={featured} />}
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900">My Courses</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => (
              <CourseCard
                key={e.course._id}
                course={e.course}
                // Unpublished after enrollment: still accessible to enrolled students.
                badges={e.course.status === 'draft' && <StatusBadge status="unpublished" />}
                footer={<EnrollmentFooter enrollment={e} />}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
