import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'cta';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: 'var(--accent)', color: 'white' },
  secondary: { background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  danger: { background: 'var(--error)', color: 'white' },
  ghost: { background: 'transparent', color: 'var(--text-secondary)' },
  cta: { background: 'var(--warm)', color: 'white' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', style, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`h-9 px-4 text-nav rounded-md font-medium transition-all duration-200 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${className}`}
        style={{ ...variantStyles[variant], ...style }}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
