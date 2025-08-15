"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity, TrendingUp, Target, BarChart3, PieChart, AlertTriangle } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface MonthlyGoal {
  id: string
  category: string
  target_amount: number
  current_amount: number
  month: string
  year: number
}

export default function InteracoesPanel() {
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClient()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && supabase) {
      loadData()
    }
  }, [user, supabase])

  const loadData = async () => {
    if (!supabase) return

    try {
      // Load transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from("transacoes")
        .select("*")
        .eq("usuario_id", user?.id)
        .order("data_transacao", { ascending: false })

      if (transactionError) throw transactionError

      // Convert data to match Transaction interface
      const convertedData: Transaction[] = (transactionData || []).map((item) => ({
        id: item.id,
        user_id: item.usuario_id,
        type: item.tipo === "receita" ? "income" : "expense",
        category: item.categoria,
        description: item.descricao,
        amount: Number(item.valor),
        date: item.data_transacao,
        created_at: item.created_at,
      }))

      setTransactions(convertedData)

      // Simulate monthly goals
      const mockGoals: MonthlyGoal[] = [
        {
          id: "1",
          category: "Alimentação",
          target_amount: 800,
          current_amount: 650,
          month: "dezembro",
          year: 2024,
        },
        {
          id: "2",
          category: "Transporte",
          target_amount: 400,
          current_amount: 320,
          month: "dezembro",
          year: 2024,
        },
        {
          id: "3",
          category: "Lazer",
          target_amount: 300,
          current_amount: 450,
          month: "dezembro",
          year: 2024,
        },
      ]

      setMonthlyGoals(mockGoals)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRecentActivity = () => {
    return transactions.slice(0, 5).map((t) => ({
      id: t.id,
      description: `${t.type === "income" ? "Receita" : "Despesa"}: ${t.description}`,
      amount: t.amount,
      type: t.type,
      date: t.date,
    }))
  }

  const getMonthlyInsights = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })

    const totalIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: monthlyTransactions.length,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const recentActivity = getRecentActivity()
  const insights = getMonthlyInsights()

  return (
    <div className="space-y-6">
      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Poupança</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{insights.savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{insights.transactionCount}</div>
            <p className="text-xs text-muted-foreground">Transações este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {(insights.totalExpenses / new Date().getDate()).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Gastos por dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Suas últimas transações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhuma atividade recente</div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${activity.type === "income" ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${activity.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {activity.type === "income" ? "+" : "-"}R$ {activity.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Mensais
          </CardTitle>
          <CardDescription>Acompanhe seus objetivos de gastos por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {monthlyGoals.map((goal) => {
              const percentage = (goal.current_amount / goal.target_amount) * 100
              const isOverBudget = percentage > 100

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{goal.category}</span>
                      {isOverBudget && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Acima do orçamento
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
                    </div>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{percentage.toFixed(1)}% utilizado</span>
                    <span>
                      {isOverBudget
                        ? `R$ ${(goal.current_amount - goal.target_amount).toFixed(2)} acima`
                        : `R$ ${(goal.target_amount - goal.current_amount).toFixed(2)} restante`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Score de Saúde Financeira
          </CardTitle>
          <CardDescription>Avaliação baseada nos seus hábitos financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {Math.max(0, Math.min(100, 70 + insights.savingsRate)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">de 100 pontos</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Taxa de Poupança</span>
                <Badge variant={insights.savingsRate > 20 ? "default" : "secondary"}>
                  {insights.savingsRate > 20 ? "Boa" : "Pode melhorar"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Controle de Gastos</span>
                <Badge
                  variant={
                    monthlyGoals.filter((g) => g.current_amount <= g.target_amount).length > 1 ? "default" : "secondary"
                  }
                >
                  {monthlyGoals.filter((g) => g.current_amount <= g.target_amount).length > 1 ? "Bom" : "Atenção"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Frequência de Registro</span>
                <Badge variant={insights.transactionCount > 10 ? "default" : "secondary"}>
                  {insights.transactionCount > 10 ? "Ativa" : "Baixa"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
