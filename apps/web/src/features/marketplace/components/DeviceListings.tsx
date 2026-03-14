import { Link } from 'react-router';
import { Card, Badge, Skeleton } from '@netmd-studio/ui';
import { formatPrice } from '@netmd-studio/utils';
import { useDeviceListings } from '../hooks/useListings';
import { CONDITION_LABELS, CONDITION_VARIANTS } from '../hooks/useListings';

interface DeviceListingsProps {
  deviceId: string;
}

export function DeviceListings({ deviceId }: DeviceListingsProps) {
  const { listings, loading } = useDeviceListings(deviceId);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <>
        <p className="text-nav text-[var(--text-tertiary)]">No active listings for this device</p>
        <Link
          to={`/marketplace?device=${deviceId}`}
          className="text-tag text-[var(--accent)] hover:text-[var(--accent)] transition-colors mt-2 inline-block"
        >
          Search marketplace
        </Link>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          to={`/marketplace/${listing.id}`}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-[var(--surface-2)] transition-colors group"
        >
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded bg-[var(--surface-0)] border border-[var(--border)] overflow-hidden flex-shrink-0">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--surface-1)]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-label text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
              {listing.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-label font-semibold text-[var(--success)]">
                {formatPrice(listing.price_cents, listing.currency)}
              </span>
              <Badge variant={CONDITION_VARIANTS[listing.condition]} className="text-tag">
                {CONDITION_LABELS[listing.condition]}
              </Badge>
            </div>
          </div>
        </Link>
      ))}

      <Link
        to={`/marketplace?device=${deviceId}`}
        className="text-tag text-[var(--accent)] hover:text-[var(--accent)] transition-colors text-center pt-1"
      >
        View all listings
      </Link>
    </div>
  );
}
