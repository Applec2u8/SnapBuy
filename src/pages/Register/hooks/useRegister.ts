import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export const useRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        // Map Supabase error codes/messages to user-friendly text
        const msg = error.message?.toLowerCase() ?? '';
        if (error.status === 500) {
          throw new Error(
            'Server error: the database may not be configured yet. Please contact support or try again later.'
          );
        } else if (msg.includes('already registered') || msg.includes('user already exists')) {
          throw new Error('This email is already registered. Try logging in instead.');
        } else if (msg.includes('rate limit') || error.status === 429) {
          throw new Error('Too many attempts. Please wait a few minutes and try again.');
        } else if (msg.includes('password') || msg.includes('weak')) {
          throw new Error('Password is too weak. Use at least 6 characters.');
        } else if (msg.includes('valid email') || msg.includes('invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else {
          throw error;
        }
      }

      // Supabase returns a user even without email confirmation
      if (data.user && !data.session) {
        toast.success('Registration successful! Please check your email to confirm your account.');
        navigate('/login');
      } else {
        toast.success('Registration successful! Welcome to SnapBuy.');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to register. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to register with Google');
    }
  };

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    handleRegister,
    handleGoogleRegister
  };
};
