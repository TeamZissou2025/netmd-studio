import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import {
  Disc3, Usb, Database, ShoppingBag, Package, DollarSign,
  Heart, Star, ArrowRight, Loader2,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '@netmd-studio/ui';
import { formatPrice, formatRelativeTime } from '@netmd-studio/utils';
import { useAuth } from '../../hooks/useAuth';
import { SEOHead } from '../../app/SEOHead';
import { supabase } from '../../lib/supabase';
import type { Database as DB, OrderStatus } from '@netmd-studio/types';

type Listing = DB['public']['Tables']['listings']['Row'];
type Order = DB['public']['Tables']['orders']['Row'];
type LabelDesign = DB['public']['Tables']['label_designs']['Row'];
type TransferHistory = DB['public']['Tables']['transfer_history']['Row'];

interface DashboardStats {
  labelCount: number;
  transferCount: number;
  deviceReportCount: number;
  activeListings: number;
  orderCount: number;
  favoriteCount: number;
}

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-studio-warning',
  paid: 'text-studio-cyan',
  shipped: 'text-studio-cyan',
  delivered: 'text-studio-success',
  cancelled: 'text-studio-text-dim',
  refunded: 'text-studio-warning',
  disputed: 'text-studio-error',
};

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<(Order & { listing_title: string })[]>([]);
  const [recentLabels, setRecentLabels] = useState<LabelDesign[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<TransferHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchDashboard() {
      setLoading(true);

      const [
        { count: labelCount },
        { count: transferCount },
        { count: deviceReportCount },
        { count: activeListings },
        { count: orderCount },
        { count: favoriteCount },
        { data: orders },
        { data: labels },
        { data: transfers },
      ] = await Promise.all([
        supabase.from('label_designs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('transfer_history').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('device_reports').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', user!.id).eq('status', 'active'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase
          .from('orders')
          .select('*, listing:listings!orders_listing_id_fkey(title)')
          .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('label_designs')
          .select('*')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from('transfer_history')
          .select('*')
          .eq('user_id', user!.id)
          .order('started_at', { ascending: false })
          .limit(3),
      ]);

      setStats({
        labelCount: labelCount ?? 0,
        transferCount: transferCount ?? 0,
        deviceReportCount: deviceReportCount ?? 0,
        activeListings: activeListings ?? 0,
        orderCount: orderCount ?? 0,
        favoriteCount: favoriteCount ?? 0,
      });

      setRecentOrders(
        (orders ?? []).map((o: any) => ({
          ...o,
          listing_title: o.listing?.title ?? 'Order',
        }))
      );
      setRecentLabels((labels as LabelDesign[]) ?? []);
      setRecentTransfers((transfers as TransferHistory[]) ?? []);
      setLoading(false);
    }

    fetchDashboard();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-studio-cyan" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;

  return (
    <div className="flex flex-col gap-6">
      <SEOHead title="Dashboard" />
      <div>
        <h1 className="text-2xl font-semibold text-studio-text">Dashboard</h1>
        <p className="text-sm text-studio-text-muted mt-1">
          Your activity across NetMD Studio
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Disc3} label="Label Designs" value={stats.labelCount} color="text-pillar-label bg-pillar-label/10" to="/labels" />
          <StatCard icon={Usb} label="Transfers" value={stats.transferCount} color="text-pillar-transfer bg-pillar-transfer/10" to="/transfer" />
          <StatCard icon={Database} label="Device Reports" value={stats.deviceReportCount} color="text-pillar-device bg-pillar-device/10" to="/devices" />
          <StatCard icon={ShoppingBag} label="Active Listings" value={stats.activeListings} color="text-pillar-market bg-pillar-market/10" to="/dashboard/selling" />
          <StatCard icon={Package} label="Orders" value={stats.orderCount} color="text-studio-cyan bg-studio-cyan-muted" to="/dashboard/orders" />
          <StatCard icon={Heart} label="Favorites" value={stats.favoriteCount} color="text-studio-magenta bg-studio-magenta-muted" to="/marketplace" />
        </div>
      )}

      {/* Activity sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-studio-text">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-studio-text-dim py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between py-2 px-2 rounded-studio hover:bg-studio-surface-hover transition-colors -mx-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-studio-text truncate">{order.listing_title}</p>
                    <p className="text-2xs text-studio-text-dim">{formatRelativeTime(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-2xs font-medium capitalize ${ORDER_STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-xs font-mono text-studio-text-muted">
                      {formatPrice(order.total_cents, order.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Labels */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-studio-text">Recent Labels</h2>
            <Link to="/labels" className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors flex items-center gap-1">
              Open editor <ArrowRight size={10} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recentLabels.length === 0 ? (
            <p className="text-sm text-studio-text-dim py-4 text-center">No label designs yet</p>
          ) : (
            <div className="space-y-2">
              {recentLabels.map((label) => (
                <Link
                  key={label.id}
                  to={`/labels?edit=${label.id}`}
                  className="flex items-center gap-3 py-2 px-2 rounded-studio hover:bg-studio-surface-hover transition-colors -mx-2"
                >
                  {label.thumbnail_url ? (
                    <img src={label.thumbnail_url} alt="" className="w-8 h-8 rounded border border-studio-border object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded border border-studio-border bg-studio-surface flex items-center justify-center">
                      <Disc3 size={12} className="text-studio-text-dim" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-studio-text truncate">{label.title}</p>
                    <p className="text-2xs text-studio-text-dim">
                      {label.artist_name ? `${label.artist_name} — ${label.album_title}` : label.template_type.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="text-2xs text-studio-text-dim flex-shrink-0">
                    {formatRelativeTime(label.updated_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transfers */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-studio-text">Recent Transfers</h2>
            <Link to="/transfer" className="text-2xs text-studio-cyan hover:text-studio-cyan-hover transition-colors flex items-center gap-1">
              Transfer Studio <ArrowRight size={10} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recentTransfers.length === 0 ? (
            <p className="text-sm text-studio-text-dim py-4 text-center">No transfers yet</p>
          ) : (
            <div className="space-y-2">
              {recentTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between py-2 px-2 -mx-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-studio-text truncate">
                      {transfer.disc_title || transfer.device_name}
                    </p>
                    <p className="text-2xs text-studio-text-dim">
                      {transfer.total_tracks} tracks · {transfer.transfer_format.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {transfer.success === true ? (
                      <Badge variant="green">Complete</Badge>
                    ) : transfer.success === false ? (
                      <Badge variant="error">Failed</Badge>
                    ) : (
                      <Badge>In progress</Badge>
                    )}
                    <span className="text-2xs text-studio-text-dim">
                      {formatRelativeTime(transfer.started_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-sm font-semibold text-studio-text mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction to="/labels" icon={Disc3} label="New label design" color="text-pillar-label" />
            <QuickAction to="/transfer" icon={Usb} label="Transfer audio" color="text-pillar-transfer" />
            <QuickAction to="/marketplace/sell" icon={DollarSign} label="Sell an item" color="text-pillar-market" />
            <QuickAction to="/devices/submit" icon={Database} label="Submit a device" color="text-pillar-device" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, to }: {
  icon: typeof Disc3;
  label: string;
  value: number;
  color: string;
  to: string;
}) {
  return (
    <Link to={to}>
      <Card hoverable className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-studio-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xs text-studio-text-muted">{label}</p>
          <p className="text-xl font-semibold text-studio-text">{value}</p>
        </div>
      </Card>
    </Link>
  );
}

function QuickAction({ to, icon: Icon, label, color }: {
  to: string;
  icon: typeof Disc3;
  label: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 p-3 rounded-studio bg-studio-black border border-studio-border hover:border-studio-border-bright transition-colors"
    >
      <Icon size={14} className={color} />
      <span className="text-xs text-studio-text-muted">{label}</span>
    </Link>
  );
}
