import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { button, buttonLight } from '../components/ui.js';

// Turn a YouTube watch / youtu.be link into an embeddable URL, or null.
function youTubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function LessonBody({ lesson }) {
  if (lesson.contentType === 'video') {
    const embed = youTubeEmbed(lesson.body);
    if (embed) {
      return <iframe src={embed} title={lesson.title} allowFullScreen className="aspect-video w-full rounded" />;
    }
    return (
      <a href={lesson.body} target="_blank" rel="noreferrer" className="text-blue-600 underline">
        Watch video
      </a>
    );
  }
  // Text: blank lines separate paragraphs; single newlines are kept.
  return lesson.body.split(/\n\s*\n/).map((para, i) => (
    <p key={i} className="mb-3 whitespace-pre-line text-slate-700">
      {para}
    </p>
  ));
}

export default function LessonPage() {
  const { id, lessonId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    setLesson(null);
    api(`/courses/${id}`).then(setCourse).catch((err) => setError(err.message));
    api(`/courses/${id}/lessons/${lessonId}`)
      .then((data) => setLesson(data.lesson))
      .catch((err) => setError(err.message));
  }, [id, lessonId]);

  async function markComplete() {
    setError('');
    try {
      const { progress } = await api(`/courses/${id}/lessons/${lessonId}/complete`, { method: 'POST' });
      setCourse({ ...course, progress });
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <ErrorMessage error={error} />;
  if (!course || !lesson) return <p className="text-slate-500">Loading…</p>;

  const lessons = course.lessons;
  const index = lessons.findIndex((l) => l._id === lessonId);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const progress = course.progress;
  const done = progress?.completedLessons.includes(lessonId);
  // UX only: students move on after completing this lesson (matches the lock icons).
  const canGoNext = next && (user?.role !== 'student' || done);

  return (
    <div className="space-y-4">
      <Link to={`/courses/${id}`} className="text-sm underline">
        ← {course.course.title}
      </Link>
      {progress && <ProgressBar percent={progress.percent} />}
      <div className="rounded bg-white p-6 shadow">
        <p className="text-xs text-slate-400">
          Lesson {index + 1} of {lessons.length} · {lesson.durationMinutes} min
        </p>
        <h1 className="mb-4 text-2xl font-semibold">{lesson.title}</h1>
        <LessonBody lesson={lesson} />
      </div>
      <div className="flex items-center gap-2">
        {prev && (
          <Link to={`/courses/${id}/lessons/${prev._id}`} className={buttonLight}>
            ← Prev
          </Link>
        )}
        {user?.role === 'student' &&
          (done ? (
            <span className="text-sm text-emerald-600">✓ Completed</span>
          ) : (
            <button onClick={markComplete} className={button}>
              Mark complete
            </button>
          ))}
        {canGoNext && (
          <Link to={`/courses/${id}/lessons/${next._id}`} className={`${buttonLight} ml-auto`}>
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
