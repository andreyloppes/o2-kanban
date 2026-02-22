import { createBrowserClient } from '@supabase/ssr';

let client;

export function getSupabaseClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return client;
}

// Manter export nomeado para compatibilidade
export const supabase = typeof window !== 'undefined'
  ? getSupabaseClient()
  : null;
