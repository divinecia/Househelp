import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Warning: SUPABASE_URL or SUPABASE_ANON_KEY environment variables are not set. " +
        "Database operations will fail until these are configured."
    );
    // Return a dummy client that won't be used if env vars are missing
    // This allows the app to start without crashing
    return createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseKey || "placeholder-key"
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
}

export const supabase = new Proxy(
  {} as SupabaseClient,
  {
    get: (_target, prop) => {
      return Reflect.get(getSupabaseClient(), prop);
    },
  }
) as SupabaseClient;
