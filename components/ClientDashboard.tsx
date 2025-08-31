"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import FinancialDashboard from "./financial-dashboard"
import Header from "./Header"
import { UserProvider } from "@/lib/contexts/UserContext"

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (supabase) {
      // Verificar usuário atual
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        setLoading(false)
      })

      // Escutar mudanças de autenticação
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } else {
      // Modo demo sem Supabase
      setUser({ id: "demo", email: "demo@example.com" })
      setLoading(false)
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <FinancialDashboard />
        </main>
      </div>
    </UserProvider>
  )
}
