export default function ProgressBar({ percent }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded bg-slate-200">
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-10 text-right text-sm text-slate-600">{percent}%</span>
    </div>
  );
}
