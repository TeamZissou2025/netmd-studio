import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft, Heart, Star, MapPin, Shield, ExternalLink,
  ShoppingCart, AlertCircle,
} from 'lucide-react';
import { Button, Badge, Card, Skeleton } from '@netmd-studio/ui';
import { formatPrice, formatRelativeTime } from '@netmd-studio/utils';
import { useAuth } from '../../hooks/useAuth';
import { useListing, CATEGORY_LABELS, CONDITION_LABELS, CONDITION_VARIANTS } from './hooks/useListings';
import { useFavorites } from './hooks/useFavorites';
import { ImageGallery } from './components/ImageGallery';
import { SEOHead, ListingStructuredData } from '../../app/SEOHead';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listing, loading, error } = useListing(id);
  const { favoriteIds, toggleFavorite } = useFavorites(user?.id);
  const [purchasing, setPurchasing] = useState(false);

  const isOwner = user?.id === listing?.seller_id;
  const isFavorited = listing ? favoriteIds.has(listing.id) : false;

  const handleBuyNow = useCallback(async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!listing) return;

    setPurchasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to purchase');
        setPurchasing(false);
        return;
      }

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listing_id: listing.id }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error || 'Failed to start checkout');
        setPurchasing(false);
        return;
      }

      const { clientSecret } = await res.json();
      // Navigate to checkout page with the client secret
      navigate(`/marketplace/checkout/${listing.id}?cs=${encodeURIComponent(clientSecret)}`);
    } catch {
      toast.error('Something went wrong');
    }
    setPurchasing(false);
  }, [user, listing, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="aspect-square" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-[var(--border)] mb-4" />
        <p className="text-body text-[var(--error)] mb-4">{error || 'Listing not found'}</p>
        <Link to="/marketplace">
          <Button variant="secondary">
            <ArrowLeft size={14} /> Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SEOHead
        title={listing.title}
        description={`${CONDITION_LABELS[listing.condition]} · ${formatPrice(listing.price_cents, listing.currency)} — ${listing.description.slice(0, 120)}`}
      />
      <ListingStructuredData
        name={listing.title}
        description={listing.description}
        priceCents={listing.price_cents}
        currency={listing.currency}
        condition={listing.condition}
        imageUrl={listing.images?.[0]}
        sellerName={listing.seller?.display_name || undefined}
        url={`${window.location.origin}/marketplace/${listing.id}`}
        inStock={listing.quantity > 0}
      />
      {/* Breadcrumb */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-nav text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <ImageGallery images={listing.images} alt={listing.title} />

        {/* Right: Info */}
        <div className="flex flex-col gap-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="green">{CATEGORY_LABELS[listing.category]}</Badge>
            <Badge variant={CONDITION_VARIANTS[listing.condition]}>
              {CONDITION_LABELS[listing.condition]}
            </Badge>
            {listing.quantity > 1 && (
              <Badge>{listing.quantity} available</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{listing.title}</h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold text-[var(--success)]">
              {formatPrice(listing.price_cents, listing.currency)}
            </span>
            {listing.shipping_price_cents === 0 ? (
              <span className="text-nav text-[var(--success)] flex items-center gap-1">
                <MapPin size={12} />
                Free shipping
              </span>
            ) : (
              <span className="text-nav text-[var(--text-secondary)]">
                + {formatPrice(listing.shipping_price_cents, listing.currency)} shipping
              </span>
            )}
          </div>

          {listing.shipping_domestic_only && (
            <p className="text-label text-[var(--warning)] flex items-center gap-1">
              <AlertCircle size={12} />
              Domestic shipping only
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {!isOwner && (
              <Button
                onClick={handleBuyNow}
                disabled={purchasing || listing.quantity < 1}
                className="flex-1 h-10"
              >
                <ShoppingCart size={16} />
                {listing.quantity < 1 ? 'Sold out' : purchasing ? 'Processing...' : 'Buy Now'}
              </Button>
            )}
            {isOwner && (
              <Link to={`/marketplace/sell/${listing.id}`} className="flex-1">
                <Button variant="secondary" className="w-full h-10">
                  Edit listing
                </Button>
              </Link>
            )}
            {user && !isOwner && (
              <button
                onClick={() => toggleFavorite(listing.id)}
                className="h-10 w-10 flex items-center justify-center border border-[var(--border)] rounded-md hover:border-[var(--border-hover)] transition-colors"
              >
                <Heart
                  size={16}
                  className={isFavorited ? 'fill-[var(--pillar-transfer)] text-[var(--pillar-transfer)]' : 'text-[var(--text-secondary)]'}
                />
              </button>
            )}
          </div>

          {listing.favorite_count > 0 && (
            <p className="text-tag text-[var(--text-tertiary)]">
              {listing.favorite_count} {listing.favorite_count === 1 ? 'person has' : 'people have'} favorited this
            </p>
          )}

          {/* Description */}
          <Card>
            <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-2">Description</h2>
            <p className="text-nav text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </Card>

          {/* Seller info */}
          <Card>
            <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-3">Seller</h2>
            <div className="flex items-center gap-3">
              {listing.seller?.avatar_url ? (
                <img src={listing.seller.avatar_url} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--surface-3)] flex items-center justify-center">
                  <span className="text-nav font-medium text-[var(--text-secondary)]">
                    {(listing.seller?.display_name || 'S')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-nav font-medium text-[var(--text-primary)]">
                  {listing.seller?.display_name || 'Seller'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {(listing.seller?.seller_rating ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-label text-[var(--text-secondary)]">
                      <Star size={10} className="fill-[var(--warning)] text-[var(--warning)]" />
                      {listing.seller?.seller_rating?.toFixed(1)}
                      <span className="text-[var(--text-tertiary)]">
                        ({listing.seller?.seller_review_count})
                      </span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-label text-[var(--success)]">
                    <Shield size={10} />
                    Verified seller
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Device link */}
          {listing.device_id && (
            <Link to={`/devices/${listing.device_id}`}>
              <Card hoverable className="flex items-center gap-2">
                <ExternalLink size={14} className="text-[var(--accent)]" />
                <span className="text-nav text-[var(--accent)]">View device specs in Device Library</span>
              </Card>
            </Link>
          )}

          {/* Meta */}
          <p className="text-tag text-[var(--text-tertiary)]">
            Listed {formatRelativeTime(listing.created_at)} · {listing.view_count} views
          </p>
        </div>
      </div>
    </div>
  );
}
