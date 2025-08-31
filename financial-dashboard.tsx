"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
  MoreHorizontal,
} from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: Date
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: number
  year: number
}

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate?: Date
}

const categories = {
  income: [
    { value: "salary", label: "Salário", icon: DollarSign },
    { value: "freelance", label: "Freelance", icon: Wallet },
    { value: "investment", label: "Investimentos", icon: TrendingUp },
    { value: "other", label: "Outros", icon: MoreHorizontal },
  ],
  expense: [
    { value: "housing", label: "Moradia", icon: Home },
    { value: "transport", label: "Transporte", icon: Car },
    { value: "food", label: "Alimentação", icon: Utensils },
    { value: "shopping", label: "Compras", icon: ShoppingCart },
    { value: "entertainment", label: "Entretenimento", icon: Gamepad2 },
    { value: "health", label: "Saúde", icon: Heart },
    { value: "education", label: "Educação", icon: GraduationCap },
    { value: "travel", label: "Viagem", icon: Plane },
    { value: "bills", label: "Contas", icon: CreditCard },
    { value: "other", label: "Outros", icon: MoreHorizontal },
  ],
}

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem("financial-transactions")
    const savedBudgets = localStorage.getItem("financial-budgets")
    const savedGoals = localStorage.getItem("financial-goals")

    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions)
      setTransactions(parsed.map((t: any) => ({ ...t, date: new Date(t.date) })))
    }

    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }

    if (savedGoals) {
      const parsed = JSON.parse(savedGoals)
      setGoals(
        parsed.map((g: any) => ({
          ...g,
          targetDate: g.targetDate ? new Date(g.targetDate) : undefined,
        })),
      )
    }
  }, [])

  // Cálculos
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const currentBudgets = budgets.filter((b) => b.month === currentMonth && b.year === currentYear)
  const overBudgetCount = currentBudgets.filter((b) => b.spent > b.limit).length

  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount)
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount)

  const getCategoryLabel = (type: "income" | "expense", category: string) => {
    const categoryData = categories[type].find((c) => c.value === category)
    return categoryData?.label || category
  }

  const getCategoryIcon = (type: "income" | "expense", category: string) => {
    const categoryData = categories[type].find((c) => c.value === category)
    return categoryData?.icon || MoreHorizontal
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total de entradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total de saídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className={`h-4 w-4 ${balance >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Diferença total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Poupança</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Do total de receitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {overBudgetCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Você excedeu {overBudgetCount} orçamento{overBudgetCount > 1 ? "s" : ""} este mês!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Orçamentos do Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Orçamentos do Mês
            </CardTitle>
            <CardDescription>Acompanhe seus limites de gastos</CardDescription>
          </CardHeader>
          <CardContent>
            {currentBudgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum orçamento definido</p>
                <p className="text-sm">Defina orçamentos para controlar seus gastos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentBudgets.slice(0, 3).map((budget) => {
                  const percentage = (budget.spent / budget.limit) * 100
                  const isOverBudget = percentage > 100
                  const Icon = getCategoryIcon("expense", budget.category)

                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{getCategoryLabel("expense", budget.category)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isOverBudget ? "destructive" : percentage > 80 ? "secondary" : "default"}>
                            {percentage.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        R$ {budget.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R${" "}
                        {budget.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )
                })}
                {currentBudgets.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{currentBudgets.length - 3} orçamento{currentBudgets.length - 3 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas Financeiras
            </CardTitle>
            <CardDescription>Progresso dos seus objetivos</CardDescription>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta definida</p>
                <p className="text-sm">Crie metas para alcançar seus objetivos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => {
                  const percentage = (goal.currentAmount / goal.targetAmount) * 100
                  const isCompleted = percentage >= 100

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Target className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium">{goal.title}</span>
                        </div>
                        <Badge variant={isCompleted ? "default" : "secondary"}>{percentage.toFixed(0)}%</Badge>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R${" "}
                        {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )
                })}
                {goals.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{goals.length - 3} meta{goals.length - 3 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gastos por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Gastos por Categoria
          </CardTitle>
          <CardDescription>Distribuição das suas despesas</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.filter((t) => t.type === "expense").length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma despesa registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                transactions
                  .filter((t) => t.type === "expense")
                  .reduce(
                    (acc, t) => {
                      acc[t.category] = (acc[t.category] || 0) + t.amount
                      return acc
                    },
                    {} as Record<string, number>,
                  ),
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => {
                  const percentage = (amount / totalExpenses) * 100
                  const Icon = getCategoryIcon("expense", category)
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{getCategoryLabel("expense", category)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{percentage.toFixed(1)}%</span>
                        <span className="text-sm text-muted-foreground w-20 text-right">
                          R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{transactions.length}</p>
            <p className="text-sm text-muted-foreground">Transações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{currentBudgets.length}</p>
            <p className="text-sm text-muted-foreground">Orçamentos Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{activeGoals.length}</p>
            <p className="text-sm text-muted-foreground">Metas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{completedGoals.length}</p>
            <p className="text-sm text-muted-foreground">Metas Concluídas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
