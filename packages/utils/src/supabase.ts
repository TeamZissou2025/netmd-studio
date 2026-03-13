import { createClient } from '@supabase/supabase-js';
import type { Database } from '@netmd-studio/types';

export function createSupabaseClient() {
  return createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
}

// Server-side only — used in API routes and edge functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSupabaseAdmin(url?: string, serviceRoleKey?: string) {
  const supabaseUrl = url ?? (globalThis as any).process?.env?.SUPABASE_URL;
  const key = serviceRoleKey ?? (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY;
  return createClient<Database>(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
