import { X } from 'lucide-react';
import { Button, Select, Slider } from '@netmd-studio/ui';
import { formatPrice } from '@netmd-studio/utils';
import type { ListingCategory, ListingCondition } from '@netmd-studio/types';
import { CATEGORY_LABELS, CONDITION_LABELS } from '../hooks/useListings';
import type { ListingFilters as ListingFiltersType } from '../hooks/useListings';

interface ListingFiltersProps {
  filters: ListingFiltersType;
  onChange: (filters: ListingFiltersType) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ListingCategory[];
const ALL_CONDITIONS = Object.keys(CONDITION_LABELS) as ListingCondition[];

export function ListingFiltersPanel({ filters, onChange, onClose, isMobile }: ListingFiltersProps) {
  const toggleCategory = (cat: ListingCategory) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const toggleCondition = (cond: ListingCondition) => {
    const next = filters.conditions.includes(cond)
      ? filters.conditions.filter((c) => c !== cond)
      : [...filters.conditions, cond];
    onChange({ ...filters, conditions: next });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.conditions.length > 0 ||
    filters.priceMin > 0 ||
    filters.priceMax < 100000 ||
    filters.domesticOnly;

  return (
    <div className={isMobile ? 'p-4' : ''}>
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-studio-text">Filters</h2>
          <button onClick={onClose} className="text-studio-text-muted hover:text-studio-text">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Sort */}
        <Select
          label="Sort by"
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as ListingFiltersType['sort'] })}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'price_low', label: 'Price: low to high' },
            { value: 'price_high', label: 'Price: high to low' },
          ]}
        />

        {/* Category */}
        <div>
          <span className="text-sm font-medium text-studio-text-muted block mb-2">Category</span>
          <div className="flex flex-col gap-1">
            {ALL_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="rounded border-studio-border bg-studio-black text-studio-cyan focus:ring-studio-cyan-border accent-studio-cyan w-3.5 h-3.5"
                />
                <span className="text-xs text-studio-text-muted">{CATEGORY_LABELS[cat]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <span className="text-sm font-medium text-studio-text-muted block mb-2">Condition</span>
          <div className="flex flex-col gap-1">
            {ALL_CONDITIONS.map((cond) => (
              <label key={cond} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.conditions.includes(cond)}
                  onChange={() => toggleCondition(cond)}
                  className="rounded border-studio-border bg-studio-black text-studio-cyan focus:ring-studio-cyan-border accent-studio-cyan w-3.5 h-3.5"
                />
                <span className="text-xs text-studio-text-muted">{CONDITION_LABELS[cond]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <span className="text-sm font-medium text-studio-text-muted block mb-2">Price range</span>
          <div className="flex flex-col gap-3">
            <Slider
              label="Min"
              min={0}
              max={50000}
              step={500}
              value={filters.priceMin}
              onChange={(e) => onChange({ ...filters, priceMin: Number(e.target.value) })}
              showValue
              formatValue={(v) => formatPrice(v)}
            />
            <Slider
              label="Max"
              min={0}
              max={100000}
              step={500}
              value={filters.priceMax}
              onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
              showValue
              formatValue={(v) => formatPrice(v)}
            />
          </div>
        </div>

        {/* Shipping */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.domesticOnly}
            onChange={(e) => onChange({ ...filters, domesticOnly: e.target.checked })}
            className="rounded border-studio-border bg-studio-black text-studio-cyan focus:ring-studio-cyan-border accent-studio-cyan w-3.5 h-3.5"
          />
          <span className="text-sm text-studio-text-muted">Domestic shipping only</span>
        </label>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={() =>
              onChange({
                ...filters,
                categories: [],
                conditions: [],
                priceMin: 0,
                priceMax: 100000,
                domesticOnly: false,
              })
            }
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
