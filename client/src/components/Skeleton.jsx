// Pulsing grey block; size it with className (e.g. "h-4 w-32").
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200/70 ${className}`} />;
}
