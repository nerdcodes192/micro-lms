import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, Check, ChevronDown, ChevronRight, Clock, ExternalLink, ListOrdered } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { formatDuration } from '../format.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import Card from '../components/Card.jsx';
import Button, { buttonClass } from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useToast } from '../components/Toast.jsx';
import { Badge } from '../components/Badge.jsx';
import { LessonList } from '../components/LessonList.jsx';

// Turn a YouTube watch / youtu.be link into an embeddable URL, or null.
function youTubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function LessonBody({ lesson }) {
  if (lesson.contentType === 'video') {
    const embed = youTubeEmbed(lesson.body);
    if (embed) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900">
          <iframe src={embed} title={lesson.title} allowFullScreen className="h-full w-full" />
        </div>
      );
    }
    return (
      <a href={lesson.body} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'secondary' })}>
        Watch video <ExternalLink size={16} />
      </a>
    );
  }
  // Text: blank lines separate paragraphs; single newlines are kept.
  return (
    <div className="max-w-prose text-[15px] leading-7 text-zinc-700">
      {lesson.body.split(/\n\s*\n/).map((para, i) => (
        <p key={i} className="mb-5 whitespace-pre-line">
          {para}
        </p>
      ))}
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-5 w-20" />
      <div className="space-y-3 pt-4">
        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-full max-w-prose" />)}
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { id, lessonId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  usePageTitle(lesson?.title || 'Lesson');

  useEffect(() => {
    setLoadError('');
    setError('');
    setLesson(null);
    setDrawerOpen(false);
    api(`/courses/${id}`).then(setCourse).catch((err) => setLoadError(err.message));
    api(`/courses/${id}/lessons/${lessonId}`)
      .then((data) => setLesson(data.lesson))
      .catch((err) => setLoadError(err.message));
  }, [id, lessonId]);

  async function markComplete() {
    setError('');
    setCompleting(true);
    try {
      const { progress } = await api(`/courses/${id}/lessons/${lessonId}/complete`, { method: 'POST' });
      setCourse((c) => ({ ...c, progress }));
      toast.success(progress.percent === 100 ? 'Course complete — your certificate is ready!' : 'Lesson completed');
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  }

  if (loadError) return <ErrorMessage error={loadError} />;
  if (!course) return <LessonSkeleton />;

  const lessons = course.lessons;
  const index = lessons.findIndex((l) => l._id === lessonId);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const progress = course.progress;
  const isStudent = user?.role === 'student';
  const done = progress?.completedLessons.map(String).includes(lessonId);
  // UX only: students move on after completing this lesson (matches the lock icons).
  const canGoNext = next && (!isStudent || done);
  const lessonUrl = (lid) => `/courses/${id}/lessons/${lid}`;

  const lessonNav = (
    <LessonList
      lessons={lessons}
      completedIds={progress?.completedLessons}
      currentId={lessonId}
      enforceLocks={Boolean(course.enrolled)}
      getHref={(l) => lessonUrl(l._id)}
      compact
    />
  );

  const courseSummary = (
    <div className="space-y-3 px-3 pt-3 pb-2">
      <Link to={`/courses/${id}`} className="block font-semibold tracking-tight text-zinc-900 hover:text-indigo-700">
        {course.course.title}
      </Link>
      {progress && (
        <>
          <ProgressBar percent={progress.percent} showLabel size="sm" />
          <p className="text-xs text-zinc-500">
            {progress.completedCount} of {progress.totalLessons} lessons completed
          </p>
          {progress.percent === 100 && (
            <Link
              to={`/courses/${id}/certificate`}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Award size={15} /> View certificate
            </Link>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      {/* Desktop: sticky lesson navigation. */}
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <Card className="max-h-[calc(100vh-8rem)] overflow-y-auto p-2">
          {courseSummary}
          <div className="my-2 border-t border-zinc-100" />
          {lessonNav}
        </Card>
      </aside>

      {/* Mobile: collapsible lesson drawer. */}
      <Card className="mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          aria-expanded={drawerOpen}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <ListOrdered size={18} className="shrink-0 text-zinc-500" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-zinc-900">{course.course.title}</span>
            <span className="text-xs text-zinc-500">
              Lesson {index + 1} of {lessons.length}
              {progress && ` · ${progress.percent}% complete`}
            </span>
          </span>
          <ChevronDown size={18} className={`shrink-0 text-zinc-400 transition-transform duration-200 ${drawerOpen ? 'rotate-180' : ''}`} />
        </button>
        {progress && <ProgressBar percent={progress.percent} size="sm" className="px-4 pb-3" />}
        {drawerOpen && (
          <div className="border-t border-zinc-100 p-2">
            {lessonNav}
          </div>
        )}
      </Card>

      <article className="min-w-0">
        {!lesson ? (
          <LessonSkeleton />
        ) : (
          <>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Link to={`/courses/${id}`} className="truncate hover:text-zinc-900">
                {course.course.title}
              </Link>
              <ChevronRight size={14} className="shrink-0" />
              <span className="shrink-0 font-medium text-zinc-700">Lesson {index + 1}</span>
            </nav>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{lesson.title}</h1>
            <div className="mt-3 mb-8 flex flex-wrap items-center gap-2">
              <Badge icon={Clock}>{formatDuration(lesson.durationMinutes)}</Badge>
              <Badge tone="indigo">{lesson.contentType === 'video' ? 'Video' : 'Reading'}</Badge>
            </div>
            <LessonBody lesson={lesson} />
          </>
        )}

        <div className="mt-10 border-t border-zinc-200 pt-6">
          <ErrorMessage error={error} />
          <div className="mt-3 flex items-center gap-2 sm:gap-3">
            {prev ? (
              <Button to={lessonUrl(prev._id)} variant="ghost" icon={ArrowLeft} aria-label="Previous lesson">
                <span className="hidden sm:inline">Previous</span>
              </Button>
            ) : (
              <span />
            )}
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {isStudent &&
                (done ? (
                  <Button variant="success" iconRight={Check} aria-disabled="true" className="pointer-events-none">
                    Completed
                  </Button>
                ) : (
                  <Button onClick={markComplete} loading={completing} disabled={!lesson} iconRight={Check}>
                    Mark as Complete
                  </Button>
                ))}
              {next &&
                (canGoNext ? (
                  <Button to={lessonUrl(next._id)} variant="secondary" iconRight={ArrowRight}>
                    Next
                  </Button>
                ) : (
                  <span title="Complete this lesson to continue">
                    <Button variant="secondary" iconRight={ArrowRight} disabled>
                      Next
                    </Button>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
