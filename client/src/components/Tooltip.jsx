// CSS-only tooltip shown on hover / keyboard focus of the wrapped element.
export default function Tooltip({ label, side = 'top', children }) {
  const pos = side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5';
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 ${pos} rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-focus-within/tip:opacity-100 group-hover/tip:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}
