import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../shared/types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY",
  );
}

if (!supabaseServiceRoleKey) {
  console.error(
    "ERROR: SUPABASE_SERVICE_ROLE_KEY is not set. User creation will fail.",
  );
  console.error("Please set SUPABASE_SERVICE_ROLE_KEY in your .env file.");
  console.error(
    "You can find it in your Supabase project settings under API keys.",
  );
} else {
  console.log(
    "✅ SUPABASE_SERVICE_ROLE_KEY is set (length:",
    supabaseServiceRoleKey.length,
    ")",
  );
}

// Server-side client with anon key for development
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin client with service role key for administrative operations (user creation, etc.)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
