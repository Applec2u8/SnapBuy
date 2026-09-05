import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

// ── Types ────────────────────────────────────────────────────────────

export type ActivityActionType =
  | 'boost_views'
  | 'boost_likes'
  | 'update_role'
  | 'update_user'
  | 'update_product'
  | 'toggle_auto_boost'
  | 'toggle_auto_like_boost'
  | 'allow_credit_card'
  | 'top_up_wallet'
  | 'deduct_wallet';

export type ActivityTargetType = 'product' | 'user';

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  action_type: ActivityActionType;
  target_type: ActivityTargetType;
  target_id: string | null;
  target_name: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export interface LogActionParams {
  action_type: ActivityActionType;
  target_type: ActivityTargetType;
  target_id?: string;
  target_name?: string;
  metadata?: Record<string, unknown>;
}

// ── Hook ─────────────────────────────────────────────────────────────

export const useAdminActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the latest 50 log entries
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching admin activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Insert a new log entry and prepend it to local state immediately
  const logAction = useCallback(async (params: LogActionParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const entry = {
        admin_id: user.id,
        action_type: params.action_type,
        target_type: params.target_type,
        target_id: params.target_id ?? null,
        target_name: params.target_name ?? null,
        metadata: params.metadata ?? null,
      };

      const { data, error } = await supabase
        .from('admin_activity_log')
        .insert(entry)
        .select('*, profiles(full_name)')
        .single();

      if (error) throw error;

      // Prepend to local list immediately (optimistic UI)
      setLogs(prev => [data, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      console.error('Error logging admin action:', err);
    }
  }, []);

  // Mark all as read (reset badge)
  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    logs,
    unreadCount,
    isLoading,
    fetchLogs,
    logAction,
    markAllRead,
  };
};
