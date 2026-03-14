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
  pending: 'text-[var(--warning)]',
  paid: 'text-[var(--accent)]',
  shipped: 'text-[var(--accent)]',
  delivered: 'text-[var(--success)]',
  cancelled: 'text-[var(--text-tertiary)]',
  refunded: 'text-[var(--warning)]',
  disputed: 'text-[var(--error)]',
};

export function OrderTimeline({ status, shippedAt, deliveredAt, createdAt }: OrderTimelineProps) {
  // For non-standard statuses, show a simple badge
  if (['cancelled', 'refunded', 'disputed'].includes(status)) {
    const Icon = status === 'disputed' ? AlertTriangle : XCircle;
    return (
      <div className="flex items-center gap-2 py-3">
        <Icon size={16} className={ORDER_STATUS_VARIANTS[status]} />
        <span className={`text-nav font-medium ${ORDER_STATUS_VARIANTS[status]}`}>
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
                      ? 'border-[var(--border-accent)] bg-[var(--accent-dim)]'
                      : 'border-[var(--success)] bg-emerald-500/10'
                    : 'border-[var(--border)] bg-[var(--surface-1)]'
                }`}
              >
                <Icon
                  size={14}
                  className={
                    isCompleted
                      ? isCurrent
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--success)]'
                      : 'text-[var(--text-tertiary)]'
                  }
                />
              </div>
              <span
                className={`text-tag font-medium ${
                  isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {step.label}
              </span>
              {/* Timestamps */}
              <span className="text-tag text-[var(--text-tertiary)]">
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
                  i < currentIndex ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
