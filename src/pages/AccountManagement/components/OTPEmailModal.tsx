import { useState, useEffect, useRef } from 'react';
import { X, Mail, Loader2, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { sendOTP, verifyOTP, clearOTP, getOTPRemainingSeconds } from '../../../lib/otpService';
import { toast } from 'sonner';

// ─── Step Types ───────────────────────────────────────────────────────────────
type Step = 'send' | 'verify' | 'newemail' | 'verify_new' | 'success';

interface OTPEmailModalProps {
  email: string;
  userName?: string;
  onClose: () => void;
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────
function useCountdown(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    setSeconds(getOTPRemainingSeconds());
    const id = setInterval(() => {
      const rem = getOTPRemainingSeconds();
      setSeconds(rem);
      if (rem <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
}

// ─── OTP Input Box (6 separate digit inputs) ──────────────────────────────────
interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        next[index - 1] = '';
        onChange(next.join(''));
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(paste.padEnd(6, '').slice(0, 6));
    refs.current[Math.min(paste.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={`
            w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none
            bg-slate-50 dark:bg-slate-800
            ${digits[i]
              ? 'border-primary-500 text-primary-500 dark:text-primary-400 shadow-lg shadow-primary-500/10'
              : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
            }
            focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/20
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const OTPEmailModal = ({ email, userName, onClose }: OTPEmailModalProps) => {
  const [step, setStep] = useState<Step>('send');
  const [otpValue, setOtpValue] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const countdown = useCountdown(step === 'verify' || step === 'verify_new');

  // Allow resend after 60 seconds
  useEffect(() => {
    if (step !== 'verify' && step !== 'verify_new') return;
    setCanResend(false);
    const t = setTimeout(() => setCanResend(true), 60000);
    return () => clearTimeout(t);
  }, [step]);

  // Auto-close success after 2.5s and sign out
  useEffect(() => {
    if (step !== 'success') return;
    const t = setTimeout(async () => {
      onClose();
      // Force user to log in again with new email
      const { signOut } = await import('../../../store/useAuthStore').then(m => m.useAuthStore.getState());
      await signOut();
    }, 2500);
    return () => clearTimeout(t);
  }, [step, onClose]);

  // Auto-submit OTP
  useEffect(() => {
    if (otpValue.length === 6 && !loading) {
      if (step === 'verify') {
        handleVerifyOTP();
      } else if (step === 'verify_new') {
        handleVerifyNewOTP();
      }
    }
  }, [otpValue]);

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await sendOTP(email, userName);
      setStep('verify');
      setOtpValue('');
      toast.success('OTP sent! Check your current email inbox.');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewEmailOTP = async () => {
    if (!newEmail.includes('@') || newEmail.length < 5) {
      setError('Please enter a valid email address.');
      return;
    }
    if (newEmail.toLowerCase() === email.toLowerCase()) {
      setError('New email must be different from the current one.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOTP(newEmail, userName);
      setStep('verify_new');
      setOtpValue('');
      toast.success('OTP sent to your new email!');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP to new email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (otpValue.length < 6) return;
    const result = verifyOTP(otpValue);
    if (result.success) {
      setStep('newemail');
      setError('');
    } else {
      const msgs: Record<string, string> = {
        expired:  'OTP has expired. Please request a new one.',
        wrong:    'Incorrect code. Please try again.',
        locked:   'Too many attempts. Please request a new OTP.',
        no_otp:   'No active OTP found. Please request a new one.',
      };
      setError(msgs[result.reason] || 'Invalid OTP.');
      if (result.reason === 'locked' || result.reason === 'expired') {
        setStep('send');
        setOtpValue('');
      }
    }
  };

  const handleVerifyNewOTP = async () => {
    if (otpValue.length < 6) return;
    const result = verifyOTP(otpValue);
    
    if (!result.success) {
      const msgs: Record<string, string> = {
        expired:  'OTP has expired. Please request a new one.',
        wrong:    'Incorrect code. Please try again.',
        locked:   'Too many attempts. Please request a new OTP.',
        no_otp:   'No active OTP found. Please request a new one.',
      };
      setError(msgs[result.reason] || 'Invalid OTP.');
      if (result.reason === 'locked' || result.reason === 'expired') {
        setStep('newemail');
        setOtpValue('');
      }
      return;
    }

    // OTP Verified! Now update the email in Supabase.
    setLoading(true);
    setError('');
    try {
      // Use RPC to update email directly without Supabase's built-in confirmation link
      const { error } = await supabase.rpc('update_user_email', { new_email: newEmail });
      if (error) {
        // Fallback to normal updateUser if RPC is not created yet
        const { error: fallbackError } = await supabase.auth.updateUser({ email: newEmail });
        if (fallbackError) throw fallbackError;
      }
      
      setStep('success');
      toast.success('Email changed successfully!');
    } catch (e: any) {
      setError(e.message || 'Failed to update email in system.');
      setStep('newemail');
      setOtpValue('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    clearOTP();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">

        {/* Decorative gradient top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-purple-500 to-blue-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Change Email</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {step === 'send' && 'VERIFY YOUR IDENTITY'}
                {step === 'verify' && 'ENTER OTP CODE'}
                {step === 'newemail' && 'SET NEW EMAIL'}
                {step === 'verify_new' && 'VERIFY NEW EMAIL'}
                {step === 'success' && 'ALL DONE!'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-8 pt-5">
          {(['send', 'verify', 'newemail', 'verify_new'] as Step[]).map((s, i) => {
            const stepOrder = ['send', 'verify', 'newemail', 'verify_new', 'success'];
            const currentIndex = stepOrder.indexOf(step);
            const isPassed = currentIndex > i;
            const isCurrent = currentIndex === i;
            
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  isCurrent ? 'bg-primary-500 text-white scale-110' :
                  isPassed ? 'bg-green-500 text-white' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {isPassed ? '✓' : i + 1}
                </div>
                {i < 3 && <div className={`flex-1 h-0.5 w-6 transition-all ${isPassed ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-8 py-7 space-y-5">

          {/* ── STEP 1: Send OTP ── */}
          {step === 'send' && (
            <>
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-3 items-start">
                <Mail size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    We'll send a 6-digit OTP to:
                  </p>
                  <p className="text-sm font-black text-primary-500 mt-0.5 break-all">{email}</p>
                  <p className="text-[10px] text-slate-400 mt-1">The code expires in 5 minutes.</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Mail size={16} /> Send OTP to Email</>}
              </button>
            </>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === 'verify' && (
            <>
              <div className="text-center space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">Enter the 6-digit code sent to</p>
                <p className="text-sm font-black text-primary-500">{email}</p>
                {countdown > 0 ? (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </p>
                ) : (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">OTP Expired</p>
                )}
              </div>

              <OTPInput value={otpValue} onChange={setOtpValue} disabled={loading} />

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otpValue.length < 6}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Code'}
              </button>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleSendOTP}
                  disabled={!canResend || loading}
                  className="text-[10px] text-slate-400 hover:text-primary-500 transition-colors disabled:opacity-40 flex items-center gap-1 font-bold uppercase tracking-widest"
                >
                  <RefreshCw size={10} /> {canResend ? 'Resend OTP' : 'Resend in 60s'}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: New Email ── */}
          {step === 'newemail' && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    New Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. you@example.com"
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                onClick={handleSendNewEmailOTP}
                disabled={loading || !newEmail.includes('@')}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send OTP to New Email'}
              </button>
            </>
          )}

          {/* ── STEP 4: Verify New Email OTP ── */}
          {step === 'verify_new' && (
            <>
              <div className="text-center space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">Enter the 6-digit code sent to your new email</p>
                <p className="text-sm font-black text-primary-500">{newEmail}</p>
                {countdown > 0 ? (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </p>
                ) : (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">OTP Expired</p>
                )}
              </div>

              <OTPInput value={otpValue} onChange={setOtpValue} disabled={loading} />

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                onClick={handleVerifyNewOTP}
                disabled={loading || otpValue.length < 6}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Change'}
              </button>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleSendNewEmailOTP}
                  disabled={!canResend || loading}
                  className="text-[10px] text-slate-400 hover:text-primary-500 transition-colors disabled:opacity-40 flex items-center gap-1 font-bold uppercase tracking-widest"
                >
                  <RefreshCw size={10} /> {canResend ? 'Resend OTP' : 'Resend in 60s'}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 5: Success ── */}
          {step === 'success' && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-pulse">
                <ShieldCheck size={40} className="text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Email Changed!</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Your email address has been successfully updated.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPEmailModal;
