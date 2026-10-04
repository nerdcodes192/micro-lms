import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDown, ArrowLeft, ArrowUp, FileText, GripVertical, ListPlus, Pencil, PlayCircle, Plus, Trash2, Users,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Tooltip from '../components/Tooltip.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import LessonForm, { SegmentedControl } from '../components/LessonForm.jsx';
import { Field, Input, Textarea } from '../components/Field.jsx';
import { useToast } from '../components/Toast.jsx';
import { formatDuration, lessonNumber } from '../format.js';

const emptyCourse = { title: '', description: '', category: '', status: 'draft' };
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

// Returns a copy of `list` with the item at `from` moved to index `to`.
function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Used for both "Create Course" (no :id) and editing an existing course.
export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  usePageTitle(id ? 'Edit Course' : 'Create Course');

  const [form, setForm] = useState(emptyCourse);
  const [owner, setOwner] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    setError('');
    if (!id) {
      setForm(emptyCourse);
      setLessons([]);
      setOwner(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api(`/courses/${id}`)
      .then(({ course, lessons }) => {
        setForm({ title: course.title, description: course.description, category: course.category, status: course.status });
        setOwner(course.instructor);
        setLessons(lessons);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Shows a server error both inline and as a toast.
  function fail(err) {
    setError(err.message);
    toast.error(err.message);
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function saveCourse(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (id) {
        await api(`/courses/${id}`, { method: 'PATCH', body: form });
        toast.success('Course saved');
      } else {
        const { course } = await api('/courses', { method: 'POST', body: form });
        toast.success('Course created — now add some lessons');
        navigate(`/instructor/courses/${course._id}/edit`, { replace: true });
      }
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  }

  // New course: status is part of the form. Existing course: publishing applies immediately.
  async function changeStatus(status) {
    if (!id) return setForm({ ...form, status });
    setError('');
    setStatusSaving(true);
    try {
      await api(`/courses/${id}`, { method: 'PATCH', body: { status } });
      setForm((f) => ({ ...f, status }));
      toast.success(status === 'published' ? 'Course published' : 'Course moved to draft');
    } catch (err) {
      fail(err);
    } finally {
      setStatusSaving(false);
    }
  }

  const notOwner = owner && user && String(owner._id) !== String(user._id);
  const loadFailed = id && !loading && !owner;

  return (
    <>
      <PageHeader
        eyebrow={
          <Link to="/instructor/courses" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900">
            <ArrowLeft size={15} /> Back to Courses
          </Link>
        }
        title={id ? 'Edit Course' : 'Create Course'}
        subtitle={id ? 'Update details, manage lessons and publish when ready.' : 'Start with the basics — you can add lessons after saving.'}
        actions={id && owner && !notOwner && (
          <Button to={`/instructor/courses/${id}/students`} variant="secondary" icon={Users}>View students</Button>
        )}
      />

      <div className="space-y-4">
        <ErrorMessage error={error} />
        {notOwner && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            This course belongs to {owner.name}. You can view it, but the server will reject any changes.
          </p>
        )}
      </div>

      {loading && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Skeleton className="h-96 rounded-xl xl:col-span-2" />
          <Skeleton className="h-96 rounded-xl xl:col-span-3" />
        </div>
      )}

      {!loading && !loadFailed && (
        <div className={`mt-6 grid grid-cols-1 items-start gap-6 ${id ? 'xl:grid-cols-5' : 'max-w-2xl'}`}>
          <Card as="form" onSubmit={saveCourse} className={`space-y-5 p-6 ${id ? 'xl:sticky xl:top-24 xl:col-span-2' : ''}`}>
            <h2 className="text-base font-semibold text-zinc-900">Course details</h2>
            <Field label="Title" htmlFor="course-title">
              <Input id="course-title" required placeholder="e.g. Intro to TypeScript" value={form.title} onChange={update('title')} />
            </Field>
            <Field label="Description" htmlFor="course-description">
              <Textarea id="course-description" rows={4} placeholder="What will students learn?"
                value={form.description} onChange={update('description')} />
            </Field>
            <Field label="Category" htmlFor="course-category">
              <Input id="course-category" placeholder="e.g. Development" value={form.category} onChange={update('category')} />
            </Field>
            <Field label="Status" hint={id ? 'Changing status applies immediately.' : 'Drafts are hidden from the catalogue.'}>
              <div>
                <SegmentedControl label="Course status" value={form.status} onChange={changeStatus}
                  options={statusOptions} disabled={statusSaving} />
              </div>
            </Field>
            <div className="border-t border-zinc-100 pt-5">
              <Button type="submit" loading={saving} className="w-full sm:w-auto">
                {id ? 'Save Course' : 'Create Course'}
              </Button>
            </div>
          </Card>

          {id && (
            <div className="xl:col-span-3">
              <LessonsSection courseId={id} lessons={lessons} setLessons={setLessons} fail={fail} clearError={() => setError('')} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

function LessonsSection({ courseId, lessons, setLessons, fail, clearError }) {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null); // full lesson (incl. body) being edited inline
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  async function reloadLessons() {
    const data = await api(`/courses/${courseId}`);
    setLessons(data.lessons);
  }

  // Runs a lesson mutation; resolves true on success (LessonForm uses this to reset).
  async function run(action, successMessage) {
    clearError();
    try {
      await action();
      toast.success(successMessage);
      return true;
    } catch (err) {
      fail(err);
      return false;
    }
  }

  const addLesson = (fields) =>
    run(async () => {
      await api(`/courses/${courseId}/lessons`, { method: 'POST', body: fields });
      await reloadLessons();
      setAdding(false);
    }, 'Lesson added');

  async function startEdit(lessonId) {
    clearError();
    try {
      const { lesson } = await api(`/courses/${courseId}/lessons/${lessonId}`);
      setAdding(false);
      setEditing(lesson);
    } catch (err) {
      fail(err);
    }
  }

  const saveLesson = (fields) =>
    run(async () => {
      await api(`/courses/${courseId}/lessons/${editing._id}`, { method: 'PATCH', body: fields });
      setEditing(null);
      await reloadLessons();
    }, 'Lesson updated');

  async function confirmDelete() {
    setDeleting(true);
    await run(async () => {
      await api(`/courses/${courseId}/lessons/${deleteTarget._id}`, { method: 'DELETE' });
      await reloadLessons();
    }, 'Lesson deleted');
    setDeleting(false);
    setDeleteTarget(null);
  }

  // Optimistically show the new order, send the FULL ordered id list, revert on error.
  async function saveOrder(next) {
    const previous = lessons;
    setLessons(next);
    clearError();
    try {
      const data = await api(`/courses/${courseId}/lessons/reorder`, {
        method: 'PUT',
        body: { lessonIds: next.map((l) => l._id) },
      });
      setLessons(data.lessons);
    } catch (err) {
      setLessons(previous);
      fail(err);
    }
  }

  const move = (from, to) => from !== to && saveOrder(moveItem(lessons, from, to));

  // Native HTML5 drag-and-drop handlers for a card at `index`.
  const dragProps = (index) => ({
    draggable: !editing,
    onDragStart: (e) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', lessons[index]._id); // required by Firefox
    },
    onDragOver: (e) => {
      if (dragIndex === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (overIndex !== index) setOverIndex(index);
    },
    onDrop: (e) => {
      e.preventDefault();
      if (dragIndex !== null) move(dragIndex, index);
      setDragIndex(null);
      setOverIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
      setOverIndex(null);
    },
  });

  const totalMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Lessons</h2>
          <p className="text-sm text-zinc-500">
            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
            {lessons.length > 0 && ` · ${formatDuration(totalMinutes)}`}
            {lessons.length > 1 && ' · drag to reorder'}
          </p>
        </div>
        {!adding && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => { setEditing(null); setAdding(true); }}>
            Add Lesson
          </Button>
        )}
      </div>

      {lessons.length === 0 && !adding && (
        <EmptyState
          icon={ListPlus}
          title="No lessons yet"
          text="Add your first lesson to start building this course."
          action={<Button icon={Plus} onClick={() => setAdding(true)}>Add Lesson</Button>}
        />
      )}

      {lessons.length > 0 && (
        <ol className="space-y-2">
          {lessons.map((lesson, i) =>
            editing?._id === lesson._id ? (
              <li key={lesson._id}>
                <Card className="border-indigo-200 p-5 ring-2 ring-indigo-500/10">
                  <LessonForm key={editing._id} title={`Edit lesson ${lessonNumber(i)}`} initial={editing}
                    onSubmit={saveLesson} onCancel={() => setEditing(null)} submitLabel="Save Lesson" />
                </Card>
              </li>
            ) : (
              <li
                key={lesson._id}
                {...dragProps(i)}
                className={`group flex items-center gap-3 rounded-xl border bg-white px-3 py-3 transition-all duration-200 ${
                  dragIndex === i ? 'opacity-40' : ''
                } ${
                  overIndex === i && dragIndex !== i
                    ? 'border-indigo-400 shadow-sm ring-2 ring-indigo-500/15'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <span className="cursor-grab text-zinc-300 transition-colors group-hover:text-zinc-500 active:cursor-grabbing" aria-hidden="true">
                  <GripVertical size={18} />
                </span>
                <span className="w-6 text-sm font-medium text-zinc-400 tabular-nums">{lessonNumber(i)}</span>
                {lesson.contentType === 'video'
                  ? <PlayCircle size={16} className="shrink-0 text-zinc-400" aria-label="Video" />
                  : <FileText size={16} className="shrink-0 text-zinc-400" aria-label="Text" />}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">{lesson.title}</span>
                <span className="hidden text-xs whitespace-nowrap text-zinc-500 sm:inline">{formatDuration(lesson.durationMinutes)}</span>
                <div className="flex items-center">
                  <Tooltip label="Move up">
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move ${lesson.title} up`}
                      disabled={i === 0} onClick={() => move(i, i - 1)}>
                      <ArrowUp size={15} />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Move down">
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move ${lesson.title} down`}
                      disabled={i === lessons.length - 1} onClick={() => move(i, i + 1)}>
                      <ArrowDown size={15} />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Edit">
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Edit ${lesson.title}`}
                      onClick={() => startEdit(lesson._id)}>
                      <Pencil size={15} />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${lesson.title}`} onClick={() => setDeleteTarget(lesson)}>
                      <Trash2 size={15} />
                    </Button>
                  </Tooltip>
                </div>
              </li>
            )
          )}
        </ol>
      )}

      {adding && (
        <Card className="mt-3 p-5">
          <LessonForm key="new" title="New lesson" onSubmit={addLesson} onCancel={() => setAdding(false)}
            submitLabel="Add Lesson" resetOnSubmit />
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete lesson?"
        description={deleteTarget && `"${deleteTarget.title}" will be permanently removed from this course.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
