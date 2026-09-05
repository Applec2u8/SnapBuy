/**
 * sessionService.ts
 * Real session management service — replaces mock data in useSecurity.ts
 * Handles: recording logins, querying active sessions, revoking sessions
 */

import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string | null;
  device_name: string;
  browser: string;
  os: string | null;
  ip_address: string | null;
  is_revoked: boolean;
  logged_in_at: string;
  last_active_at: string;
  logged_out_at: string | null;
}

export interface ParsedSession extends UserSession {
  current: boolean;       // true if this is the session from current tab
  lastActiveLabel: string; // human-readable "Active Now", "2 hours ago", etc.
}

// ─── User-Agent Parser ────────────────────────────────────────────────────────

/**
 * Parse browser name from user-agent string
 */
function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if (/MSIE|Trident/.test(ua)) return 'Internet Explorer';
  return 'Unknown Browser';
}

/**
 * Parse OS / device name from user-agent string
 */
function parseDeviceName(ua: string): { device: string; os: string } {
  // Mobile detection first
  if (/iPhone/.test(ua)) {
    const match = ua.match(/CPU iPhone OS ([\d_]+)/);
    const version = match ? match[1].replace(/_/g, '.') : '';
    return { device: `iPhone (iOS ${version})`, os: 'iOS' };
  }
  if (/iPad/.test(ua)) return { device: 'iPad', os: 'iPadOS' };
  if (/Android/.test(ua)) {
    const match = ua.match(/Android ([^;)]+)/);
    const device = ua.match(/;\s*([^;)]+)\s*Build/)?.[1]?.trim() || 'Android Device';
    return { device, os: `Android ${match ? match[1] : ''}`.trim() };
  }

  // Desktop detection
  if (/Macintosh|Mac OS X/.test(ua)) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    const version = match ? match[1].replace(/_/g, '.') : '';
    return { device: `Mac (macOS ${version})`, os: 'macOS' };
  }
  if (/Windows NT/.test(ua)) {
    const ntMap: Record<string, string> = {
      '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7',
    };
    const match = ua.match(/Windows NT ([\d.]+)/);
    const winVer = match ? ntMap[match[1]] || match[1] : '';
    return { device: `Windows PC${winVer ? ` (Windows ${winVer})` : ''}`, os: 'Windows' };
  }
  if (/Linux/.test(ua)) return { device: 'Linux PC', os: 'Linux' };
  if (/CrOS/.test(ua)) return { device: 'Chromebook', os: 'ChromeOS' };

  return { device: 'Unknown Device', os: 'Unknown' };
}

/**
 * Format relative time label
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return 'Active Now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Session Operations ───────────────────────────────────────────────────────

/**
 * Record a new login session when user signs in.
 * Called from App.tsx onAuthStateChange SIGNED_IN event.
 */
export async function recordLoginSession(
  userId: string,
  supabaseSessionId?: string | null
): Promise<string | null> {
  try {
    const ua = navigator.userAgent;
    const browser = parseBrowser(ua);
    const { device: deviceName, os } = parseDeviceName(ua);

    // Try to get IP from public API (best effort)
    let ipAddress: string | null = null;
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        ipAddress = data.ip ?? null;
      }
    } catch {
      // IP fetch failed — continue without it
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_id: supabaseSessionId ?? null,
        device_name: deviceName,
        browser,
        os,
        ip_address: ipAddress,
        logged_in_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[sessionService] Failed to record login session:', error.message);
      return null;
    }

    // Persist this session's DB id in sessionStorage (not localStorage — tab-scoped)
    if (data?.id) {
      sessionStorage.setItem('snapbuy_session_db_id', data.id);
    }

    return data?.id ?? null;
  } catch (e) {
    console.warn('[sessionService] recordLoginSession error:', e);
    return null;
  }
}

/**
 * Update logged_out_at when user signs out.
 * Called from App.tsx onAuthStateChange SIGNED_OUT event.
 */
export async function recordLogout(userId: string): Promise<void> {
  try {
    const sessionDbId = sessionStorage.getItem('snapbuy_session_db_id');
    if (!sessionDbId) return;

    await supabase
      .from('user_sessions')
      .update({ logged_out_at: new Date().toISOString() })
      .eq('id', sessionDbId)
      .eq('user_id', userId);

    sessionStorage.removeItem('snapbuy_session_db_id');
  } catch (e) {
    console.warn('[sessionService] recordLogout error:', e);
  }
}

/**
 * Update last_active_at for the current session (called periodically or on activity).
 */
export async function updateLastActive(): Promise<void> {
  try {
    const sessionDbId = sessionStorage.getItem('snapbuy_session_db_id');
    if (!sessionDbId) return;
    await supabase
      .from('user_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', sessionDbId);
  } catch {
    // silent fail — not critical
  }
}

/**
 * Fetch all active (non-revoked, not logged out) sessions for a user.
 * Returns sessions sorted by last_active_at descending.
 */
export async function getActiveSessions(userId: string): Promise<ParsedSession[]> {
  try {
    const currentSessionDbId = sessionStorage.getItem('snapbuy_session_db_id');

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_revoked', false)
      .is('logged_out_at', null)
      .order('last_active_at', { ascending: false });

    if (error) {
      console.warn('[sessionService] getActiveSessions error:', error.message);
      return [];
    }

    return (data ?? []).map((s: UserSession) => ({
      ...s,
      current: s.id === currentSessionDbId,
      lastActiveLabel: formatRelativeTime(s.last_active_at),
    }));
  } catch (e) {
    console.warn('[sessionService] getActiveSessions error:', e);
    return [];
  }
}

/**
 * Fetch login history (all sessions, including logged-out ones) for a user.
 * Sorted by logged_in_at descending, limited to 50 most recent.
 */
export async function getLoginHistory(userId: string, limit = 50): Promise<ParsedSession[]> {
  try {
    const currentSessionDbId = sessionStorage.getItem('snapbuy_session_db_id');

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('logged_in_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[sessionService] getLoginHistory error:', error.message);
      return [];
    }

    return (data ?? []).map((s: UserSession) => ({
      ...s,
      current: s.id === currentSessionDbId,
      lastActiveLabel: s.logged_out_at
        ? `Logged out ${formatRelativeTime(s.logged_out_at)}`
        : formatRelativeTime(s.last_active_at),
    }));
  } catch (e) {
    console.warn('[sessionService] getLoginHistory error:', e);
    return [];
  }
}

/**
 * Revoke a single session by marking it as revoked in the DB.
 * Note: This removes it from the active sessions view immediately.
 * The underlying Supabase auth token will expire naturally (no Edge Function needed).
 */
export async function revokeSession(sessionDbId: string): Promise<void> {
  const { error } = await supabase
    .from('user_sessions')
    .update({
      is_revoked: true,
      logged_out_at: new Date().toISOString(),
    })
    .eq('id', sessionDbId);

  if (error) {
    throw new Error('Failed to revoke session: ' + error.message);
  }
}

/**
 * Revoke all sessions except the current one.
 * Uses Supabase built-in signOut({ scope: 'others' }) + marks DB records as revoked.
 */
export async function revokeAllOthers(userId: string): Promise<void> {
  // 1. Supabase revoke all other Supabase auth sessions
  const { error } = await supabase.auth.signOut({ scope: 'others' });
  if (error) throw error;

  // 2. Mark all other DB sessions as revoked
  const currentSessionDbId = sessionStorage.getItem('snapbuy_session_db_id');
  const query = supabase
    .from('user_sessions')
    .update({ is_revoked: true, logged_out_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_revoked', false)
    .is('logged_out_at', null);

  if (currentSessionDbId) {
    query.neq('id', currentSessionDbId);
  }

  await query;
}
