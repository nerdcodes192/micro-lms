// Centered placeholder for empty lists: icon, title, text and an optional action (e.g. a <Button>).
export default function EmptyState({ icon: Icon, title, text, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center ${className}`}
    >
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
          <Icon size={22} />
        </span>
      )}
      <h3 className="mt-4 text-base font-semibold text-zinc-900">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-zinc-500">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
