"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"

interface UserContextType {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured] = useState(() => isSupabaseConfigured())

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    const supabase = createSupabaseBrowser()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [isConfigured])

  const signOut = async () => {
    if (!isConfigured) return

    const supabase = createSupabaseBrowser()
    if (!supabase) return

    await supabase.auth.signOut()
  }

  return <UserContext.Provider value={{ user, loading, isConfigured, signOut }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
