import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith("https://") && url.includes(".supabase.co")
  } catch {
    return false
  }
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found - running in demo mode")
    return null
  }

  if (!isValidUrl(supabaseUrl)) {
    console.warn("Invalid Supabase URL format - running in demo mode")
    return null
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error) {
    console.warn("Failed to create Supabase server client:", error)
    return null
  }
}
