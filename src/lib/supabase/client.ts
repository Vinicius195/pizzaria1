import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: SupabaseClient<Database> | null = null;

// Only initialize Supabase if the environment variables are set and not placeholders
if (supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && supabaseAnonKey && !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseInstance;
