import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, style, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`h-10 rounded-md px-3 pr-8 text-body outline-none transition-all duration-200 appearance-none ${className}`}
          style={{
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border)',
            backgroundImage: `url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B6B6B%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')`,
            backgroundSize: '16px',
            backgroundPosition: 'right 8px center',
            backgroundRepeat: 'no-repeat',
            ...style,
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <span className="text-tag font-mono" style={{ color: 'var(--error)' }}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
