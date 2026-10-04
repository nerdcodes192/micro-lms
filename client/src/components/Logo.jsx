import { GraduationCap } from 'lucide-react';

// Learnly wordmark. `inverted` for dark/gradient backgrounds.
export default function Logo({ inverted = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          inverted ? 'bg-white/15 text-white ring-1 ring-white/25' : 'bg-indigo-600 text-white'
        }`}
      >
        <GraduationCap size={16} strokeWidth={2.25} />
      </span>
      <span className={`text-[15px] font-semibold tracking-tight ${inverted ? 'text-white' : 'text-zinc-900'}`}>
        Learnly
      </span>
    </span>
  );
}
