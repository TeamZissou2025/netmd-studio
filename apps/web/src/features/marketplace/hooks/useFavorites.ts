import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export function useFavorites(userId: string | undefined) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', userId);

    setFavoriteIds(new Set((data ?? []).map((f) => f.listing_id)));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (!userId) return;

      const isFav = favoriteIds.has(listingId);

      if (isFav) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });

        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);

        // Decrement favorite_count
        const { data: listing } = await supabase
          .from('listings')
          .select('favorite_count')
          .eq('id', listingId)
          .single();
        if (listing) {
          await supabase
            .from('listings')
            .update({ favorite_count: Math.max(0, listing.favorite_count - 1) })
            .eq('id', listingId);
        }
      } else {
        setFavoriteIds((prev) => new Set(prev).add(listingId));

        await supabase
          .from('favorites')
          .insert({ user_id: userId, listing_id: listingId });

        // Increment favorite_count
        const { data: listing } = await supabase
          .from('listings')
          .select('favorite_count')
          .eq('id', listingId)
          .single();
        if (listing) {
          await supabase
            .from('listings')
            .update({ favorite_count: listing.favorite_count + 1 })
            .eq('id', listingId);
        }
      }
    },
    [userId, favoriteIds]
  );

  return { favoriteIds, loading, toggleFavorite };
}
