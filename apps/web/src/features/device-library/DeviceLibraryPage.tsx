import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { Search, SlidersHorizontal, Plus, X, Database } from 'lucide-react';
import { Input, Button, Skeleton } from '@netmd-studio/ui';
import { useDevices, DEFAULT_FILTERS, type DeviceFilters } from './hooks/useDevices';
import { DeviceCard } from './components/DeviceCard';
import { DeviceFiltersPanel } from './components/DeviceFilters';
import { useAuth } from '../../hooks/useAuth';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'year_newest', label: 'Newest First' },
  { value: 'year_oldest', label: 'Oldest First' },
  { value: 'manufacturer', label: 'Manufacturer' },
] as const;

export function DeviceLibraryPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<DeviceFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedSearch = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setFilters((f) => ({ ...f, search: value }));
      }, 300);
    };
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  const { devices, loading, error } = useDevices(filters);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-studio-text">Device Library</h1>
          <p className="text-sm text-studio-text-muted mt-0.5">
            Community-maintained database of MiniDisc hardware
          </p>
        </div>
        {user && (
          <Link to="/devices/submit">
            <Button variant="secondary" className="gap-1.5">
              <Plus size={14} />
              Submit Device
            </Button>
          </Link>
        )}
      </div>

      {/* Search + Sort bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-text-dim" />
          <Input
            placeholder="Search devices..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-8 w-full"
          />
        </div>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as DeviceFilters['sort'] }))}
          className="h-8 bg-studio-black border border-studio-border rounded-studio px-2 text-sm text-studio-text focus:border-studio-cyan outline-none appearance-none pr-7 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238888a0%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_6px_center] bg-no-repeat"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden h-8 px-3 bg-studio-surface border border-studio-border rounded-studio text-sm text-studio-text-muted hover:text-studio-text transition-colors"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex gap-6">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <DeviceFiltersPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Device grid */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="p-4 bg-studio-error/10 border border-studio-error/20 rounded-studio-lg text-sm text-studio-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-studio-surface border border-studio-border rounded-studio-lg p-4">
                  <Skeleton className="aspect-[4/3] mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Database size={40} className="text-studio-border mb-4" />
              <p className="text-md font-medium text-studio-text-muted mb-1">No devices found</p>
              <p className="text-sm text-studio-text-dim">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-studio-text-dim mb-3">
                {devices.length} device{devices.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-studio-surface border-t border-studio-border rounded-t-studio-xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-studio-text">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-studio-text-muted hover:text-studio-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <DeviceFiltersPanel filters={filters} onChange={setFilters} />
            <div className="sticky bottom-0 pt-4 mt-4 border-t border-studio-border bg-studio-surface">
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full"
              >
                Show {devices.length} result{devices.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
