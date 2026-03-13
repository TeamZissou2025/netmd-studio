import { type InputHTMLAttributes, forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, showValue, formatValue, className = '', value, ...props }, ref) => {
    const displayValue = formatValue
      ? formatValue(Number(value))
      : String(value);

    return (
      <div className="flex flex-col gap-1">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && <span className="text-sm font-medium text-studio-text-muted">{label}</span>}
            {showValue && <span className="text-xs font-mono text-studio-cyan">{displayValue}</span>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={`w-full h-1.5 bg-studio-border rounded-full appearance-none cursor-pointer accent-studio-cyan [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-studio-cyan [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-studio [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-studio-cyan [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
