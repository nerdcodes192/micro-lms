// Animated progress bar. `showLabel` prints "62%" to the right.
export default function ProgressBar({ percent = 0, showLabel = false, size = 'md', className = '' }) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-2.5' : 'h-2';
  const fill = value === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${height} flex-1 overflow-hidden rounded-full bg-zinc-100`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${height} rounded-full ${fill} transition-[width] duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 text-right text-sm font-medium text-zinc-600 tabular-nums">{value}%</span>
      )}
    </div>
  );
}
