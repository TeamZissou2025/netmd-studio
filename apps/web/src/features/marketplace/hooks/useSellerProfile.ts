import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '@netmd-studio/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useSellerProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setProfile(data as Profile | null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const startOnboarding = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: 'Not authenticated' };

    const res = await fetch('/api/stripe/create-account-link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.json();
      return { error: body.error || 'Failed to start onboarding' };
    }

    const { url } = await res.json();
    window.location.href = url;
    return { error: null };
  }, []);

  const getStripeDashboardUrl = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const res = await fetch('/api/stripe/create-login-link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;

    const { url } = await res.json();
    return url as string;
  }, []);

  return { profile, loading, refetch: fetchProfile, startOnboarding, getStripeDashboardUrl };
}

export function useSellerStats(userId: string | undefined) {
  const [stats, setStats] = useState({
    activeListings: 0,
    totalSold: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    avgRating: 0,
    reviewCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetch() {
      setLoading(true);

      const [
        { count: activeCount },
        { count: soldCount },
        { data: pendingOrders },
        { data: allOrders },
        { data: profile },
      ] = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', userId!).eq('status', 'active'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', userId!).eq('status', 'sold'),
        supabase.from('orders').select('id').eq('seller_id', userId!).in('status', ['paid', 'shipped']),
        supabase.from('orders').select('subtotal_cents').eq('seller_id', userId!).in('status', ['paid', 'shipped', 'delivered']),
        supabase.from('profiles').select('seller_rating, seller_review_count').eq('id', userId!).single(),
      ]);

      const revenue = (allOrders ?? []).reduce((sum, o) => sum + o.subtotal_cents, 0);

      setStats({
        activeListings: activeCount ?? 0,
        totalSold: soldCount ?? 0,
        pendingOrders: (pendingOrders ?? []).length,
        totalRevenue: revenue,
        avgRating: profile?.seller_rating ?? 0,
        reviewCount: profile?.seller_review_count ?? 0,
      });
      setLoading(false);
    }

    fetch();
  }, [userId]);

  return { stats, loading };
}
