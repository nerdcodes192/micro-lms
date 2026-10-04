import { Link } from 'react-router-dom';
import { Check, Play, Lock, Circle } from 'lucide-react';
import { isLocked } from '../lessonLocks.js';
import { formatDuration, lessonNumber } from '../format.js';

const icons = {
  completed: <Check size={14} strokeWidth={3} className="text-emerald-600" />,
  current: <Play size={12} fill="currentColor" className="text-indigo-600" />,
  locked: <Lock size={13} className="text-zinc-400" />,
  incomplete: <Circle size={14} className="text-zinc-300" />,
};

const chip = {
  completed: 'bg-emerald-50',
  current: 'bg-indigo-100',
  locked: 'bg-zinc-100',
  incomplete: 'bg-white ring-1 ring-zinc-200',
};

// One lesson line. state: 'completed' | 'current' | 'locked' | 'incomplete'. `to` makes it a link.
export function LessonRow({ lesson, index, state = 'incomplete', to, compact = false }) {
  const pad = compact ? 'px-3 py-2' : 'px-4 py-3.5';
  const tone =
    state === 'current'
      ? 'bg-indigo-50 text-indigo-900'
      : state === 'locked'
        ? 'text-zinc-400'
        : 'text-zinc-800';
  const body = (
    <>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${chip[state]}`}>
        {icons[state]}
      </span>
      <span className="w-6 shrink-0 text-xs font-medium text-zinc-400 tabular-nums">{lessonNumber(index)}</span>
      <span className={`min-w-0 flex-1 truncate text-sm ${state === 'current' ? 'font-semibold' : 'font-medium'}`}>
        {lesson.title}
      </span>
      {lesson.durationMinutes != null && (
        <span className="shrink-0 text-xs text-zinc-400 tabular-nums">{formatDuration(lesson.durationMinutes)}</span>
      )}
    </>
  );
  const base = `flex items-center gap-3 rounded-lg ${pad} ${tone}`;
  if (to && state !== 'locked') {
    return (
      <Link
        to={to}
        className={`${base} transition-colors ${state === 'current' ? '' : 'hover:bg-zinc-50'}`}
        aria-current={state === 'current' ? 'step' : undefined}
      >
        {body}
      </Link>
    );
  }
  return (
    <div className={`${base} ${state === 'locked' ? 'cursor-not-allowed' : ''}`} title={state === 'locked' ? 'Complete the previous lesson to unlock' : undefined}>
      {body}
    </div>
  );
}

// Ordered lesson list that derives each row's state.
// completedIds: ids done; currentId: highlighted lesson; enforceLocks: lock lessons after the first
// incomplete one (lessonLocks.js); getHref(lesson) → url or null (null = not clickable).
export function LessonList({ lessons, completedIds = [], currentId, enforceLocks = false, getHref, compact = false, emptyText = 'No lessons yet.' }) {
  if (!lessons.length) return <p className="px-4 py-6 text-center text-sm text-zinc-500">{emptyText}</p>;
  const done = completedIds.map(String);
  return (
    <ol className="space-y-0.5">
      {lessons.map((lesson, i) => {
        const id = String(lesson._id);
        // Locked wins, then the open/next lesson, then completed.
        const state =
          enforceLocks && isLocked(lessons, i, done)
            ? 'locked'
            : id === String(currentId)
              ? 'current'
              : done.includes(id)
                ? 'completed'
                : 'incomplete';
        return (
          <li key={id}>
            <LessonRow lesson={lesson} index={i} state={state} to={getHref?.(lesson)} compact={compact} />
          </li>
        );
      })}
    </ol>
  );
}

export default LessonList;
