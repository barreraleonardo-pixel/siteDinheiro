"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, CalendarIcon, Download, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  date: string
  recurring: boolean
  user_id?: string
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  period: "monthly" | "weekly"
  user_id?: string
}

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  description: string
  user_id?: string
}

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Entretenimento",
  "Compras",
  "Investimentos",
  "Outros",
]

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()
  const supabase = createClient()

  // Estados para formulários
  const [newTransaction, setNewTransaction] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date(),
    recurring: false,
  })

  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: "",
    period: "monthly" as "monthly" | "weekly",
  })

  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    target_date: new Date(),
    description: "",
  })

  // Dados demo para quando não há Supabase
  const demoData = {
    transactions: [
      {
        id: "1",
        type: "income" as const,
        amount: 5000,
        description: "Salário",
        category: "Outros",
        date: "2024-01-01",
        recurring: true,
      },
      {
        id: "2",
        type: "expense" as const,
        amount: 1200,
        description: "Aluguel",
        category: "Moradia",
        date: "2024-01-01",
        recurring: true,
      },
      {
        id: "3",
        type: "expense" as const,
        amount: 300,
        description: "Supermercado",
        category: "Alimentação",
        date: "2024-01-02",
        recurring: false,
      },
    ],
    budgets: [
      {
        id: "1",
        category: "Alimentação",
        limit: 800,
        spent: 300,
        period: "monthly" as const,
      },
      {
        id: "2",
        category: "Transporte",
        limit: 400,
        spent: 150,
        period: "monthly" as const,
      },
    ],
    goals: [
      {
        id: "1",
        name: "Reserva de Emergência",
        target_amount: 10000,
        current_amount: 3500,
        target_date: "2024-12-31",
        description: "Reserva para emergências",
      },
      {
        id: "2",
        name: "Viagem",
        target_amount: 5000,
        current_amount: 1200,
        target_date: "2024-07-01",
        description: "Viagem de férias",
      },
    ],
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    if (supabase) {
      try {
        // Carregar dados do Supabase
        const [transactionsRes, budgetsRes, goalsRes] = await Promise.all([
          supabase.from("transactions").select("*").order("date", { ascending: false }),
          supabase.from("budgets").select("*"),
          supabase.from("goals").select("*"),
        ])

        if (transactionsRes.data) setTransactions(transactionsRes.data)
        if (budgetsRes.data) setBudgets(budgetsRes.data)
        if (goalsRes.data) setGoals(goalsRes.data)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        // Usar dados demo em caso de erro
        setTransactions(demoData.transactions)
        setBudgets(demoData.budgets)
        setGoals(demoData.goals)
      }
    } else {
      // Usar dados demo quando não há Supabase
      setTransactions(demoData.transactions)
      setBudgets(demoData.budgets)
      setGoals(demoData.goals)
    }

    setLoading(false)
  }

  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      amount: Number.parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      date: format(newTransaction.date, "yyyy-MM-dd"),
      recurring: newTransaction.recurring,
    }

    if (supabase) {
      try {
        const { error } = await supabase.from("transactions").insert([transaction])
        if (error) throw error
      } catch (error) {
        console.error("Erro ao salvar transação:", error)
      }
    }

    setTransactions((prev) => [transaction, ...prev])
    setNewTransaction({
      type: "expense",
      amount: "",
      description: "",
      category: "",
      date: new Date(),
      recurring: false,
    })

    toast({
      title: "Sucesso",
      description: "Transação adicionada com sucesso!",
    })
  }

  const addBudget = async () => {
    if (!newBudget.category || !newBudget.limit) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      limit: Number.parseFloat(newBudget.limit),
      spent: 0,
      period: newBudget.period,
    }

    if (supabase) {
      try {
        const { error } = await supabase.from("budgets").insert([budget])
        if (error) throw error
      } catch (error) {
        console.error("Erro ao salvar orçamento:", error)
      }
    }

    setBudgets((prev) => [...prev, budget])
    setNewBudget({
      category: "",
      limit: "",
      period: "monthly",
    })

    toast({
      title: "Sucesso",
      description: "Orçamento criado com sucesso!",
    })
  }

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      target_amount: Number.parseFloat(newGoal.target_amount),
      current_amount: 0,
      target_date: format(newGoal.target_date, "yyyy-MM-dd"),
      description: newGoal.description,
    }

    if (supabase) {
      try {
        const { error } = await supabase.from("goals").insert([goal])
        if (error) throw error
      } catch (error) {
        console.error("Erro ao salvar meta:", error)
      }
    }

    setGoals((prev) => [...prev, goal])
    setNewGoal({
      name: "",
      target_amount: "",
      target_date: new Date(),
      description: "",
    })

    toast({
      title: "Sucesso",
      description: "Meta criada com sucesso!",
    })
  }

  // Cálculos
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false
    if (selectedCategory !== "all" && t.category !== selectedCategory) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!supabase && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sistema em modo demo. Configure o Supabase para persistir dados.{" "}
            <a href="/setup" className="underline">
              Ver instruções
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Aba Transações */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <DialogTitle>Nova Transação</DialogTitle>
                  <DialogDescription>Adicione uma nova receita ou despesa</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newTransaction.type === "income"}
                        onCheckedChange={(checked) =>
                          setNewTransaction((prev) => ({
                            ...prev,
                            type: checked ? "income" : "expense",
                          }))
                        }
                      />
                      <Label>{newTransaction.type === "income" ? "Receita" : "Despesa"}</Label>
                    </div>
                  </div>

                  <div>
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

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da transação"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newTransaction.recurring}
                      onCheckedChange={(checked) => setNewTransaction((prev) => ({ ...prev, recurring: checked }))}
                    />
                    <Label>Transação recorrente</Label>
                  </div>

                  <Button onClick={addTransaction} className="w-full">
                    Adicionar Transação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma transação encontrada</p>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.category} • {format(new Date(transaction.date), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}R${" "}
                          {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        {transaction.recurring && <Badge variant="secondary">Recorrente</Badge>}
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Orçamentos</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Orçamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Orçamento</DialogTitle>
                  <DialogDescription>Defina um limite de gastos para uma categoria</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget-category">Categoria</Label>
                    <Select
                      value={newBudget.category}
                      onValueChange={(value) => setNewBudget((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget-limit">Limite</Label>
                    <Input
                      id="budget-limit"
                      type="number"
                      step="0.01"
                      value={newBudget.limit}
                      onChange={(e) => setNewBudget((prev) => ({ ...prev, limit: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget-period">Período</Label>
                    <Select
                      value={newBudget.period}
                      onValueChange={(value: any) => setNewBudget((prev) => ({ ...prev, period: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={addBudget} className="w-full">
                    Criar Orçamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100
              const isOverBudget = percentage > 100

              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                        {budget.period === "monthly" ? "Mensal" : "Semanal"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gasto</span>
                        <span>R$ {budget.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Limite</span>
                        <span>R$ {budget.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className={isOverBudget ? "bg-red-100" : ""} />
                      <div className="text-center text-sm text-gray-500">{percentage.toFixed(1)}% utilizado</div>
                    </div>

                    {isOverBudget && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Orçamento excedido em R${" "}
                          {(budget.spent - budget.limit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {budgets.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhum orçamento criado ainda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Metas */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Metas Financeiras</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Meta</DialogTitle>
                  <DialogDescription>Defina um objetivo financeiro</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-name">Nome da Meta</Label>
                    <Input
                      id="goal-name"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Reserva de emergência"
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal-amount">Valor Alvo</Label>
                    <Input
                      id="goal-amount"
                      type="number"
                      step="0.01"
                      value={newGoal.target_amount}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, target_amount: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label>Data Alvo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
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

                  <div>
                    <Label htmlFor="goal-description">Descrição</Label>
                    <Textarea
                      id="goal-description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva sua meta..."
                    />
                  </div>

                  <Button onClick={addGoal} className="w-full">
                    Criar Meta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const percentage = (goal.current_amount / goal.target_amount) * 100
              const daysLeft = Math.ceil(
                (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>R$ {goal.current_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Meta</span>
                        <span>R$ {goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} />
                      <div className="text-center text-sm text-gray-500">{percentage.toFixed(1)}% concluído</div>
                    </div>

                    <div className="text-sm text-gray-500 text-center">
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : "Meta vencida"}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {goals.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhuma meta criada ainda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Relatórios */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Relatórios</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryExpenses = transactions
                      .filter((t) => t.type === "expense" && t.category === category)
                      .reduce((sum, t) => sum + t.amount, 0)

                    const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0

                    if (categoryExpenses === 0) return null

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>R$ {categoryExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <Progress value={percentage} />
                        <div className="text-xs text-gray-500 text-right">{percentage.toFixed(1)}%</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Receitas:</span>
                    <span className="font-bold text-green-600">
                      R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Despesas:</span>
                    <span className="font-bold text-red-600">
                      R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Saldo Final:</span>
                    <span className={`font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Poupança:</span>
                    <span className="font-bold">
                      {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                    </span>
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
