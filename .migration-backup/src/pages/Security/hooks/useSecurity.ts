import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

export const useSecurity = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const [sessions, setSessions] = useState([
    { id: 1, device: 'iPhone 15 Pro', browser: 'Safari', location: 'Bangkok, TH', lastActive: 'Active Now', current: true },
    { id: 2, device: 'MacBook Air M2', browser: 'Chrome', location: 'Nonthaburi, TH', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Windows PC', browser: 'Edge', location: 'Samut Prakan, TH', lastActive: '2 days ago', current: false },
  ]);

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

  const handleRevokeOthers = async () => {
    setRevoking(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      
      setSessions(sessions.filter(s => s.current));
      toast.success('Successfully logged out from all other devices!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeSingle = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
    toast.success('Session revoked!');
  };

  return {
    user,
    loading,
    revoking,
    sessions,
    handlePasswordReset,
    handleRevokeOthers,
    handleRevokeSingle,
    navigate
  };
};
