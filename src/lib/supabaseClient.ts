import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const envServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;

const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = envKey || 'public-anon-key';

export const isSupabaseConfigured = Boolean(envUrl && envKey);

if (!envUrl || !envKey) {
  console.warn('Supabase env vars missing. Configure .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY...). Using placeholder client.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const supabaseService =
  envServiceRole && envUrl
    ? createClient(supabaseUrl, envServiceRole, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    : null;
