import { supabase } from './supabase';

export type ImportProvider = 'unsplash' | 'dummyjson' | 'hybrid';

const PROVIDER_SETTING_KEY = 'import_image_provider';

/**
 * Fetches the currently active import provider from site_settings.
 * Defaults to 'unsplash' if not set.
 */
export async function getImportProvider(): Promise<ImportProvider> {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', PROVIDER_SETTING_KEY)
      .maybeSingle();
    if (data?.value === 'dummyjson') return 'dummyjson';
    if (data?.value === 'hybrid') return 'hybrid';
  } catch {
    // ignore, fall through to default
  }
  return 'unsplash';
}

/**
 * Persists the chosen import provider to site_settings.
 */
export async function setImportProvider(provider: ImportProvider): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key: PROVIDER_SETTING_KEY, value: provider, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) throw error;
}
