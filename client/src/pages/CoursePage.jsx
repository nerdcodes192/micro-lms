import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, BookOpen, Clock, Pencil } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { formatDuration } from '../format.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Avatar from '../components/Avatar.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useToast } from '../components/Toast.jsx';
import { Badge, StatusBadge } from '../components/Badge.jsx';
import { LessonList } from '../components/LessonList.jsx';

function CourseSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-4 w-1/3" />
      <div className="grid gap-6 pt-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

export default function CoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  usePageTitle(data?.course.title || 'Course');

  function load() {
    return api(`/courses/${id}`).then(setData).catch((err) => setError(err.message));
  }
  useEffect(() => {
    load();
  }, [id]);

  async function enroll() {
    setError('');
    setEnrolling(true);
    try {
      await api(`/courses/${id}/enroll`, { method: 'POST' });
      await load();
      toast.success('Enrolled — happy learning!');
    } catch (err) {
      setError(err.message); // e.g. 409 "Already enrolled"
    } finally {
      setEnrolling(false);
    }
  }

  if (!data) return error ? <ErrorMessage error={error} /> : <CourseSkeleton />;

  const { course, lessons, enrolled, progress } = data;
  const isOwner = user?.role === 'instructor' && course.instructor._id === user._id;
  const canOpen = enrolled || isOwner;
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const lessonUrl = (lessonId) => `/courses/${id}/lessons/${lessonId}`;

  return (
    <>
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft size={15} /> All courses
      </Link>

      <div className="mb-10 max-w-3xl">
        <div className="flex flex-wrap items-center gap-1.5">
          {course.category && <Badge tone="indigo">{course.category}</Badge>}
          {course.status === 'draft' && <StatusBadge status={isOwner ? 'draft' : 'unpublished'} />}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{course.title}</h1>
        {course.description && <p className="mt-3 text-lg leading-relaxed text-zinc-600">{course.description}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <Avatar name={course.instructor.name} size="sm" />
            <span className="font-medium text-zinc-800">{course.instructor.name}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} /> {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={15} /> {formatDuration(totalMinutes)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-zinc-900">Course content</h2>
          <Card className="p-2">
            <LessonList
              lessons={lessons}
              completedIds={progress?.completedLessons}
              currentId={progress?.nextLessonId}
              enforceLocks={enrolled}
              getHref={(l) => (canOpen ? lessonUrl(l._id) : null)}
            />
          </Card>
        </section>

        <Card className="order-first space-y-4 p-6 lg:sticky lg:top-24 lg:order-none">
          <ErrorMessage error={error} />
          {progress ? (
            <>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-zinc-900">{progress.percent}% complete</p>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {progress.completedCount} of {progress.totalLessons} lessons done
                </p>
              </div>
              <ProgressBar percent={progress.percent} size="lg" />
              {progress.nextLessonId && (
                <Button to={lessonUrl(progress.nextLessonId)} iconRight={ArrowRight} className="w-full">
                  {progress.percent > 0 ? 'Continue Learning' : 'Start Learning'}
                </Button>
              )}
              {progress.percent === 100 && (
                <Button to={`/courses/${id}/certificate`} variant="success" icon={Award} className="w-full">
                  View certificate
                </Button>
              )}
            </>
          ) : user?.role === 'student' && !enrolled ? (
            <>
              <p className="text-sm text-zinc-500">Enroll to track your progress and unlock every lesson.</p>
              <Button onClick={enroll} loading={enrolling} size="lg" className="w-full">
                Enroll in Course
              </Button>
            </>
          ) : isOwner ? (
            <>
              <p className="text-sm text-zinc-500">You're the instructor of this course.</p>
              <Button to={`/instructor/courses/${id}/edit`} variant="secondary" icon={Pencil} className="w-full">
                Edit course
              </Button>
            </>
          ) : !user ? (
            <>
              <p className="text-sm text-zinc-500">Log in as a student to enroll in this course.</p>
              <Button to="/login" className="w-full">
                Log in
              </Button>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Only students can enroll in courses.</p>
          )}
        </Card>
      </div>
    </>
  );
}
