import { Check } from 'lucide-react';

const tones = {
  zinc: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};

export function Badge({ tone = 'zinc', icon: Icon, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

const statuses = {
  draft: { tone: 'amber', label: 'Draft' },
  published: { tone: 'emerald', label: 'Published' },
  unpublished: { tone: 'amber', label: 'Unpublished' },
  completed: { tone: 'emerald', label: 'Completed', icon: Check },
  'in-progress': { tone: 'indigo', label: 'In progress' },
  'not-started': { tone: 'zinc', label: 'Not started' },
};

// Maps a known status key to its colour + label.
export function StatusBadge({ status, className }) {
  const s = statuses[status] || { tone: 'zinc', label: status };
  return (
    <Badge tone={s.tone} icon={s.icon} className={className}>
      {s.label}
    </Badge>
  );
}

// Progress percent → 'not-started' | 'in-progress' | 'completed'.
export function progressStatus(percent) {
  if (percent >= 100) return 'completed';
  return percent > 0 ? 'in-progress' : 'not-started';
}
