"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Plus, TrendingUp, TrendingDown, Target, DollarSign, PieChart, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
  user_id: string
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: number
  year: number
  user_id: string
}

interface Goal {
  id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string
  user_id: string
}

interface FinancialData {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
}

interface FinancialDashboardProps {
  initialData?: FinancialData
  isDemo?: boolean
}

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Entretenimento",
  "Roupas",
  "Utilidades",
  "Trabalho",
  "Outros",
]

export default function FinancialDashboard({ initialData, isDemo = false }: FinancialDashboardProps) {
  const [data, setData] = useState<FinancialData>(initialData || { transactions: [], budgets: [], goals: [] })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Estados para formulários
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    date: new Date(),
  })

  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  const [newGoal, setNewGoal] = useState({
    title: "",
    target_amount: "",
    current_amount: "",
    target_date: new Date(),
  })

  // Carregar dados do Supabase (se não estiver em modo demo)
  useEffect(() => {
    if (!isDemo && supabase) {
      loadData()
    }
  }, [isDemo, supabase])

  const loadData = async () => {
    if (!supabase) return

    setLoading(true)
    try {
      const [transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        supabase.from("transactions").select("*").order("date", { ascending: false }),
        supabase.from("budgets").select("*"),
        supabase.from("goals").select("*"),
      ])

      setData({
        transactions: transactionsRes.data || [],
        budgets: budgetsRes.data || [],
        goals: goalsRes.data || [],
      })
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar transação
  const addTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) return

    const transaction: Omit<Transaction, "id" | "user_id"> = {
      description: newTransaction.description,
      amount:
        newTransaction.type === "expense"
          ? -Math.abs(Number(newTransaction.amount))
          : Math.abs(Number(newTransaction.amount)),
      type: newTransaction.type,
      category: newTransaction.category,
      date: format(newTransaction.date, "yyyy-MM-dd"),
    }

    if (isDemo || !supabase) {
      // Modo demo - adicionar localmente
      const newTx: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        user_id: "demo",
      }
      setData((prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }))
    } else {
      // Modo Supabase
      try {
        const { data: insertedData, error } = await supabase.from("transactions").insert([transaction]).select()

        if (error) throw error

        if (insertedData) {
          setData((prev) => ({
            ...prev,
            transactions: [...insertedData, ...prev.transactions],
          }))
        }
      } catch (error) {
        console.error("Erro ao adicionar transação:", error)
      }
    }

    // Resetar formulário
    setNewTransaction({
      description: "",
      amount: "",
      type: "expense",
      category: "",
      date: new Date(),
    })
  }

  // Adicionar orçamento
  const addBudget = async () => {
    if (!newBudget.category || !newBudget.limit) return

    const budget: Omit<Budget, "id" | "user_id" | "spent"> = {
      category: newBudget.category,
      limit: Number(newBudget.limit),
      month: newBudget.month,
      year: newBudget.year,
    }

    if (isDemo || !supabase) {
      // Modo demo
      const spent = data.transactions
        .filter((t) => t.type === "expense" && t.category === budget.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const newBudgetItem: Budget = {
        ...budget,
        id: Date.now().toString(),
        user_id: "demo",
        spent,
      }
      setData((prev) => ({
        ...prev,
        budgets: [
          ...prev.budgets.filter(
            (b) => !(b.category === budget.category && b.month === budget.month && b.year === budget.year),
          ),
          newBudgetItem,
        ],
      }))
    } else {
      // Modo Supabase
      try {
        const { data: insertedData, error } = await supabase.from("budgets").upsert([budget]).select()

        if (error) throw error

        if (insertedData) {
          loadData() // Recarregar para calcular gastos
        }
      } catch (error) {
        console.error("Erro ao adicionar orçamento:", error)
      }
    }

    // Resetar formulário
    setNewBudget({
      category: "",
      limit: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    })
  }

  // Adicionar meta
  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount) return

    const goal: Omit<Goal, "id" | "user_id"> = {
      title: newGoal.title,
      target_amount: Number(newGoal.target_amount),
      current_amount: Number(newGoal.current_amount) || 0,
      target_date: format(newGoal.target_date, "yyyy-MM-dd"),
    }

    if (isDemo || !supabase) {
      // Modo demo
      const newGoalItem: Goal = {
        ...goal,
        id: Date.now().toString(),
        user_id: "demo",
      }
      setData((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoalItem],
      }))
    } else {
      // Modo Supabase
      try {
        const { data: insertedData, error } = await supabase.from("goals").insert([goal]).select()

        if (error) throw error

        if (insertedData) {
          setData((prev) => ({
            ...prev,
            goals: [...prev.goals, ...insertedData],
          }))
        }
      } catch (error) {
        console.error("Erro ao adicionar meta:", error)
      }
    }

    // Resetar formulário
    setNewGoal({
      title: "",
      target_amount: "",
      current_amount: "",
      target_date: new Date(),
    })
  }

  // Calcular estatísticas
  const totalIncome = data.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(
    data.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
  )
  const balance = totalIncome - totalExpenses

  // Calcular gastos por categoria para orçamentos
  const expensesByCategory = data.transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      },
      {} as Record<string, number>,
    )

  // Atualizar orçamentos com gastos calculados
  const budgetsWithSpent = data.budgets.map((budget) => ({
    ...budget,
    spent: expensesByCategory[budget.category] || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Aba Transações */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transações</CardTitle>
                  <CardDescription>Gerencie suas receitas e despesas</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Transação</DialogTitle>
                      <DialogDescription>Registre uma nova receita ou despesa</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Ex: Salário, Supermercado..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Valor</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={newTransaction.amount}
                            onChange={(e) => setNewTransaction((prev) => ({ ...prev, amount: e.target.value }))}
                            placeholder="0,00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo</Label>
                          <Select
                            value={newTransaction.type}
                            onValueChange={(value: "income" | "expense") =>
                              setNewTransaction((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={newTransaction.category}
                          onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(newTransaction.date, "PPP", { locale: ptBR })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newTransaction.date}
                              onSelect={(date) => date && setNewTransaction((prev) => ({ ...prev, date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <Button onClick={addTransaction} className="w-full">
                        Adicionar Transação
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma transação encontrada. Adicione sua primeira transação!
                  </p>
                ) : (
                  data.transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.category} • {format(new Date(transaction.date), "dd/MM/yyyy")}
                        </div>
                      </div>
                      <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : ""}R${" "}
                        {Math.abs(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Orçamentos */}
        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Orçamentos</CardTitle>
                  <CardDescription>Controle seus gastos por categoria</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Orçamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Orçamento</DialogTitle>
                      <DialogDescription>Defina um limite de gastos para uma categoria</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget-category">Categoria</Label>
                        <Select
                          value={newBudget.category}
                          onValueChange={(value) => setNewBudget((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget-limit">Limite (R$)</Label>
                        <Input
                          id="budget-limit"
                          type="number"
                          step="0.01"
                          value={newBudget.limit}
                          onChange={(e) => setNewBudget((prev) => ({ ...prev, limit: e.target.value }))}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="budget-month">Mês</Label>
                          <Select
                            value={newBudget.month.toString()}
                            onValueChange={(value) =>
                              setNewBudget((prev) => ({ ...prev, month: Number.parseInt(value) }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {format(new Date(2024, i), "MMMM", { locale: ptBR })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="budget-year">Ano</Label>
                          <Select
                            value={newBudget.year.toString()}
                            onValueChange={(value) =>
                              setNewBudget((prev) => ({ ...prev, year: Number.parseInt(value) }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button onClick={addBudget} className="w-full">
                        Criar Orçamento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetsWithSpent.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum orçamento criado. Crie seu primeiro orçamento!
                  </p>
                ) : (
                  budgetsWithSpent.map((budget) => {
                    const percentage = (budget.spent / budget.limit) * 100
                    const isOverBudget = percentage > 100

                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{budget.category}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(budget.year, budget.month - 1), "MMMM yyyy", { locale: ptBR })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
                              R$ {budget.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R${" "}
                              {budget.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                            <Badge variant={isOverBudget ? "destructive" : percentage > 80 ? "secondary" : "default"}>
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`}
                        />
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Metas */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Metas Financeiras</CardTitle>
                  <CardDescription>Acompanhe seus objetivos financeiros</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Meta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Meta</DialogTitle>
                      <DialogDescription>Defina um objetivo financeiro para alcançar</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal-title">Título da Meta</Label>
                        <Input
                          id="goal-title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Reserva de emergência, Viagem..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="goal-target">Valor Alvo (R$)</Label>
                          <Input
                            id="goal-target"
                            type="number"
                            step="0.01"
                            value={newGoal.target_amount}
                            onChange={(e) => setNewGoal((prev) => ({ ...prev, target_amount: e.target.value }))}
                            placeholder="0,00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="goal-current">Valor Atual (R$)</Label>
                          <Input
                            id="goal-current"
                            type="number"
                            step="0.01"
                            value={newGoal.current_amount}
                            onChange={(e) => setNewGoal((prev) => ({ ...prev, current_amount: e.target.value }))}
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Data Alvo</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(newGoal.target_date, "PPP", { locale: ptBR })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newGoal.target_date}
                              onSelect={(date) => date && setNewGoal((prev) => ({ ...prev, target_date: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <Button onClick={addGoal} className="w-full">
                        Criar Meta
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {data.goals.length === 0 ? (
                  <div className="col-span-2">
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma meta criada. Defina seus objetivos financeiros!
                    </p>
                  </div>
                ) : (
                  data.goals.map((goal) => {
                    const percentage = (goal.current_amount / goal.target_amount) * 100
                    const isCompleted = percentage >= 100

                    return (
                      <Card key={goal.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <Target className={`h-5 w-5 ${isCompleted ? "text-green-600" : "text-blue-600"}`} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span className="font-medium">{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={Math.min(percentage, 100)} className="h-2" />
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Atual:</span>
                              <span className="font-medium">
                                R$ {goal.current_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Meta:</span>
                              <span className="font-medium">
                                R$ {goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Data alvo:</span>
                              <span className="font-medium">{format(new Date(goal.target_date), "dd/MM/yyyy")}</span>
                            </div>
                          </div>

                          {isCompleted && (
                            <Badge className="w-full justify-center bg-green-100 text-green-800">
                              Meta Alcançada! 🎉
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Relatórios */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Gastos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(expensesByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => {
                      const percentage = (amount / totalExpenses) * 100
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-medium">
                              R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({percentage.toFixed(1)}
                              %)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  {Object.keys(expensesByCategory).length === 0 && (
                    <p className="text-center text-gray-500 py-4">Nenhuma despesa registrada ainda.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumo Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">
                        {data.transactions.filter((t) => t.type === "income").length}
                      </div>
                      <div className="text-sm text-gray-600">Receitas</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-red-600">
                        {data.transactions.filter((t) => t.type === "expense").length}
                      </div>
                      <div className="text-sm text-gray-600">Despesas</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Poupança</span>
                      <span className="font-medium">
                        {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100) : 0}
                      className="h-2"
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600 mb-2">Categoria com maior gasto:</div>
                    {Object.keys(expensesByCategory).length > 0 ? (
                      <div className="font-medium">
                        {Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
                      </div>
                    ) : (
                      <div className="text-gray-500">Nenhuma despesa registrada</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
