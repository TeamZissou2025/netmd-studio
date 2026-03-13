import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database, OrderStatus } from '@netmd-studio/types';

type Order = Database['public']['Tables']['orders']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface OrderWithDetails extends Order {
  listing: Pick<Listing, 'id' | 'title' | 'images' | 'category' | 'condition'> | null;
  buyer: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null;
  seller: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null;
}

export function useOrders(userId: string | undefined, role: 'buyer' | 'seller') {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const column = role === 'buyer' ? 'buyer_id' : 'seller_id';

    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        listing:listings!orders_listing_id_fkey(id, title, images, category, condition),
        buyer:profiles!orders_buyer_id_fkey(id, display_name, avatar_url),
        seller:profiles!orders_seller_id_fkey(id, display_name, avatar_url)
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false });

    setOrders((data as unknown as OrderWithDetails[]) ?? []);
    setLoading(false);
  }, [userId, role]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
}

export function useOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);

    const { data, error: err } = await supabase
      .from('orders')
      .select(`
        *,
        listing:listings!orders_listing_id_fkey(id, title, images, category, condition),
        buyer:profiles!orders_buyer_id_fkey(id, display_name, avatar_url),
        seller:profiles!orders_seller_id_fkey(id, display_name, avatar_url)
      `)
      .eq('id', orderId)
      .single();

    if (err) {
      setError(err.message);
    } else {
      setOrder(data as unknown as OrderWithDetails);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra?: { tracking_number?: string; tracking_url?: string }
) {
  const updates: Record<string, unknown> = { status };
  if (status === 'shipped') {
    updates.shipped_at = new Date().toISOString();
    if (extra?.tracking_number) updates.tracking_number = extra.tracking_number;
    if (extra?.tracking_url) updates.tracking_url = extra.tracking_url;
  }
  if (status === 'delivered') {
    updates.delivered_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  return { error };
}
