import { type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'cyan' | 'magenta' | 'amber' | 'green' | 'error' | 'accent';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  accent: { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-accent)' },
  cyan: { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-accent)' },
  magenta: { background: 'rgba(196,64,106,0.1)', color: 'var(--pillar-transfer)', border: '1px solid rgba(196,64,106,0.2)' },
  amber: { background: 'rgba(196,122,10,0.1)', color: 'var(--pillar-device)', border: '1px solid rgba(196,122,10,0.2)' },
  green: { background: 'rgba(26,158,110,0.1)', color: 'var(--pillar-market)', border: '1px solid rgba(26,158,110,0.2)' },
  error: { background: 'rgba(212,55,28,0.1)', color: 'var(--error)', border: '1px solid rgba(212,55,28,0.2)' },
};

export function Badge({ variant = 'default', className = '', style, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-tag font-mono uppercase tracking-wider rounded ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}
