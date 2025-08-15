"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/contexts/UserContext"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity, TrendingUp, Target, Calendar, DollarSign, PieChart, BarChart3, Download } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface ActivityLog {
  id: string
  action: string
  description: string
  timestamp: string
  user_id: string
}

interface Goal {
  id: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string
  category: string
  status: "active" | "completed" | "overdue"
}

export default function InteracoesPanel() {
  const { user } = useUser()
  const supabase = createClient()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("activity")

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      // Load transactions for analytics
      const { data: transactionData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50)

      setTransactions(transactionData || [])

      // Simulate activity logs (in a real app, these would come from a logs table)
      const mockActivityLogs: ActivityLog[] = [
        {
          id: "1",
          action: "transaction_created",
          description: "Nova transação adicionada: Compra no supermercado",
          timestamp: new Date().toISOString(),
          user_id: user?.id || "",
        },
        {
          id: "2",
          action: "export_csv",
          description: "Dados exportados para CSV",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user_id: user?.id || "",
        },
        {
          id: "3",
          action: "profile_updated",
          description: "Perfil atualizado",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user_id: user?.id || "",
        },
      ]
      setActivityLogs(mockActivityLogs)

      // Simulate goals (in a real app, these would come from a goals table)
      const mockGoals: Goal[] = [
        {
          id: "1",
          title: "Reserva de Emergência",
          target_amount: 10000,
          current_amount: 6500,
          deadline: "2024-12-31",
          category: "Poupança",
          status: "active",
        },
        {
          id: "2",
          title: "Viagem de Férias",
          target_amount: 5000,
          current_amount: 2800,
          deadline: "2024-06-30",
          category: "Lazer",
          status: "active",
        },
      ]
      setGoals(mockGoals)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "transaction_created":
        return <DollarSign className="h-4 w-4" />
      case "export_csv":
        return <Download className="h-4 w-4" />
      case "profile_updated":
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case "transaction_created":
        return "text-green-600"
      case "export_csv":
        return "text-blue-600"
      case "profile_updated":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Painel de Interações</h2>
        <p className="text-gray-600">Acompanhe atividades, metas e análises</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Atividades</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>Histórico das suas últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhuma atividade registrada</div>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`mt-1 ${getActivityColor(log.action)}`}>{getActivityIcon(log.action)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.description}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Suas Metas Financeiras</h3>
              <p className="text-sm text-gray-600">Acompanhe o progresso das suas metas</p>
            </div>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100
              const isOverdue = new Date(goal.deadline) < new Date() && goal.status !== "completed"

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription>{goal.category}</CardDescription>
                      </div>
                      <Badge
                        variant={isOverdue ? "destructive" : goal.status === "completed" ? "default" : "secondary"}
                      >
                        {isOverdue ? "Atrasada" : goal.status === "completed" ? "Concluída" : "Ativa"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>R$ {goal.current_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        <span>R$ {goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        Prazo: {format(new Date(goal.deadline), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Tendência Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+12.5%</div>
                <p className="text-xs text-gray-500">Comparado ao mês anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart className="h-4 w-4" />
                  Categoria Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">Alimentação</div>
                <p className="text-xs text-gray-500">35% dos gastos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Média Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">R$ 85,50</div>
                <p className="text-xs text-gray-500">Gastos por dia</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Insights Financeiros</CardTitle>
              <CardDescription>Análises baseadas no seu comportamento financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900">💡 Dica de Economia</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Você gastou 15% a mais com alimentação este mês. Considere planejar suas refeições para economizar.
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900">✅ Parabéns!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Você conseguiu economizar R$ 200 em transporte este mês comparado ao anterior.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900">⚠️ Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Seus gastos com lazer aumentaram 25%. Verifique se está dentro do seu orçamento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>Gere relatórios detalhados das suas finanças</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Relatório Mensal</h4>
                  <p className="text-sm text-gray-600 mb-3">Resumo completo das transações do mês atual</p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Análise por Categoria</h4>
                  <p className="text-sm text-gray-600 mb-3">Detalhamento dos gastos por categoria</p>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Excel
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Fluxo de Caixa</h4>
                  <p className="text-sm text-gray-600 mb-3">Análise de entradas e saídas por período</p>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Comparativo Anual</h4>
                  <p className="text-sm text-gray-600 mb-3">Comparação mês a mês do ano atual</p>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
