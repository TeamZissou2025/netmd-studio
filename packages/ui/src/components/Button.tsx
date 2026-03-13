import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-studio-cyan text-studio-black hover:bg-studio-cyan-hover',
  secondary: 'bg-studio-surface text-studio-text border border-studio-cyan-border hover:bg-studio-surface-hover',
  danger: 'bg-studio-magenta text-white hover:bg-studio-magenta-hover',
  ghost: 'bg-transparent text-studio-text-muted hover:text-studio-text hover:bg-studio-surface-hover',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`h-8 px-3 text-sm rounded-studio font-medium transition-colors duration-150 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-cyan focus-visible:ring-offset-1 focus-visible:ring-offset-studio-black ${variantClasses[variant]} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
