"use client"

import { useUser } from "@/lib/contexts/UserContext"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoginForm from "@/components/LoginForm"
import Header from "@/components/Header"
import FinancialControl from "@/financial-control"

export default function HomePage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.push("/setup")
    }
  }, [router])

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuração Necessária</h1>
          <p className="text-gray-600">Redirecionando para configuração...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema Financeiro Pessoal</h1>
            <p className="text-gray-600">Gerencie suas finanças de forma simples e eficiente</p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FinancialControl />
      </main>
    </div>
  )
}
