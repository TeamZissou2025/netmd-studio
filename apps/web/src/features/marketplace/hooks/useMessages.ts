import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '@netmd-studio/types';

type Message = Database['public']['Tables']['messages']['Row'];

export function useMessages(orderId: string | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime messages for this order
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!orderId || !userId || !body.trim()) return;

      const { error } = await supabase.from('messages').insert({
        order_id: orderId,
        sender_id: userId,
        body: body.trim(),
      });

      return { error };
    },
    [orderId, userId]
  );

  const markAsRead = useCallback(
    async () => {
      if (!orderId || !userId) return;

      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .neq('sender_id', userId)
        .is('read_at', null);
    },
    [orderId, userId]
  );

  return { messages, loading, sendMessage, markAsRead };
}
