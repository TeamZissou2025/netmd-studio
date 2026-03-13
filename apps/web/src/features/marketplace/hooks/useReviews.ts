import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '@netmd-studio/types';

type Review = Database['public']['Tables']['reviews']['Row'];

export interface ReviewWithProfile extends Review {
  reviewer: { display_name: string | null; avatar_url: string | null } | null;
}

export function useOrderReview(orderId: string | undefined) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_id', orderId!)
        .maybeSingle();

      setReview(data as Review | null);
      setLoading(false);
    }

    fetch();
  }, [orderId]);

  const submitReview = useCallback(
    async (params: { reviewerId: string; revieweeId: string; rating: number; comment?: string }) => {
      if (!orderId) return { error: 'No order' };

      const { error } = await supabase.from('reviews').insert({
        order_id: orderId,
        reviewer_id: params.reviewerId,
        reviewee_id: params.revieweeId,
        rating: params.rating,
        comment: params.comment || null,
      });

      if (!error) {
        // Update seller's rating
        const { data: allReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('reviewee_id', params.revieweeId);

        if (allReviews && allReviews.length > 0) {
          const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          await supabase
            .from('profiles')
            .update({
              seller_rating: Math.round(avgRating * 100) / 100,
              seller_review_count: allReviews.length,
            })
            .eq('id', params.revieweeId);
        }

        // Refetch the review
        const { data: newReview } = await supabase
          .from('reviews')
          .select('*')
          .eq('order_id', orderId)
          .single();
        setReview(newReview as Review | null);
      }

      return { error: error?.message || null };
    },
    [orderId]
  );

  return { review, loading, submitReview };
}

export function useSellerReviews(sellerId: string | undefined) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(display_name, avatar_url)')
        .eq('reviewee_id', sellerId!)
        .order('created_at', { ascending: false })
        .limit(20);

      setReviews((data as unknown as ReviewWithProfile[]) ?? []);
      setLoading(false);
    }

    fetch();
  }, [sellerId]);

  return { reviews, loading };
}
