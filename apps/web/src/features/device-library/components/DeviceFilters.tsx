import { Input, Badge } from '@netmd-studio/ui';
import {
  DEVICE_TYPE_LABELS,
  MANUFACTURERS,
  FEATURE_FILTERS,
  type DeviceFilters as Filters,
} from '../hooks/useDevices';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2xs font-medium text-studio-text-dim uppercase tracking-wider">{label}</span>
      <div className="flex flex-col gap-0.5">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 px-1.5 py-1 rounded-studio hover:bg-studio-surface-hover cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="w-3.5 h-3.5 rounded border-studio-border bg-studio-black accent-studio-cyan"
            />
            <span className="text-xs text-studio-text-muted">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function DeviceFiltersPanel({ filters, onChange }: Props) {
  const toggleArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const activeCount =
    filters.types.length +
    filters.manufacturers.length +
    filters.features.length +
    (filters.webusbOnly ? 1 : 0) +
    (filters.yearMin > 1992 || filters.yearMax < 2020 ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-studio-text">Filters</span>
        {activeCount > 0 && (
          <button
            onClick={() =>
              onChange({
                ...filters,
                types: [],
                manufacturers: [],
                features: [],
                yearMin: 1992,
                yearMax: 2020,
                webusbOnly: false,
              })
            }
            className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* WebUSB toggle */}
      <label className="flex items-center gap-2 px-1.5 py-2 rounded-studio bg-studio-surface border border-studio-border cursor-pointer">
        <input
          type="checkbox"
          checked={filters.webusbOnly}
          onChange={() => onChange({ ...filters, webusbOnly: !filters.webusbOnly })}
          className="w-3.5 h-3.5 rounded border-studio-border bg-studio-black accent-studio-cyan"
        />
        <span className="text-xs font-medium text-studio-cyan">WebUSB Compatible Only</span>
      </label>

      {/* Device Type */}
      <CheckboxGroup
        label="Device Type"
        options={Object.entries(DEVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        selected={filters.types}
        onToggle={(v) => onChange({ ...filters, types: toggleArray(filters.types, v) })}
      />

      {/* Manufacturer */}
      <CheckboxGroup
        label="Manufacturer"
        options={MANUFACTURERS.map((m) => ({ value: m, label: m }))}
        selected={filters.manufacturers}
        onToggle={(v) => onChange({ ...filters, manufacturers: toggleArray(filters.manufacturers, v) })}
      />

      {/* Features */}
      <CheckboxGroup
        label="Features"
        options={FEATURE_FILTERS.map((f) => ({ value: f.key, label: f.label }))}
        selected={filters.features}
        onToggle={(v) => onChange({ ...filters, features: toggleArray(filters.features, v) })}
      />

      {/* Year Range */}
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-medium text-studio-text-dim uppercase tracking-wider">Year Released</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1992}
            max={2020}
            value={filters.yearMin}
            onChange={(e) => onChange({ ...filters, yearMin: Number(e.target.value) })}
            className="w-20 text-center"
          />
          <span className="text-xs text-studio-text-dim">to</span>
          <Input
            type="number"
            min={1992}
            max={2020}
            value={filters.yearMax}
            onChange={(e) => onChange({ ...filters, yearMax: Number(e.target.value) })}
            className="w-20 text-center"
          />
        </div>
      </div>

      {/* Active filter badges */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-studio-border">
          {filters.types.map((t) => (
            <Badge
              key={t}
              variant="cyan"
              className="cursor-pointer"
              onClick={() => onChange({ ...filters, types: filters.types.filter((v) => v !== t) })}
            >
              {DEVICE_TYPE_LABELS[t]} ×
            </Badge>
          ))}
          {filters.manufacturers.map((m) => (
            <Badge
              key={m}
              variant="amber"
              className="cursor-pointer"
              onClick={() => onChange({ ...filters, manufacturers: filters.manufacturers.filter((v) => v !== m) })}
            >
              {m} ×
            </Badge>
          ))}
          {filters.features.map((f) => (
            <Badge
              key={f}
              variant="green"
              className="cursor-pointer"
              onClick={() => onChange({ ...filters, features: filters.features.filter((v) => v !== f) })}
            >
              {FEATURE_FILTERS.find((ff) => ff.key === f)?.label} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
