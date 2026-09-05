import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

export const useChat = (conversationId?: string, _shopId?: string) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(conversationId);

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId]);

  // Fetch or create conversation
  const getOrCreateConversation = useCallback(async (targetShopId: string) => {
    if (!user) return null;
    try {
      // Check for existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('shop_id', targetShopId)
        .maybeSingle();

      if (existing) {
        setActiveConversationId(existing.id);
        return existing.id;
      }

      // Create new
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id, shop_id: targetShopId }])
        .select('id')
        .single();

      if (createError) throw createError;
      setActiveConversationId(created.id);
      return created.id;
    } catch (error: any) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback(async (convId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Fetch messages
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Mark messages as read
      await markAsRead(convId);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [markAsRead]);

  // Upload image
  const uploadImage = async (file: File) => {
    if (!user) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  // Send message
  const sendMessage = async (content: string, imageUrl?: string) => {
    if (!user || !activeConversationId || (!content.trim() && !imageUrl)) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: activeConversationId,
            sender_id: user.id,
            content: content.trim() || '', // Send empty string instead of null to fix not-null constraint
            image_url: imageUrl || null
          }
        ]);

      if (error) throw error;

      // Update last message in conversation
      await supabase
        .from('conversations')
        .update({ 
          last_message: content.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', activeConversationId);

    } catch (error: any) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  // Soft-delete messages (mark as deleted, don't remove from DB)
  const deleteMessages = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_deleted: true, content: '', image_url: null })
        .in('id', ids)
        .eq('sender_id', user.id)
        .select();
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Failed to delete: RLS Policy issue. Make sure to run the UPDATE policy in Supabase.');
        return;
      }

      setMessages(prev => prev.map(m => ids.includes(m.id)
        ? { ...m, is_deleted: true, content: '', image_url: null }
        : m
      ));
      toast.success(ids.length > 1 ? `${ids.length} messages deleted` : 'Message deleted');
    } catch (error: any) {
      toast.error('Failed to delete message');
      console.error(error);
    }
  };

  // Edit a message
  const editMessage = async (id: string, newContent: string) => {
    if (!user || !newContent.trim()) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ content: newContent.trim(), is_edited: true })
        .eq('id', id)
        .eq('sender_id', user.id)
        .select();
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Failed to edit: RLS Policy issue. Make sure to run the UPDATE policy in Supabase.');
        return;
      }

      setMessages(prev => prev.map(m => m.id === id ? { ...m, content: newContent.trim(), is_edited: true } : m));
    } catch (error: any) {
      toast.error('Failed to edit message');
      console.error(error);
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!activeConversationId) return;

    fetchMessages(activeConversationId);

    const subscription = supabase
      .channel(`chat:${activeConversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          if (payload.new.sender_id !== user?.id) {
            await markAsRead(activeConversationId);
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` },
        (payload) => { setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m)); }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` },
        (payload) => { setMessages((prev) => prev.filter(m => m.id !== payload.old.id)); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeConversationId, fetchMessages, user, markAsRead]);

  return {
    messages,
    loading,
    sendMessage,
    deleteMessages,
    editMessage,
    uploadImage,
    getOrCreateConversation,
    activeConversationId
  };
};
