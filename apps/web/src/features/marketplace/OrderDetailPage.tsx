import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Loader2, Package, Truck, ExternalLink } from 'lucide-react';
import { Button, Card, Input, Badge, Skeleton } from '@netmd-studio/ui';
import { formatPrice, formatRelativeTime } from '@netmd-studio/utils';
import { useAuth } from '../../hooks/useAuth';
import { useOrder, updateOrderStatus } from './hooks/useOrders';
import { useMessages } from './hooks/useMessages';
import { useOrderReview } from './hooks/useReviews';
import { OrderTimeline, ORDER_STATUS_LABELS } from './components/OrderTimeline';
import { OrderMessages } from './components/OrderMessages';
import { ReviewForm, ReviewDisplay } from './components/ReviewForm';
import toast from 'react-hot-toast';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { order, loading, error, refetch } = useOrder(id);
  const { messages, sendMessage, markAsRead } = useMessages(id, user?.id);
  const { review, submitReview } = useOrderReview(id);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  // Mark messages as read when viewing
  if (user && messages.length > 0) {
    markAsRead();
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !order || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-body text-[var(--error)] mb-4">{error || 'Order not found'}</p>
        <Link to="/dashboard/orders">
          <Button variant="secondary">
            <ArrowLeft size={14} /> Back to orders
          </Button>
        </Link>
      </div>
    );
  }

  const isBuyer = user.id === order.buyer_id;
  const isSeller = user.id === order.seller_id;
  const counterparty = isBuyer ? order.seller : order.buyer;

  const handleShip = async () => {
    setUpdating(true);
    const { error } = await updateOrderStatus(order.id, 'shipped', {
      tracking_number: trackingNumber || undefined,
      tracking_url: trackingUrl || undefined,
    });
    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success('Order marked as shipped');
      refetch();
    }
    setUpdating(false);
  };

  const handleConfirmDelivery = async () => {
    setUpdating(true);
    const { error } = await updateOrderStatus(order.id, 'delivered');
    if (error) {
      toast.error('Failed to confirm delivery');
    } else {
      toast.success('Delivery confirmed');
      refetch();
    }
    setUpdating(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Breadcrumb */}
      <Link
        to="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-nav text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Back to orders
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Order {order.id.slice(0, 8)}...
          </h1>
          <p className="text-nav text-[var(--text-secondary)]">
            {formatRelativeTime(order.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-studio-title font-semibold text-[var(--text-primary)]">
            {formatPrice(order.total_cents, order.currency)}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-4">Order status</h2>
        <OrderTimeline
          status={order.status}
          shippedAt={order.shipped_at}
          deliveredAt={order.delivered_at}
          createdAt={order.created_at}
        />
      </Card>

      {/* Listing info */}
      <Card>
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-md border border-[var(--border)] overflow-hidden flex-shrink-0 bg-[var(--surface-0)]">
            {order.listing?.images?.[0] ? (
              <img src={order.listing.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={20} className="text-[var(--border)]" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Link
              to={`/marketplace/${order.listing_id}`}
              className="text-nav font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              {order.listing?.title || 'Listing'}
            </Link>
            <div className="flex items-center gap-3 mt-1 text-label text-[var(--text-secondary)]">
              <span>Qty: {order.quantity}</span>
              <span>Subtotal: {formatPrice(order.subtotal_cents, order.currency)}</span>
              <span>Shipping: {formatPrice(order.shipping_cents, order.currency)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Seller actions */}
      {isSeller && order.status === 'paid' && (
        <Card>
          <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-3">
            <Truck size={14} className="inline mr-1.5" />
            Ship this order
          </h2>
          <div className="flex flex-col gap-3">
            <Input
              label="Tracking number (optional)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />
            <Input
              label="Tracking URL (optional)"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
            />
            <Button onClick={handleShip} disabled={updating}>
              {updating ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
              Mark as shipped
            </Button>
          </div>
        </Card>
      )}

      {/* Tracking info */}
      {order.tracking_number && (
        <Card>
          <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-2">Tracking</h2>
          <p className="text-nav font-mono text-[var(--accent)]">{order.tracking_number}</p>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-nav text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 mt-1"
            >
              Track shipment <ExternalLink size={12} />
            </a>
          )}
        </Card>
      )}

      {/* Buyer: confirm delivery */}
      {isBuyer && order.status === 'shipped' && (
        <Card>
          <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-3">Confirm delivery</h2>
          <p className="text-nav text-[var(--text-secondary)] mb-3">
            Have you received this item?
          </p>
          <Button onClick={handleConfirmDelivery} disabled={updating}>
            {updating ? <Loader2 size={14} className="animate-spin" /> : null}
            Confirm delivery
          </Button>
        </Card>
      )}

      {/* Review */}
      {isBuyer && order.status === 'delivered' && (
        <Card>
          {review ? (
            <>
              <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-3">Your review</h2>
              <ReviewDisplay
                rating={review.rating}
                comment={review.comment}
                reviewerName="You"
                createdAt={review.created_at}
              />
            </>
          ) : (
            <ReviewForm
              onSubmit={async (rating, comment) => {
                const { error } = await submitReview({
                  reviewerId: user.id,
                  revieweeId: order.seller_id,
                  rating,
                  comment,
                });
                return { error };
              }}
            />
          )}
        </Card>
      )}

      {/* Messages */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-[var(--border)]">
          <h2 className="text-nav font-semibold text-[var(--text-primary)]">
            Messages with {counterparty?.display_name || 'User'}
          </h2>
        </div>
        <OrderMessages
          messages={messages}
          currentUserId={user.id}
          onSend={sendMessage}
          counterpartyName={counterparty?.display_name || 'User'}
        />
      </Card>
    </div>
  );
}
