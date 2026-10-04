import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LessonForm from '../components/LessonForm.jsx';
import { StatusBadge } from './InstructorDashboard.jsx';
import { input, button, buttonLight } from '../components/ui.js';

const emptyCourse = { title: '', description: '', category: '', status: 'draft' };

// Used for both "New course" (no :id) and editing an existing course.
export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyCourse);
  const [lessons, setLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null); // full lesson incl. body
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) {
      setForm(emptyCourse);
      setLessons([]);
      return;
    }
    api(`/courses/${id}`)
      .then(({ course, lessons }) => {
        setForm({ title: course.title, description: course.description, category: course.category, status: course.status });
        setLessons(lessons);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  // Wraps an action: clears messages, shows server errors. Returns true on success.
  async function run(action, successMessage = '') {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function saveCourse(e) {
    e.preventDefault();
    run(async () => {
      if (id) {
        await api(`/courses/${id}`, { method: 'PATCH', body: form });
      } else {
        const { course } = await api('/courses', { method: 'POST', body: form });
        navigate(`/instructor/courses/${course._id}/edit`, { replace: true });
      }
    }, 'Saved.');
  }

  function togglePublish() {
    const status = form.status === 'published' ? 'draft' : 'published';
    run(async () => {
      await api(`/courses/${id}`, { method: 'PATCH', body: { status } });
      setForm({ ...form, status });
    }, status === 'published' ? 'Course published.' : 'Course unpublished.');
  }

  async function reloadLessons() {
    const data = await api(`/courses/${id}`);
    setLessons(data.lessons);
  }

  function addLesson(fields) {
    return run(async () => {
      await api(`/courses/${id}/lessons`, { method: 'POST', body: fields });
      await reloadLessons();
    }, 'Lesson added.');
  }

  function startEdit(lessonId) {
    run(async () => {
      const { lesson } = await api(`/courses/${id}/lessons/${lessonId}`);
      setEditingLesson(lesson);
    });
  }

  function saveLesson(fields) {
    return run(async () => {
      await api(`/courses/${id}/lessons/${editingLesson._id}`, { method: 'PATCH', body: fields });
      setEditingLesson(null);
      await reloadLessons();
    }, 'Lesson updated.');
  }

  function deleteLesson(lesson) {
    if (!window.confirm(`Delete "${lesson.title}"?`)) return;
    run(async () => {
      await api(`/courses/${id}/lessons/${lesson._id}`, { method: 'DELETE' });
      await reloadLessons();
    }, 'Lesson deleted.');
  }

  // Swap two neighbours and send the FULL ordered id list to the server.
  function move(index, delta) {
    const reordered = [...lessons];
    [reordered[index], reordered[index + delta]] = [reordered[index + delta], reordered[index]];
    run(async () => {
      const data = await api(`/courses/${id}/lessons/reorder`, {
        method: 'PUT',
        body: { lessonIds: reordered.map((l) => l._id) },
      });
      setLessons(data.lessons);
    });
  }

  return (
    <div className="space-y-6">
      <Link to="/instructor" className="text-sm underline">
        ← Dashboard
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{id ? 'Edit course' : 'New course'}</h1>
        {id && <StatusBadge status={form.status} />}
        {id && (
          <button onClick={togglePublish} className={`${buttonLight} ml-auto`}>
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        )}
      </div>
      <ErrorMessage error={error} />
      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <form onSubmit={saveCourse} className="space-y-3 rounded bg-white p-6 shadow">
        <input className={input} placeholder="Title" required value={form.title} onChange={update('title')} />
        <input className={input} placeholder="Category" value={form.category} onChange={update('category')} />
        <textarea className={input} rows={3} placeholder="Description"
          value={form.description} onChange={update('description')} />
        {!id && (
          <select className={input} value={form.status} onChange={update('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        )}
        <button className={button}>{id ? 'Save changes' : 'Create course'}</button>
      </form>

      {id && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Lessons</h2>
          <ol className="divide-y rounded bg-white shadow">
            {lessons.map((lesson, i) => (
              <li key={lesson._id} className="flex items-center gap-2 px-4 py-2 text-sm">
                <span className="w-6 text-slate-400">{i + 1}</span>
                <span className="flex-1">{lesson.title}</span>
                <span className="text-xs text-slate-400">
                  {lesson.contentType} · {lesson.durationMinutes} min
                </span>
                <button onClick={() => move(i, -1)} disabled={i === 0} className={buttonLight}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === lessons.length - 1} className={buttonLight}>↓</button>
                <button onClick={() => startEdit(lesson._id)} className={buttonLight}>Edit</button>
                <button onClick={() => deleteLesson(lesson)} className={`${buttonLight} text-red-600`}>Delete</button>
              </li>
            ))}
            {lessons.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No lessons yet.</li>}
          </ol>

          {editingLesson ? (
            <LessonForm key={editingLesson._id} title="Edit lesson" initial={editingLesson}
              onSubmit={saveLesson} onCancel={() => setEditingLesson(null)} submitLabel="Save lesson" />
          ) : (
            <LessonForm key="new" title="Add lesson" onSubmit={addLesson} submitLabel="Add lesson" resetOnSubmit />
          )}
        </section>
      )}
    </div>
  );
}
