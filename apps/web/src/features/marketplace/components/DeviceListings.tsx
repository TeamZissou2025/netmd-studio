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
        <p className="text-sm text-studio-text-dim">No active listings for this device</p>
        <Link
          to={`/marketplace?device=${deviceId}`}
          className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors mt-2 inline-block"
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
          className="flex items-center gap-3 p-2 rounded-studio hover:bg-studio-surface-hover transition-colors group"
        >
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded bg-studio-black border border-studio-border overflow-hidden flex-shrink-0">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-studio-surface" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-studio-text truncate group-hover:text-studio-cyan transition-colors">
              {listing.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-studio-success">
                {formatPrice(listing.price_cents, listing.currency)}
              </span>
              <Badge variant={CONDITION_VARIANTS[listing.condition]} className="text-2xs">
                {CONDITION_LABELS[listing.condition]}
              </Badge>
            </div>
          </div>
        </Link>
      ))}

      <Link
        to={`/marketplace?device=${deviceId}`}
        className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors text-center pt-1"
      >
        View all listings
      </Link>
    </div>
  );
}
