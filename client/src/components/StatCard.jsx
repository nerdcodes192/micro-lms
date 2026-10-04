import Card from './Card.jsx';

// KPI tile: icon chip, big value, label, optional small context line.
export default function StatCard({ icon: Icon, label, value, context }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">{value}</p>
      {context && <p className="mt-1 text-xs text-zinc-500">{context}</p>}
    </Card>
  );
}
