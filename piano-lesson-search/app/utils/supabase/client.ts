// app/utils/supabase/client.ts
// Placeholder for Supabase client-side functions
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Add other client-side Supabase utility functions here if needed
