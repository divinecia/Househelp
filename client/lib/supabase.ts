import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../shared/types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  (typeof window !== "undefined" ? (window as any).NEXT_PUBLIC_SUPABASE_URL : "");
// Prefer publishable key when provided; fall back to anon
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof window !== "undefined" ? (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY : "");

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found in environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);