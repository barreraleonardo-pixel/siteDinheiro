"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/contexts/UserContext"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import FinancialDashboard from "@/components/financial-dashboard"

export default function HomePage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading) {
      if (!isSupabaseConfigured()) {
        router.push("/setup")
        return
      }

      if (!user) {
        router.push("/login")
        return
      }
    }
  }, [mounted, loading, user, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Configuração Necessária</h2>
              <p className="text-gray-600 mb-4">Configure o Supabase para usar o sistema</p>
              <Button onClick={() => router.push("/setup")}>Ir para Configuração</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Acesso Necessário</h2>
              <p className="text-gray-600 mb-4">Faça login para acessar o sistema</p>
              <Button onClick={() => router.push("/login")}>Fazer Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <FinancialDashboard />
}
