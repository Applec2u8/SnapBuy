import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

const SUPPORT_SHOP_ID = '00000000-0000-0000-0000-000000000000';

export const useAdminSupportNotification = (onNavigateToMessages?: () => void) => {
  const { user } = useAuthStore();
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const isInitialLoad = useRef(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      // Count messages in Support conversations not sent by the current admin user
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .eq('shop_id', SUPPORT_SHOP_ID);

      if (!convs || convs.length === 0) {
        setUnreadSupportCount(0);
        return;
      }

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convs.map(c => c.id))
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .eq('is_deleted', false);

      setUnreadSupportCount(count || 0);
    } catch (err) {
      console.error('Error fetching support unread count:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Initial fetch (silently)
    fetchUnreadCount();
    isInitialLoad.current = false;

    // Subscribe to new messages on conversations for the support shop
    const channel = supabase
      .channel('admin-support-notification')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as any;

          // Ignore messages sent by the admin themselves
          if (newMsg.sender_id === user.id) return;

          // Check if this message is in a support conversation
          const { data: conv } = await supabase
            .from('conversations')
            .select('id, user_id')
            .eq('id', newMsg.conversation_id)
            .eq('shop_id', SUPPORT_SHOP_ID)
            .maybeSingle();

          if (!conv) return; // Not a support message

          // Fetch sender name
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMsg.sender_id)
            .maybeSingle();

          const senderName = senderProfile?.full_name || 'Customer';
          const msgPreview = newMsg.content
            ? newMsg.content.length > 40
              ? newMsg.content.substring(0, 40) + '...'
              : newMsg.content
            : '📷 Sent an image';

          // Show toast notification
          toast.info(`💬 ${senderName}: ${msgPreview}`, {
            description: 'New support message received',
            duration: 6000,
            action: onNavigateToMessages
              ? {
                  label: 'View',
                  onClick: onNavigateToMessages,
                }
              : undefined,
          });

          // Update unread count
          setUnreadSupportCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount, onNavigateToMessages]);

  const clearSupportUnread = useCallback(() => {
    setUnreadSupportCount(0);
  }, []);

  return { unreadSupportCount, clearSupportUnread, refetchCount: fetchUnreadCount };
};
