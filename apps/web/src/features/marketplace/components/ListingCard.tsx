import { Link } from 'react-router';
import { Heart, MapPin } from 'lucide-react';
import { Badge } from '@netmd-studio/ui';
import { formatPrice, formatRelativeTime } from '@netmd-studio/utils';
import type { ListingWithSeller } from '../hooks/useListings';
import { CONDITION_LABELS, CONDITION_VARIANTS } from '../hooks/useListings';

interface ListingCardProps {
  listing: ListingWithSeller;
  isFavorited: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function ListingCard({ listing, isFavorited, onToggleFavorite }: ListingCardProps) {
  const firstImage = listing.images?.[0];

  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className="bg-[var(--surface-1)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--border-hover)] transition-colors group"
    >
      {/* Image */}
      <div className="aspect-square bg-[var(--surface-0)] relative overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--border)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(listing.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--surface-0)] backdrop-blur-sm flex items-center justify-center hover:bg-[var(--surface-0)] transition-colors"
          >
            <Heart
              size={14}
              className={isFavorited ? 'fill-[var(--pillar-transfer)] text-[var(--pillar-transfer)]' : 'text-[var(--text-secondary)]'}
            />
          </button>
        )}

        {/* Condition badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant={CONDITION_VARIANTS[listing.condition]}>
            {CONDITION_LABELS[listing.condition]}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-nav font-medium text-[var(--text-primary)] truncate">{listing.title}</h3>
        <p className="text-studio-title font-semibold text-[var(--success)] mt-1">
          {formatPrice(listing.price_cents, listing.currency)}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {listing.seller?.avatar_url ? (
              <img src={listing.seller.avatar_url} alt="" className="w-4 h-4 rounded-full" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-[var(--surface-3)]" />
            )}
            <span className="text-tag text-[var(--text-secondary)] truncate">
              {listing.seller?.display_name || 'Seller'}
            </span>
          </div>
          <span className="text-tag text-[var(--text-tertiary)] flex-shrink-0">
            {formatRelativeTime(listing.created_at)}
          </span>
        </div>
        {listing.shipping_price_cents === 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin size={10} className="text-[var(--success)]" />
            <span className="text-tag text-[var(--success)]">Free shipping</span>
          </div>
        )}
      </div>
    </Link>
  );
}
