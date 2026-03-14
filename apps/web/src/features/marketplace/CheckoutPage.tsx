import { useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Card, Badge, Skeleton } from '@netmd-studio/ui';
import { formatPrice } from '@netmd-studio/utils';
import { useListing, CONDITION_LABELS, CONDITION_VARIANTS } from './hooks/useListings';
import { CheckoutForm } from './components/CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientSecret = searchParams.get('cs') || '';
  const { listing, loading } = useListing(id);

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: 'night' as const,
        variables: {
          colorPrimary: '#00d4ff',
          colorBackground: '#0a0a0b',
          colorText: '#e8e8ec',
          colorDanger: '#ff3344',
          borderRadius: '6px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSizeBase: '13px',
        },
        rules: {
          '.Input': {
            border: '1px solid #2a2a32',
            backgroundColor: '#0a0a0b',
          },
          '.Input:focus': {
            border: '1px solid #00d4ff',
            boxShadow: '0 0 0 1px rgba(0,212,255,0.2)',
          },
          '.Label': {
            color: '#8888a0',
            fontSize: '12px',
          },
        },
      },
    }),
    [clientSecret]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!listing || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-body text-[var(--error)] mb-4">Checkout session expired or invalid</p>
        <Link to="/marketplace">
          <span className="text-nav text-[var(--accent)] hover:text-[var(--accent)]">
            Back to Marketplace
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <Link
        to={`/marketplace/${listing.id}`}
        className="inline-flex items-center gap-1.5 text-nav text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Back to listing
      </Link>

      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Order summary */}
        <Card className="md:col-span-2">
          <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-3">Order summary</h2>
          <div className="flex gap-3 mb-4">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-16 h-16 rounded-md border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-[var(--surface-3)]" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-nav text-[var(--text-primary)] truncate">{listing.title}</p>
              <Badge variant={CONDITION_VARIANTS[listing.condition]} className="mt-1">
                {CONDITION_LABELS[listing.condition]}
              </Badge>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-3 space-y-1.5">
            <div className="flex justify-between text-nav">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span className="text-[var(--text-primary)]">{formatPrice(listing.price_cents, listing.currency)}</span>
            </div>
            <div className="flex justify-between text-nav">
              <span className="text-[var(--text-secondary)]">Shipping</span>
              <span className="text-[var(--text-primary)]">
                {listing.shipping_price_cents === 0
                  ? 'Free'
                  : formatPrice(listing.shipping_price_cents, listing.currency)}
              </span>
            </div>
            <div className="flex justify-between text-body font-semibold border-t border-[var(--border)] pt-2">
              <span className="text-[var(--text-primary)]">Total</span>
              <span className="text-[var(--success)]">
                {formatPrice(listing.price_cents + listing.shipping_price_cents, listing.currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[var(--border)]">
            <ShieldCheck size={14} className="text-[var(--success)]" />
            <span className="text-tag text-[var(--text-tertiary)]">Secure payment via Stripe</span>
          </div>
        </Card>

        {/* Payment form */}
        <div className="md:col-span-3">
          <Card>
            <h2 className="text-nav font-semibold text-[var(--text-primary)] mb-4">Payment details</h2>
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm
                onSuccess={() => {
                  navigate('/dashboard/orders');
                }}
              />
            </Elements>
          </Card>
        </div>
      </div>
    </div>
  );
}
