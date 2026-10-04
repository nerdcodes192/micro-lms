// White surface with a hairline border. `interactive` adds a hover lift for clickable cards.
export default function Card({ as: Tag = 'div', interactive, className = '', children, ...props }) {
  const hover = interactive ? 'transition-all duration-200 hover:border-zinc-300 hover:shadow-sm' : '';
  return (
    <Tag className={`rounded-xl border border-zinc-200 bg-white ${hover} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
