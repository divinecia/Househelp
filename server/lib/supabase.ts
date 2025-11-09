import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "placeholder-key";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️  SUPABASE_URL or SUPABASE_ANON_KEY environment variables are not set. " +
      "Database operations will fail until these are configured."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
