import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please add them to your .env file.');
}

// Custom storage adapter to encode/obfuscate data in localStorage
const secureStorage = {
  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Try to decode, if it fails, it might be an old unencoded session
      try {
        return decodeURIComponent(atob(item));
      } catch {
        return item; // Fallback to plain text for backward compatibility
      }
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      const encoded = btoa(encodeURIComponent(value));
      localStorage.setItem(key, encoded);
    } catch (e) {
      console.error('Error saving to local storage', e);
    }
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
