import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ active, hoverable, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-studio-surface border rounded-studio-lg p-4 ${
          active
            ? 'border-studio-cyan-border bg-studio-cyan-muted'
            : 'border-studio-border'
        } ${hoverable ? 'hover:border-studio-border-bright transition-colors cursor-pointer' : ''} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
