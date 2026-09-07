import { supabase } from './supabase';
import type { ActivityActionType, ActivityTargetType } from '../pages/Admin/hooks/useAdminActivityLog';

/**
 * Helper to log admin actions directly from non-React environments or hooks.
 */
export const logAdminAction = async (
  action_type: ActivityActionType,
  target_type: ActivityTargetType,
  target_id?: string,
  target_name?: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('admin_activity_log').insert({
      admin_id: user.id,
      action_type,
      target_type,
      target_id: target_id ?? null,
      target_name: target_name ?? null,
      metadata: metadata ?? null,
    });
  } catch (e) {
    console.warn('[logAdminAction] Failed to write admin activity log:', e);
  }
};
