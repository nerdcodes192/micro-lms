import { useId, useState } from 'react';
import { FileText, PlayCircle } from 'lucide-react';
import Button from './Button.jsx';
import { Field, Input, Textarea } from './Field.jsx';

const blank = { title: '', contentType: 'text', body: '', durationMinutes: 5 };

// Two-or-more option toggle (radio group semantics). options: [{ value, label, icon }].
export function SegmentedControl({ value, onChange, options, label, disabled }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5">
      {options.map(({ value: v, label: text, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !active && onChange(v)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
              active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {Icon && <Icon size={15} />}
            {text}
          </button>
        );
      })}
    </div>
  );
}

// Add / edit form for a single lesson. onSubmit(fields) resolves to true on success.
export default function LessonForm({ title, initial = blank, onSubmit, onCancel, submitLabel, resetOnSubmit }) {
  const uid = useId();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial.title,
    contentType: initial.contentType,
    body: initial.body,
    durationMinutes: initial.durationMinutes,
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const update = (field) => (e) => set(field, e.target.value);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit({ ...form, durationMinutes: Number(form.durationMinutes) });
    setSaving(false);
    if (ok && resetOnSubmit) setForm(blank);
  }

  const isText = form.contentType === 'text';
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title && <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>}
      <Field label="Lesson title" htmlFor={`${uid}-title`}>
        <Input id={`${uid}-title`} required placeholder="e.g. Setting up your environment"
          value={form.title} onChange={update('title')} />
      </Field>
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Type">
          <SegmentedControl
            label="Lesson type"
            value={form.contentType}
            onChange={(v) => set('contentType', v)}
            options={[
              { value: 'text', label: 'Text', icon: FileText },
              { value: 'video', label: 'Video', icon: PlayCircle },
            ]}
          />
        </Field>
        <Field label="Duration (min)" htmlFor={`${uid}-duration`} className="w-36">
          <Input id={`${uid}-duration`} type="number" min={1} required
            value={form.durationMinutes} onChange={update('durationMinutes')} />
        </Field>
      </div>
      {isText ? (
        <Field label="Lesson content" htmlFor={`${uid}-body`}>
          <Textarea id={`${uid}-body`} rows={6} required placeholder="Write the lesson text…"
            value={form.body} onChange={update('body')} />
        </Field>
      ) : (
        <Field label="Video URL" htmlFor={`${uid}-body`} hint="YouTube links are embedded; other links open externally.">
          <Input id={`${uid}-body`} type="url" required placeholder="https://www.youtube.com/watch?v=…"
            value={form.body} onChange={update('body')} />
        </Field>
      )}
      <div className="flex gap-2">
        <Button type="submit" loading={saving}>{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
