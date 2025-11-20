import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  (typeof window !== "undefined" ? (window as any).NEXT_PUBLIC_SUPABASE_URL : "");
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof window !== "undefined" ? (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY : "");

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types definition
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'worker' | 'homeowner' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'worker' | 'homeowner' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'worker' | 'homeowner' | 'admin';
          created_at?: string;
        };
      };
      // Add other tables as needed
    };
  };
}