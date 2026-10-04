import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

// Split auth screen: brand panel on lg+, centered form card on the right.
export default function AuthLayout({ title, subtitle, footer, children }) {
  useEffect(() => {
    document.title = `${title} · Learnly`;
  }, [title]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-12 text-white lg:flex lg:flex-col">
        {/* Abstract geometry: soft rings + grid, purely decorative. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden="true">
          <defs>
            <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-[28rem] w-[28rem] rounded-full border border-white/20" />
        <div className="pointer-events-none absolute -right-12 -bottom-12 h-72 w-72 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute right-24 bottom-24 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <Link to="/" className="relative">
          <Logo inverted />
        </Link>
        <div className="relative mt-auto max-w-md">
          <p className="text-4xl leading-tight font-semibold tracking-tight">Learning, without the clutter.</p>
          <p className="mt-4 text-indigo-100">
            Short, focused courses. Track your progress, pick up where you left off, and earn a certificate when you
            finish.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-zinc-500">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
