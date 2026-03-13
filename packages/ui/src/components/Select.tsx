import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-studio-text-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`h-8 bg-studio-black border border-studio-border rounded-studio px-2 text-sm text-studio-text focus:border-studio-cyan focus:ring-1 focus:ring-studio-cyan-border outline-none transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238888a0%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_6px_center] bg-no-repeat pr-7 ${error ? 'border-studio-error' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-studio-black text-studio-text-dim">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-studio-black text-studio-text">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-2xs text-studio-error">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
