/**
 * otpService.ts
 * Client-side OTP generation and verification for password change flow.
 * Uses EmailJS to send OTP emails.
 */

import emailjs from '@emailjs/browser';
import { supabase } from './supabase';

// OTP expires after 5 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000;

// ─── In-memory OTP store (per session) ───────────────────────────────────────
interface OTPRecord {
  code: string;
  expiresAt: number;
  email: string;
  attempts: number;
}

let currentOTP: OTPRecord | null = null;

// ─── Generate OTP ─────────────────────────────────────────────────────────────
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send OTP via EmailJS ─────────────────────────────────────────────────────
export async function sendOTP(email: string, userName?: string): Promise<void> {
  // Fetch active EmailJS config from database
  const { data: config, error } = await supabase
    .from('emailjs_configs')
    .select('service_id, template_id, public_key')
    .eq('is_active', true)
    .single();

  if (error || !config) {
    throw new Error('EmailJS is not configured. Please set up a config in the Admin Site Settings.');
  }

  const { service_id, template_id, public_key } = config;

  const code = generateOTPCode();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  // Save to memory store
  currentOTP = { code, expiresAt, email, attempts: 0 };

  // Format expiry time for email display
  const expiryMinutes = Math.round(OTP_EXPIRY_MS / 60000);

  try {
    await emailjs.send(
      service_id,
      template_id,
      {
        to_email:    email,
        to_name:     userName || email.split('@')[0],
        otp_code:    code,
        expiry_time: `${expiryMinutes} minutes`,
        sent_time:   new Date().toLocaleString('th-TH', {
          timeZone: 'Asia/Bangkok',
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      },
      public_key
    );
  } catch (err: any) {
    console.error('EmailJS Error:', err);
    if (err && err.text) {
      throw new Error(`EmailJS Error: ${err.text}`);
    } else if (err instanceof Error) {
      throw err;
    } else {
      throw new Error('An unknown error occurred while sending email.');
    }
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export type OTPVerifyResult =
  | { success: true; reason?: never }
  | { success: false; reason: 'expired' | 'wrong' | 'locked' | 'no_otp' };

export function verifyOTP(inputCode: string): OTPVerifyResult {
  if (!currentOTP) {
    return { success: false, reason: 'no_otp' };
  }

  if (Date.now() > currentOTP.expiresAt) {
    currentOTP = null;
    return { success: false, reason: 'expired' };
  }

  // Lock after 5 wrong attempts
  if (currentOTP.attempts >= 5) {
    return { success: false, reason: 'locked' };
  }

  if (inputCode.trim() !== currentOTP.code) {
    currentOTP.attempts += 1;
    return { success: false, reason: 'wrong' };
  }

  // Correct — clear OTP so it can't be reused
  currentOTP = null;
  return { success: true };
}

// ─── Clear OTP (cancel flow) ──────────────────────────────────────────────────
export function clearOTP(): void {
  currentOTP = null;
}

// ─── Get remaining seconds ────────────────────────────────────────────────────
export function getOTPRemainingSeconds(): number {
  if (!currentOTP) return 0;
  return Math.max(0, Math.round((currentOTP.expiresAt - Date.now()) / 1000));
}

// ─── Check if OTP is active ───────────────────────────────────────────────────
export function hasActiveOTP(): boolean {
  return currentOTP !== null && Date.now() < currentOTP.expiresAt;
}
