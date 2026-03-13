import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Vercel needs raw body for webhook signature verification
export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const supabase = getSupabaseAdmin();

  // Idempotency check
  const { error: idempotencyError } = await supabase
    .from('stripe_events')
    .insert({ event_id: event.id, event_type: event.type });

  if (idempotencyError) {
    // Duplicate event — already processed
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        const chargesEnabled = account.charges_enabled;

        // Find profile with this stripe_account_id and sync status
        await supabase
          .from('profiles')
          .update({ stripe_onboarding_complete: chargesEnabled ?? false })
          .eq('stripe_account_id', account.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const meta = pi.metadata;

        if (!meta.listing_id || !meta.buyer_id || !meta.seller_id) {
          console.warn('PaymentIntent missing metadata:', pi.id);
          break;
        }

        const subtotalCents = parseInt(meta.subtotal_cents, 10);
        const shippingCents = parseInt(meta.shipping_cents, 10);
        const platformFeeCents = parseInt(meta.platform_fee_cents, 10);
        const totalCents = subtotalCents + shippingCents;

        // Create order
        await supabase.from('orders').insert({
          buyer_id: meta.buyer_id,
          seller_id: meta.seller_id,
          listing_id: meta.listing_id,
          subtotal_cents: subtotalCents,
          shipping_cents: shippingCents,
          platform_fee_cents: platformFeeCents,
          total_cents: totalCents,
          currency: pi.currency.toUpperCase(),
          status: 'paid',
          stripe_payment_intent_id: pi.id,
        });

        // Decrement listing quantity
        const { data: listing } = await supabase
          .from('listings')
          .select('quantity')
          .eq('id', meta.listing_id)
          .single();

        if (listing) {
          const newQuantity = Math.max(0, listing.quantity - 1);
          const updates: Record<string, unknown> = { quantity: newQuantity };
          if (newQuantity === 0) {
            updates.status = 'sold';
          }
          await supabase
            .from('listings')
            .update(updates)
            .eq('id', meta.listing_id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', pi.id, pi.last_payment_error?.message);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        const piId = typeof dispute.payment_intent === 'string'
          ? dispute.payment_intent
          : dispute.payment_intent?.id;

        if (piId) {
          await supabase
            .from('orders')
            .update({ status: 'disputed' })
            .eq('stripe_payment_intent_id', piId);
        }
        break;
      }

      case 'payout.paid':
      case 'payout.failed': {
        // Log for debugging — no DB action needed for now
        console.log(`Payout event: ${event.type}`, event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 even on processing errors to prevent Stripe retries
    return res.status(200).json({ received: true, error: 'Processing error' });
  }

  return res.status(200).json({ received: true });
}
