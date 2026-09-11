// lib/supabaseClient.js
// Server-side Supabase client. Reads credentials from environment
// variables (see .env.example) — never hard-code keys here.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
    'Copy .env.example to .env.local and fill in your Supabase project values.'
  );
}

// Uses the service role key because these calls happen in API routes
// (server-side only) and need to bypass row-level security to insert
// Leads/Tasks/Contacts/Deals on the visitor's behalf.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
