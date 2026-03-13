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

  const supabase = getSupabaseAdmin();

  try {
    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    let stripeAccountId = profile.stripe_account_id;

    // Create Express account if none exists
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: { user_id: user.id },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // Update profile with stripe account id and upgrade role to seller
      await supabase
        .from('profiles')
        .update({
          stripe_account_id: stripeAccountId,
          role: 'seller',
        })
        .eq('id', user.id);
    }

    const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173';

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      return_url: `${appUrl}/marketplace/sell?onboarding=complete`,
      refresh_url: `${appUrl}/marketplace/sell?onboarding=refresh`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('Stripe create-account-link error:', error);
    return res.status(500).json({ error: 'Failed to create account link' });
  }
}
