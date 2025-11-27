import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const validateEnvVars = () => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      `Please configure these variables before starting the server.`
    );
  }
};

// Validate before creating client
validateEnvVars();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Create service role client for admin operations (if service role key is available)
export const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : supabase; // Fallback to anon key if service role not available