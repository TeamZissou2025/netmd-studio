import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, Plus, ShoppingBag } from 'lucide-react';
import { Button, Skeleton } from '@netmd-studio/ui';
import { useAuth } from '../../hooks/useAuth';
import { useListings, DEFAULT_LISTING_FILTERS } from './hooks/useListings';
import { useFavorites } from './hooks/useFavorites';
import { ListingCard } from './components/ListingCard';
import { ListingFiltersPanel } from './components/ListingFilters';
import { SEOHead } from '../../app/SEOHead';
import type { ListingFilters } from './hooks/useListings';

export function MarketplacePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('device');

  const [filters, setFilters] = useState<ListingFilters>({
    ...DEFAULT_LISTING_FILTERS,
    deviceId: deviceId || null,
  });
  const [searchInput, setSearchInput] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { listings, loading } = useListings(filters);
  const { favoriteIds, toggleFavorite } = useFavorites(user?.id);

  return (
    <div className="flex flex-col gap-6">
      <SEOHead title="Marketplace" description="Buy and sell MiniDisc hardware, discs, and accessories on NetMD Studio." />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Marketplace</h1>
          <p className="text-nav text-[var(--text-secondary)] mt-1">
            Buy and sell MiniDisc hardware, discs, and accessories
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Link to="/marketplace/sell">
              <Button>
                <Plus size={14} />
                Sell item
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search + mobile filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search listings..."
            className="w-full h-8 bg-[var(--surface-0)] border border-[var(--border)] rounded-md pl-8 pr-3 text-nav text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-accent)] outline-none"
          />
        </div>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden h-8 px-3 bg-[var(--surface-1)] border border-[var(--border)] rounded-md text-nav text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors flex items-center gap-1.5"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Main content with sidebar */}
      <div className="flex gap-6">
        {/* Desktop filters sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-6">
            <ListingFiltersPanel filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* Listings grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBag size={48} className="text-[var(--border)] mb-4" />
              <p className="text-body text-[var(--text-secondary)]">No listings found</p>
              <p className="text-nav text-[var(--text-tertiary)] mt-1">
                {filters.search ? 'Try different search terms' : 'Be the first to sell something'}
              </p>
              {user && (
                <Link to="/marketplace/sell" className="mt-4">
                  <Button variant="secondary">
                    <Plus size={14} />
                    Create listing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favoriteIds.has(listing.id)}
                  onToggleFavorite={user ? toggleFavorite : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--surface-1)] border-l border-[var(--border)] overflow-y-auto">
            <ListingFiltersPanel
              filters={filters}
              onChange={setFilters}
              onClose={() => setMobileFiltersOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}
