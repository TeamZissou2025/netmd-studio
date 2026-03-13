import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getAuthUser } from '../_lib/auth';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { listing_id } = req.body;
  if (!listing_id) {
    return res.status(400).json({ error: 'Missing listing_id' });
  }

  const supabase = getSupabaseAdmin();

  try {
    // Fetch listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listing_id)
      .eq('status', 'active')
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found or not active' });
    }

    if (listing.quantity < 1) {
      return res.status(400).json({ error: 'Listing is out of stock' });
    }

    if (listing.seller_id === user.id) {
      return res.status(400).json({ error: 'Cannot purchase your own listing' });
    }

    // Get seller's stripe account
    const { data: seller, error: sellerError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', listing.seller_id)
      .single();

    if (sellerError || !seller?.stripe_account_id || !seller.stripe_onboarding_complete) {
      return res.status(400).json({ error: 'Seller has not completed payment setup' });
    }

    // Calculate fees: 10% platform fee, minimum $0.50
    const subtotalCents = listing.price_cents;
    const shippingCents = listing.shipping_price_cents;
    const platformFeeCents = Math.max(Math.ceil(subtotalCents * 0.10), 50);
    const totalCents = subtotalCents + shippingCents;

    // Create PaymentIntent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: listing.currency.toLowerCase(),
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: seller.stripe_account_id,
      },
      metadata: {
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        subtotal_cents: String(subtotalCents),
        shipping_cents: String(shippingCents),
        platform_fee_cents: String(platformFeeCents),
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalCents,
      subtotalCents,
      shippingCents,
      platformFeeCents,
    });
  } catch (error) {
    console.error('Stripe create-checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout' });
  }
}
