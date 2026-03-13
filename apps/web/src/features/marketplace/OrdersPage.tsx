import { Link, useNavigate } from 'react-router';
import { Package, ShoppingBag, Loader2 } from 'lucide-react';
import { Badge, Card, Skeleton } from '@netmd-studio/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@netmd-studio/ui';
import { formatPrice, formatRelativeTime } from '@netmd-studio/utils';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from './hooks/useOrders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from './components/OrderTimeline';
import type { OrderWithDetails } from './hooks/useOrders';

function OrderCard({ order, role }: { order: OrderWithDetails; role: 'buyer' | 'seller' }) {
  const counterparty = role === 'buyer' ? order.seller : order.buyer;
  const image = order.listing?.images?.[0];

  return (
    <Link to={`/dashboard/orders/${order.id}`}>
      <Card hoverable className="flex items-center gap-4">
        {/* Image */}
        <div className="w-14 h-14 rounded-studio border border-studio-border overflow-hidden flex-shrink-0 bg-studio-black">
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={20} className="text-studio-border" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-studio-text truncate">
            {order.listing?.title || 'Order'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium ${ORDER_STATUS_VARIANTS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="text-2xs text-studio-text-dim">
              {role === 'buyer' ? 'from' : 'to'} {counterparty?.display_name || 'User'}
            </span>
          </div>
        </div>

        {/* Price + date */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-studio-text">
            {formatPrice(order.total_cents, order.currency)}
          </p>
          <p className="text-2xs text-studio-text-dim">{formatRelativeTime(order.created_at)}</p>
        </div>
      </Card>
    </Link>
  );
}

export function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { orders: buyerOrders, loading: buyerLoading } = useOrders(user?.id, 'buyer');
  const { orders: sellerOrders, loading: sellerLoading } = useOrders(user?.id, 'seller');

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
        <p className="text-md text-studio-text-muted">Sign in to view your orders</p>
        <Link to="/auth/login" className="text-sm text-studio-cyan hover:text-studio-cyan-hover mt-2">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-studio-text">Orders</h1>

      <Tabs defaultValue="buying">
        <TabsList>
          <TabsTrigger value="buying">
            Purchases {buyerOrders.length > 0 && `(${buyerOrders.length})`}
          </TabsTrigger>
          <TabsTrigger value="selling">
            Sales {sellerOrders.length > 0 && `(${sellerOrders.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buying">
          {buyerLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : buyerOrders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ShoppingBag size={40} className="text-studio-border mb-3" />
              <p className="text-sm text-studio-text-muted">No purchases yet</p>
              <Link to="/marketplace" className="text-sm text-studio-cyan hover:text-studio-cyan-hover mt-2">
                Browse marketplace
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {buyerOrders.map((order) => (
                <OrderCard key={order.id} order={order} role="buyer" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="selling">
          {sellerLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : sellerOrders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package size={40} className="text-studio-border mb-3" />
              <p className="text-sm text-studio-text-muted">No sales yet</p>
              <Link to="/marketplace/sell" className="text-sm text-studio-cyan hover:text-studio-cyan-hover mt-2">
                Start selling
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sellerOrders.map((order) => (
                <OrderCard key={order.id} order={order} role="seller" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
