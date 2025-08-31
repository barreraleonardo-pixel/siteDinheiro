"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import FinancialDashboard from "./financial-dashboard"
import Header from "./Header"
import { UserProvider } from "@/lib/contexts/UserContext"

// Dados de demonstração
const demoData = {
  transactions: [
    {
      id: "1",
      description: "Salário",
      amount: 5000,
      type: "income" as const,
      category: "Trabalho",
      date: new Date().toISOString().split("T")[0],
      user_id: "demo",
    },
    {
      id: "2",
      description: "Supermercado",
      amount: -350,
      type: "expense" as const,
      category: "Alimentação",
      date: new Date().toISOString().split("T")[0],
      user_id: "demo",
    },
    {
      id: "3",
      description: "Conta de luz",
      amount: -120,
      type: "expense" as const,
      category: "Utilidades",
      date: new Date().toISOString().split("T")[0],
      user_id: "demo",
    },
  ],
  budgets: [
    {
      id: "1",
      category: "Alimentação",
      limit: 800,
      spent: 350,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      user_id: "demo",
    },
    {
      id: "2",
      category: "Transporte",
      limit: 400,
      spent: 150,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      user_id: "demo",
    },
  ],
  goals: [
    {
      id: "1",
      title: "Reserva de Emergência",
      target_amount: 10000,
      current_amount: 3500,
      target_date: "2024-12-31",
      user_id: "demo",
    },
    {
      id: "2",
      title: "Viagem de Férias",
      target_amount: 5000,
      current_amount: 1200,
      target_date: "2024-07-01",
      user_id: "demo",
    },
  ],
}

interface ClientDashboardProps {
  user: User | null
}

export default function ClientDashboard({ user }: ClientDashboardProps) {
  const [isDemo, setIsDemo] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Verificar se está em modo demo
    if (!supabase) {
      setIsDemo(true)
    }
  }, [supabase])

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} isDemo={isDemo} />
        <main className="container mx-auto px-4 py-8">
          {isDemo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-blue-800 font-medium">Modo Demonstração Ativo</p>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Você está visualizando dados de exemplo. Para salvar seus dados reais, configure o Supabase na página de{" "}
                <a href="/setup" className="underline font-medium">
                  configuração
                </a>
                .
              </p>
            </div>
          )}
          <FinancialDashboard initialData={isDemo ? demoData : undefined} isDemo={isDemo} />
        </main>
      </div>
    </UserProvider>
  )
}
