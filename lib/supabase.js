import { createClient } from '@supabase/supabase-js';

let client;

export function db() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required.');
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
