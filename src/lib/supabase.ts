import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Firefox ETP compatibility: Disable localStorage if restricted
let storage: 'localStorage' | 'memory' = 'localStorage'
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
} catch (e) {
  // Firefox ETP or private mode restricts localStorage
  storage = 'memory'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage === 'memory' ? undefined : localStorage,
    autoRefreshToken: true,
    persistSession: storage === 'localStorage',
    detectSessionInUrl: true,
  },
})
