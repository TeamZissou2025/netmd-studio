import { Check, Clock, Package, Truck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { OrderStatus } from '@netmd-studio/types';

interface OrderTimelineProps {
  status: OrderStatus;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'paid', label: 'Paid', icon: Check },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  delivered: 3,
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

export const ORDER_STATUS_VARIANTS: Record<OrderStatus, string> = {
  pending: 'text-studio-warning',
  paid: 'text-studio-cyan',
  shipped: 'text-studio-cyan',
  delivered: 'text-studio-success',
  cancelled: 'text-studio-text-dim',
  refunded: 'text-studio-warning',
  disputed: 'text-studio-error',
};

export function OrderTimeline({ status, shippedAt, deliveredAt, createdAt }: OrderTimelineProps) {
  // For non-standard statuses, show a simple badge
  if (['cancelled', 'refunded', 'disputed'].includes(status)) {
    const Icon = status === 'disputed' ? AlertTriangle : XCircle;
    return (
      <div className="flex items-center gap-2 py-3">
        <Icon size={16} className={ORDER_STATUS_VARIANTS[status]} />
        <span className={`text-sm font-medium ${ORDER_STATUS_VARIANTS[status]}`}>
          {ORDER_STATUS_LABELS[status]}
        </span>
      </div>
    );
  }

  const currentIndex = STATUS_INDEX[status] ?? 0;

  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? isCurrent
                      ? 'border-studio-cyan bg-studio-cyan-muted'
                      : 'border-studio-success bg-emerald-500/10'
                    : 'border-studio-border bg-studio-surface'
                }`}
              >
                <Icon
                  size={14}
                  className={
                    isCompleted
                      ? isCurrent
                        ? 'text-studio-cyan'
                        : 'text-studio-success'
                      : 'text-studio-text-dim'
                  }
                />
              </div>
              <span
                className={`text-2xs font-medium ${
                  isCompleted ? 'text-studio-text' : 'text-studio-text-dim'
                }`}
              >
                {step.label}
              </span>
              {/* Timestamps */}
              <span className="text-2xs text-studio-text-dim">
                {step.key === 'pending' || step.key === 'paid'
                  ? isCompleted
                    ? new Date(createdAt).toLocaleDateString()
                    : ''
                  : step.key === 'shipped' && shippedAt
                    ? new Date(shippedAt).toLocaleDateString()
                    : step.key === 'delivered' && deliveredAt
                      ? new Date(deliveredAt).toLocaleDateString()
                      : ''}
              </span>
            </div>

            {/* Connector line */}
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-[-20px] ${
                  i < currentIndex ? 'bg-studio-success' : 'bg-studio-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
