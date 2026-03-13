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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_account_id) {
      return res.status(400).json({ error: 'No Stripe account found' });
    }

    const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id);

    return res.status(200).json({ url: loginLink.url });
  } catch (error) {
    console.error('Stripe create-login-link error:', error);
    return res.status(500).json({ error: 'Failed to create login link' });
  }
}
