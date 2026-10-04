import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700',
  secondary: 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
};

const sizes = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-9 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-base',
  icon: 'h-9 w-9',
};

export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
}

// <Button>, or a router <Link> styled as a button when `to` is given.
export default function Button({
  variant, size, className, to, icon: Icon, iconRight: IconRight, loading, disabled, children, ...props
}) {
  const cls = buttonClass({ variant, size, className });
  const iconSize = size === 'lg' ? 18 : 16;
  const content = (
    <>
      {loading ? <Loader2 size={iconSize} className="animate-spin" /> : Icon && <Icon size={iconSize} />}
      {children}
      {IconRight && <IconRight size={iconSize} />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={loading || disabled} {...props}>
      {content}
    </button>
  );
}
