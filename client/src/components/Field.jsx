// Form controls. Wrap any control in <Field label> for a label, hint and error line.
export const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-500';

export function Field({ label, hint, error, htmlFor, className = '', children }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`${inputClass} h-9 ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputClass} leading-6 ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputClass} h-9 pr-8 ${className}`} {...props}>
      {children}
    </select>
  );
}
