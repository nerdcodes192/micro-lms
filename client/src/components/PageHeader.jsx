// Page title block: optional `eyebrow` (e.g. back link) above, title + subtitle left, actions right.
export default function PageHeader({ title, subtitle, actions, eyebrow, className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      {eyebrow && <div className="mb-3">{eyebrow}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-zinc-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
