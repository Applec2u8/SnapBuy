import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  getActiveSessions,
  revokeSession,
  revokeAllOthers,
  type ParsedSession,
} from '../../../lib/sessionService';

export const useSecurity = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState<ParsedSession[]>([]);

  // ─── Load real sessions ──────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    if (!user?.id) return;
    setLoadingSessions(true);
    try {
      const data = await getActiveSessions(user.id);
      setSessions(data);
    } catch (err: any) {
      toast.error('Failed to load sessions: ' + err.message);
    } finally {
      setLoadingSessions(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ─── Password Reset ──────────────────────────────────────────────────────────
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Revoke All Others ────────────────────────────────────────────────────────
  const handleRevokeOthers = async () => {
    if (!user?.id) return;
    setRevoking(true);
    try {
      await revokeAllOthers(user.id);
      // Keep only the current session in UI
      setSessions((prev) => prev.filter((s) => s.current));
      toast.success('Successfully logged out from all other devices!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke sessions');
    } finally {
      setRevoking(false);
    }
  };

  // ─── Revoke Single Session ────────────────────────────────────────────────────
  const handleRevokeSingle = async (id: string) => {
    // Optimistic update
    setSessions((prev) => prev.filter((s) => s.id !== id));
    try {
      await revokeSession(id);
      toast.success('Session revoked successfully!');
    } catch (error: any) {
      // Rollback: reload sessions if Edge Function call failed
      toast.error('Failed to revoke session: ' + error.message);
      loadSessions();
    }
  };

  return {
    user,
    loading,
    revoking,
    loadingSessions,
    sessions,
    handlePasswordReset,
    handleRevokeOthers,
    handleRevokeSingle,
    navigate,
  };
};
