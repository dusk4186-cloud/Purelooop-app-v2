import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umewbsmxxzeashemmhol.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error("Missing Supabase anon key in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
