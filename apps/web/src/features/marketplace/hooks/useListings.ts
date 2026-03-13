import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database, ListingCategory, ListingCondition, ListingStatus } from '@netmd-studio/types';

type Listing = Database['public']['Tables']['listings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ListingWithSeller extends Listing {
  seller: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'seller_rating' | 'seller_review_count'> | null;
}

export interface ListingFilters {
  search: string;
  categories: ListingCategory[];
  conditions: ListingCondition[];
  priceMin: number;
  priceMax: number;
  domesticOnly: boolean;
  deviceId: string | null;
  sort: 'newest' | 'price_low' | 'price_high';
}

export const DEFAULT_LISTING_FILTERS: ListingFilters = {
  search: '',
  categories: [],
  conditions: [],
  priceMin: 0,
  priceMax: 100000,
  domesticOnly: false,
  deviceId: null,
  sort: 'newest',
};

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  portable: 'Portable Player',
  deck: 'Deck / Component',
  disc_blank: 'Blank Discs',
  disc_prerecorded: 'Pre-recorded Discs',
  disc_custom: 'Custom Discs',
  accessory: 'Accessory',
  remote: 'Remote Control',
  cable: 'Cable / Adapter',
  other: 'Other',
};

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: 'New',
  like_new: 'Like New',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  for_parts: 'For Parts',
};

export const CONDITION_VARIANTS: Record<ListingCondition, 'green' | 'cyan' | 'default' | 'amber' | 'error'> = {
  new: 'green',
  like_new: 'green',
  excellent: 'cyan',
  good: 'cyan',
  fair: 'amber',
  poor: 'error',
  for_parts: 'error',
};

export function useListings(filters: ListingFilters) {
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('listings')
      .select('*, seller:profiles!listings_seller_id_fkey(id, display_name, avatar_url, seller_rating, seller_review_count)')
      .eq('status', 'active' as ListingStatus);

    if (filters.search.trim()) {
      query = query.textSearch('fts', filters.search.trim(), { type: 'websearch' });
    }

    if (filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    if (filters.conditions.length > 0) {
      query = query.in('condition', filters.conditions);
    }

    if (filters.priceMin > 0) {
      query = query.gte('price_cents', filters.priceMin);
    }

    if (filters.priceMax < 100000) {
      query = query.lte('price_cents', filters.priceMax);
    }

    if (filters.domesticOnly) {
      query = query.eq('shipping_domestic_only', true);
    }

    if (filters.deviceId) {
      query = query.eq('device_id', filters.deviceId);
    }

    switch (filters.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'price_low':
        query = query.order('price_cents', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price_cents', { ascending: false });
        break;
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setListings([]);
    } else {
      setListings((data as unknown as ListingWithSeller[]) ?? []);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetch() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('listings')
        .select('*, seller:profiles!listings_seller_id_fkey(id, display_name, avatar_url, seller_rating, seller_review_count)')
        .eq('id', id!)
        .single();

      if (err) {
        setError(err.message);
        setListing(null);
      } else {
        setListing(data as unknown as ListingWithSeller);

        // Increment view count (fire and forget)
        supabase
          .from('listings')
          .update({ view_count: ((data as any).view_count ?? 0) + 1 })
          .eq('id', id!)
          .then();
      }
      setLoading(false);
    }

    fetch();
  }, [id]);

  return { listing, loading, error };
}

export function useMyListings(userId: string | undefined) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    setListings((data as Listing[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  return { listings, loading, refetch: fetchMyListings };
}

export function useDeviceListings(deviceId: string | undefined) {
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from('listings')
        .select('*, seller:profiles!listings_seller_id_fkey(id, display_name, avatar_url, seller_rating, seller_review_count)')
        .eq('device_id', deviceId!)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      setListings((data as unknown as ListingWithSeller[]) ?? []);
      setLoading(false);
    }

    fetch();
  }, [deviceId]);

  return { listings, loading };
}
