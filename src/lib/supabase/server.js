import { createClient } from '@supabase/supabase-js';
import { MockSupabaseClient } from './mockStore';

const isMock =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('SEU-PROJETO');

export function createServerClient() {
  if (isMock) {
    return new MockSupabaseClient();
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
