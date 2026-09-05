import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export const useUnreadCount = () => {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        // 1. Get all conversation IDs belonging to the user
        const { data: convs, error: convsError } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', user.id);

        if (convsError) throw convsError;

        if (convs && convs.length > 0) {
          const convIds = convs.map(c => c.id);
          // 2. Count messages in those conversations that are unread, not deleted, and sent by others
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .neq('sender_id', user.id)
            .eq('is_read', false)
            .eq('is_deleted', false);

          if (countError) throw countError;
          setUnreadCount(count || 0);
        } else {
          setUnreadCount(0);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnread();

    // 3. Real-time subscription to messages table modifications
    const channelName = `user-unread-messages-${user.id}-${Math.random().toString(36).substring(7)}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT (new message), UPDATE (marked read/deleted), DELETE
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return unreadCount;
};
