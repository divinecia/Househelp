import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  (typeof window !== "undefined" ? (window as any).NEXT_PUBLIC_SUPABASE_URL : "");
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof window !== "undefined" ? (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY : "");

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = any;
