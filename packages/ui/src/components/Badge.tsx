import { type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'cyan' | 'magenta' | 'amber' | 'green' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-studio-surface-active text-studio-text-muted border-studio-border',
  cyan: 'bg-studio-cyan-muted text-studio-cyan border-studio-cyan-border',
  magenta: 'bg-studio-magenta-muted text-studio-magenta border-studio-magenta/20',
  amber: 'bg-amber-500/10 text-studio-warning border-amber-500/20',
  green: 'bg-emerald-500/10 text-studio-success border-emerald-500/20',
  error: 'bg-red-500/10 text-studio-error border-red-500/20',
};

export function Badge({ variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-2xs font-medium rounded border ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
