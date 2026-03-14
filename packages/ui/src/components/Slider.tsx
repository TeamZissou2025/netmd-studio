import { type InputHTMLAttributes, forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, showValue, formatValue, className = '', value, ...props }, ref) => {
    const displayValue = formatValue ? formatValue(Number(value)) : String(value);

    return (
      <div className="flex flex-col gap-1">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && <span className="text-nav font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>}
            {showValue && <span className="text-label font-mono" style={{ color: 'var(--accent)' }}>{displayValue}</span>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${className}`}
          style={{ background: 'var(--surface-3)', accentColor: 'var(--accent)' }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
