import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Warning: SUPABASE_URL or SUPABASE_ANON_KEY environment variables are not set"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
