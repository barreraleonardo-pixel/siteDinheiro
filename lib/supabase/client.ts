import { createBrowserClient } from "@supabase/ssr"

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function createSupabaseBrowser() {
  if (!isSupabaseConfigured()) {
    return null
  }

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Named export for compatibility
export const supabase = createSupabaseBrowser()

// Default export
export default createSupabaseBrowser()
