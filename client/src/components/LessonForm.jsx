import { useState } from 'react';
import { input, button, buttonLight } from './ui.js';

const blank = { title: '', contentType: 'text', body: '', durationMinutes: 5 };

// Add / edit form for a single lesson.
export default function LessonForm({ title, initial = blank, onSubmit, onCancel, submitLabel, resetOnSubmit }) {
  const [form, setForm] = useState({
    title: initial.title,
    contentType: initial.contentType,
    body: initial.body,
    durationMinutes: initial.durationMinutes,
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onSubmit({ ...form, durationMinutes: Number(form.durationMinutes) });
    if (ok && resetOnSubmit) setForm(blank);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded bg-white p-6 shadow">
      <h3 className="font-semibold">{title}</h3>
      <input className={input} placeholder="Lesson title" required value={form.title} onChange={update('title')} />
      <div className="flex gap-3">
        <select className={input} value={form.contentType} onChange={update('contentType')}>
          <option value="text">Text</option>
          <option value="video">Video (URL)</option>
        </select>
        <input className={input} type="number" min={1} required placeholder="Minutes"
          value={form.durationMinutes} onChange={update('durationMinutes')} />
      </div>
      {form.contentType === 'text' ? (
        <textarea className={input} rows={6} placeholder="Lesson text" required
          value={form.body} onChange={update('body')} />
      ) : (
        <input className={input} type="url" placeholder="https://www.youtube.com/watch?v=…" required
          value={form.body} onChange={update('body')} />
      )}
      <div className="flex gap-2">
        <button className={button}>{submitLabel}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonLight}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
