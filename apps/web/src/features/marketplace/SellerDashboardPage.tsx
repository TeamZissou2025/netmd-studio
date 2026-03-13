import { useState, useCallback } from 'react';
import { Link } from 'react-router';
import {
  DollarSign, Package, ShoppingBag, Star, Plus,
  ExternalLink, Loader2, MoreHorizontal, Eye, Archive,
} from 'lucide-react';
import { Button, Card, Badge, Skeleton } from '@netmd-studio/ui';
import { formatPrice, formatRelativeTime } from '@netmd-studio/utils';
import { useAuth } from '../../hooks/useAuth';
import { useMyListings, CATEGORY_LABELS, CONDITION_LABELS } from './hooks/useListings';
import { useSellerProfile, useSellerStats } from './hooks/useSellerProfile';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { ListingStatus } from '@netmd-studio/types';

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: typeof DollarSign;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-studio-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-studio-text-muted">{label}</p>
        <p className="text-lg font-semibold text-studio-text">{value}</p>
      </div>
    </Card>
  );
}

const STATUS_BADGES: Record<ListingStatus, { label: string; variant: 'green' | 'cyan' | 'default' | 'amber' | 'error' }> = {
  draft: { label: 'Draft', variant: 'default' },
  active: { label: 'Active', variant: 'green' },
  sold: { label: 'Sold', variant: 'cyan' },
  archived: { label: 'Archived', variant: 'default' },
  flagged: { label: 'Flagged', variant: 'error' },
};

export function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, getStripeDashboardUrl } = useSellerProfile(user?.id);
  const { stats, loading: statsLoading } = useSellerStats(user?.id);
  const { listings, loading: listingsLoading, refetch } = useMyListings(user?.id);
  const [openingDashboard, setOpeningDashboard] = useState(false);

  const handleOpenStripeDashboard = useCallback(async () => {
    setOpeningDashboard(true);
    const url = await getStripeDashboardUrl();
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Failed to open Stripe dashboard');
    }
    setOpeningDashboard(false);
  }, [getStripeDashboardUrl]);

  const handleStatusChange = async (listingId: string, newStatus: ListingStatus) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listingId)
      .eq('seller_id', user!.id);

    if (error) {
      toast.error('Failed to update listing');
    } else {
      toast.success(`Listing ${newStatus === 'active' ? 'published' : newStatus}`);
      refetch();
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-studio-cyan" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package size={48} className="text-studio-border mb-4" />
        <p className="text-md text-studio-text-muted">Sign in to access your seller dashboard</p>
        <Link to="/auth/login" className="text-sm text-studio-cyan hover:text-studio-cyan-hover mt-2">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-studio-text">Seller Dashboard</h1>
          <p className="text-sm text-studio-text-muted mt-1">
            Manage your listings and track sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleOpenStripeDashboard}
            disabled={openingDashboard}
          >
            {openingDashboard ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            Stripe Dashboard
          </Button>
          <Link to="/marketplace/sell">
            <Button>
              <Plus size={14} />
              New listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active listings"
            value={stats.activeListings}
            icon={ShoppingBag}
            color="bg-emerald-500/10 text-studio-success"
          />
          <StatCard
            label="Items sold"
            value={stats.totalSold}
            icon={Package}
            color="bg-studio-cyan-muted text-studio-cyan"
          />
          <StatCard
            label="Pending orders"
            value={stats.pendingOrders}
            icon={DollarSign}
            color="bg-amber-500/10 text-studio-warning"
          />
          <StatCard
            label="Revenue (90%)"
            value={formatPrice(Math.round(stats.totalRevenue * 0.9))}
            icon={DollarSign}
            color="bg-emerald-500/10 text-studio-success"
          />
        </div>
      )}

      {/* Rating */}
      {stats.reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <Star size={14} className="fill-studio-warning text-studio-warning" />
          <span className="text-sm text-studio-text">
            {stats.avgRating.toFixed(1)} rating
          </span>
          <span className="text-sm text-studio-text-dim">
            ({stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      )}

      {/* Listings table */}
      <div>
        <h2 className="text-lg font-semibold text-studio-text mb-3">Your listings</h2>
        {listingsLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : listings.length === 0 ? (
          <Card className="text-center py-8">
            <ShoppingBag size={32} className="text-studio-border mx-auto mb-3" />
            <p className="text-sm text-studio-text-muted">No listings yet</p>
            <Link to="/marketplace/sell" className="text-sm text-studio-cyan hover:text-studio-cyan-hover mt-1 inline-block">
              Create your first listing
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {listings.map((listing) => {
              const statusInfo = STATUS_BADGES[listing.status];
              return (
                <Card key={listing.id} className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-studio border border-studio-border overflow-hidden flex-shrink-0 bg-studio-black">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-studio-surface" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/marketplace/${listing.id}`}
                        className="text-sm font-medium text-studio-text hover:text-studio-cyan transition-colors truncate"
                      >
                        {listing.title}
                      </Link>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-2xs text-studio-text-dim">
                      <span>{CATEGORY_LABELS[listing.category]}</span>
                      <span>{formatRelativeTime(listing.created_at)}</span>
                      <span className="flex items-center gap-0.5">
                        <Eye size={10} />
                        {listing.view_count}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <span className="text-sm font-semibold text-studio-success flex-shrink-0">
                    {formatPrice(listing.price_cents, listing.currency)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link to={`/marketplace/sell/${listing.id}`}>
                      <Button variant="ghost" className="h-7 px-2 text-2xs">
                        Edit
                      </Button>
                    </Link>
                    {listing.status === 'draft' && (
                      <Button
                        variant="ghost"
                        className="h-7 px-2 text-2xs"
                        onClick={() => handleStatusChange(listing.id, 'active')}
                      >
                        Publish
                      </Button>
                    )}
                    {listing.status === 'active' && (
                      <Button
                        variant="ghost"
                        className="h-7 px-2 text-2xs"
                        onClick={() => handleStatusChange(listing.id, 'archived')}
                      >
                        <Archive size={10} />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Link to orders */}
      <Link to="/dashboard/orders">
        <Card hoverable className="flex items-center gap-3">
          <Package size={18} className="text-studio-cyan" />
          <span className="text-sm text-studio-text">View all orders</span>
          <span className="text-sm text-studio-text-dim ml-auto">→</span>
        </Card>
      </Link>
    </div>
  );
}
