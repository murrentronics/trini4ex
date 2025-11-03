import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hebnijyaqtjnityofarz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlYm5qanlhcXRqbml0eW9mYXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ1ODMsImV4cCI6MjA3NzY5MDU4M30.j_1mpE9t6PRmp9mUw3zfLY6EfHwjjzAp5P0A1k8LlR4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
