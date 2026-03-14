import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ active, hoverable, className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl p-4 transition-all duration-300 ${hoverable ? 'cursor-pointer' : ''} ${className}`}
        style={{
          background: active ? 'var(--accent-dim)' : 'var(--surface-1)',
          border: active ? '1px solid var(--border-accent)' : '1px solid var(--border)',
          ...style,
        }}
        onMouseEnter={hoverable ? (e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
          }
        } : undefined}
        onMouseLeave={hoverable ? (e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-1)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          }
        } : undefined}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
