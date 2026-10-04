import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

// Click-to-open menu. items: [{ label, icon, to } | { label, icon, onClick, danger }].
// Closes on item click, outside click or Escape. Default trigger is a "•••" icon button.
export default function DropdownMenu({ items, label = 'Actions', align = 'right', trigger }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const itemClass = (danger) =>
    `flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
      danger ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
    }`;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        {trigger || <MoreHorizontal size={18} />}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-1 min-w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.filter(Boolean).map(({ label: text, icon: Icon, to, onClick, danger }) => {
            const content = (
              <>
                {Icon && <Icon size={15} className="shrink-0" />}
                {text}
              </>
            );
            return to ? (
              <Link key={text} to={to} role="menuitem" className={itemClass(danger)} onClick={() => setOpen(false)}>
                {content}
              </Link>
            ) : (
              <button
                key={text}
                type="button"
                role="menuitem"
                className={itemClass(danger)}
                onClick={() => {
                  setOpen(false);
                  onClick?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
