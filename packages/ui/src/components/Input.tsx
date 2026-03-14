import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, style, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-10 rounded-md px-3 text-body outline-none transition-all duration-200 ${className}`}
          style={{
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border)',
            boxShadow: error ? '0 0 0 3px rgba(212, 55, 28, 0.1)' : undefined,
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--border)';
            e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(212, 55, 28, 0.1)' : 'none';
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && <span className="text-tag font-mono" style={{ color: 'var(--error)' }}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
