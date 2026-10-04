import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AppSidebar from './AppSidebar.jsx';

// Hamburger button (< lg only) that opens the sidebar as a slide-in drawer.
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]); // close after navigating

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Portalled to <body>: the sticky header's backdrop-blur would otherwise trap a fixed overlay.
  const drawer = (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 lg:hidden print:hidden ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      inert={!open}
    >
      <div className="absolute inset-0 bg-zinc-900/40" onClick={() => setOpen(false)} />
      <aside
        className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-zinc-200 shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
        >
          <X size={18} />
        </button>
        <AppSidebar />
      </aside>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        <Menu size={20} />
      </button>
      {createPortal(drawer, document.body)}
    </div>
  );
}
