"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Filter,
  Download,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import Header from "@/components/Header"
import { useUser } from "@/lib/contexts/UserContext"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  date: string
  user_id: string
  created_at: string
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: string
  user_id: string
}

interface Goal {
  id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string
  description?: string
  user_id: string
  completed: boolean
}

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Entretenimento",
  "Compras",
  "Serviços",
  "Investimentos",
  "Outros",
]

export default function FinancialDashboard() {
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Estados principais
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  // Estados dos formulários
  const [newTransaction, setNewTransaction] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: categories[0], // Updated default value to be a non-empty string
    date: format(new Date(), "yyyy-MM-dd"),
  })

  const [newBudget, setNewBudget] = useState({
    category: categories[0], // Updated default value to be a non-empty string
    limit: "",
    month: format(new Date(), "yyyy-MM"),
  })

  const [newGoal, setNewGoal] = useState({
    title: "",
    target_amount: "",
    target_date: "",
    description: "",
  })

  // Estados dos filtros
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  })

  // Estados dos diálogos
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Carregar dados
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("date", { ascending: false })

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])

      // Carregar orçamentos
      const { data: budgetsData, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user?.id)
        .eq("month", format(new Date(), "yyyy-MM"))

      if (budgetsError) throw budgetsError
      setBudgets(budgetsData || [])

      // Carregar metas
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("target_date", { ascending: true })

      if (goalsError) throw goalsError
      setGoals(goalsData || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Adicionar transação
  const addTransaction = async () => {
    try {
      if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      const transactionData = {
        type: newTransaction.type,
        amount: Number.parseFloat(newTransaction.amount),
        description: newTransaction.description,
        category: newTransaction.category,
        date: newTransaction.date,
        user_id: user?.id,
      }

      if (editingTransaction) {
        const { error } = await supabase.from("transactions").update(transactionData).eq("id", editingTransaction.id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso",
        })
      } else {
        const { error } = await supabase.from("transactions").insert([transactionData])

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Transação adicionada com sucesso",
        })
      }

      setNewTransaction({
        type: "expense",
        amount: "",
        description: "",
        category: categories[0], // Updated default value to be a non-empty string
        date: format(new Date(), "yyyy-MM-dd"),
      })
      setEditingTransaction(null)
      setShowTransactionDialog(false)
      loadData()
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar transação",
        variant: "destructive",
      })
    }
  }

  // Deletar transação
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Transação removida com sucesso",
      })
      loadData()
    } catch (error) {
      console.error("Erro ao deletar transação:", error)
      toast({
        title: "Erro",
        description: "Erro ao remover transação",
        variant: "destructive",
      })
    }
  }

  // Adicionar orçamento
  const addBudget = async () => {
    try {
      if (!newBudget.category || !newBudget.limit) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("budgets").insert([
        {
          category: newBudget.category,
          limit: Number.parseFloat(newBudget.limit),
          month: newBudget.month,
          user_id: user?.id,
          spent: 0,
        },
      ])

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso",
      })

      setNewBudget({
        category: categories[0], // Updated default value to be a non-empty string
        limit: "",
        month: format(new Date(), "yyyy-MM"),
      })
      setShowBudgetDialog(false)
      loadData()
    } catch (error) {
      console.error("Erro ao criar orçamento:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento",
        variant: "destructive",
      })
    }
  }

  // Adicionar meta
  const addGoal = async () => {
    try {
      if (!newGoal.title || !newGoal.target_amount || !newGoal.target_date) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("goals").insert([
        {
          title: newGoal.title,
          target_amount: Number.parseFloat(newGoal.target_amount),
          target_date: newGoal.target_date,
          description: newGoal.description,
          user_id: user?.id,
          current_amount: 0,
          completed: false,
        },
      ])

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso",
      })

      setNewGoal({
        title: "",
        target_amount: "",
        target_date: "",
        description: "",
      })
      setShowGoalDialog(false)
      loadData()
    } catch (error) {
      console.error("Erro ao criar meta:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar meta",
        variant: "destructive",
      })
    }
  }

  // Calcular estatísticas
  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const currentMonthTransactions = transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd }),
  )

  const totalIncome = currentMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Filtrar transações
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesCategory = !filters.category || transaction.category === filters.category
    const matchesType = !filters.type || transaction.type === filters.type
    const matchesSearch =
      !filters.search ||
      transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(filters.search.toLowerCase())

    let matchesDate = true
    if (filters.dateFrom && filters.dateTo) {
      const transactionDate = parseISO(transaction.date)
      const fromDate = parseISO(filters.dateFrom)
      const toDate = parseISO(filters.dateTo)
      matchesDate = isWithinInterval(transactionDate, { start: fromDate, end: toDate })
    }

    return matchesCategory && matchesType && matchesSearch && matchesDate
  })

  // Exportar CSV
  const exportToCSV = () => {
    const headers = ["Data", "Tipo", "Categoria", "Descrição", "Valor"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          format(parseISO(t.date), "dd/MM/yyyy"),
          t.type === "income" ? "Receita" : "Despesa",
          t.category,
          `"${t.description}"`,
          t.amount.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transacoes_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
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
              <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
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
              <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
              <DollarSign className={`h-4 w-4 ${balance >= 0 ? "text-green-600" : "text-red-600"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{goals.filter((g) => !g.completed).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Aba Transações */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTransaction(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                      <DialogDescription>
                        {editingTransaction ? "Edite os dados da transação" : "Adicione uma nova receita ou despesa"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo</Label>
                          <Select
                            value={newTransaction.type}
                            onValueChange={(value: "income" | "expense") =>
                              setNewTransaction({ ...newTransaction, type: value })
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
                        <div className="space-y-2">
                          <Label htmlFor="amount">Valor</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={newTransaction.amount}
                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          placeholder="Descrição da transação"
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Categoria</Label>
                          <Select
                            value={newTransaction.category}
                            onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
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
                          <Label htmlFor="date">Data</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newTransaction.date}
                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addTransaction}>{editingTransaction ? "Atualizar" : "Adicionar"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>

                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Filtros */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar transações..."
                          className="pl-8"
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => setFilters({ ...filters, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value="income">Receitas</SelectItem>
                          <SelectItem value="expense">Despesas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data Inicial</Label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Final</Label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ category: "", type: "", dateFrom: "", dateTo: "", search: "" })}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Transações */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>{filteredTransactions.length} transação(ões) encontrada(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.category} •{" "}
                              {format(parseISO(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}R${" "}
                            {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setNewTransaction({
                                type: transaction.type,
                                amount: transaction.amount.toString(),
                                description: transaction.description,
                                category: transaction.category,
                                date: transaction.date,
                              })
                              setShowTransactionDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTransaction(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Orçamentos */}
          <TabsContent value="budgets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Orçamentos do Mês</h2>
              <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
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
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget-category">Categoria</Label>
                      <Select
                        value={newBudget.category}
                        onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
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
                        placeholder="0,00"
                        value={newBudget.limit}
                        onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget-month">Mês</Label>
                      <Input
                        id="budget-month"
                        type="month"
                        value={newBudget.month}
                        onChange={(e) => setNewBudget({ ...newBudget, month: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addBudget}>Criar Orçamento</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => {
                const spent = currentMonthTransactions
                  .filter((t) => t.type === "expense" && t.category === budget.category)
                  .reduce((sum, t) => sum + t.amount, 0)

                const percentage = (spent / budget.limit) * 100
                const isOverBudget = spent > budget.limit

                return (
                  <Card key={budget.id} className={isOverBudget ? "border-red-200 bg-red-50" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {budget.category}
                        {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Gasto</span>
                          <span className={isOverBudget ? "text-red-600 font-bold" : ""}>
                            R$ {spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Limite</span>
                          <span>R$ {budget.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={`h-2 ${isOverBudget ? "bg-red-200" : ""}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% usado</span>
                          <span>
                            R$ {(budget.limit - spent).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} restante
                          </span>
                        </div>
                        {isOverBudget && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Orçamento excedido em R${" "}
                              {(spent - budget.limit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {budgets.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum orçamento criado ainda</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Crie orçamentos para controlar seus gastos por categoria
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Aba Metas */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Metas Financeiras</h2>
              <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Meta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Meta</DialogTitle>
                    <DialogDescription>Defina uma meta financeira para alcançar</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-title">Título</Label>
                      <Input
                        id="goal-title"
                        placeholder="Ex: Viagem para Europa"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-amount">Valor da Meta (R$)</Label>
                      <Input
                        id="goal-amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newGoal.target_amount}
                        onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-date">Data Limite</Label>
                      <Input
                        id="goal-date"
                        type="date"
                        value={newGoal.target_date}
                        onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-description">Descrição (opcional)</Label>
                      <Textarea
                        id="goal-description"
                        placeholder="Descreva sua meta..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addGoal}>Criar Meta</Button>
                  </DialogFooter>
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
                  <Card key={goal.id} className={goal.completed ? "border-green-200 bg-green-50" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {goal.title}
                        {goal.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : daysLeft < 0 ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Target className="h-5 w-5 text-blue-600" />
                        )}
                      </CardTitle>
                      {goal.description && <CardDescription>{goal.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>
                              R$ {goal.current_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R${" "}
                              {goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{percentage.toFixed(1)}% concluído</span>
                            <span>
                              R${" "}
                              {(goal.target_amount - goal.current_amount).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              restante
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span>Data limite:</span>
                          <span className={daysLeft < 0 ? "text-red-600" : daysLeft < 30 ? "text-yellow-600" : ""}>
                            {format(parseISO(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
                            {daysLeft >= 0 ? ` (${daysLeft} dias)` : " (vencida)"}
                          </span>
                        </div>

                        {goal.completed && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Meta Concluída!
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {goals.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Nenhuma meta criada ainda</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Crie metas para organizar seus objetivos financeiros
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Aba Relatórios */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold">Relatórios e Análises</h2>

            {/* Resumo por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria (Mês Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryExpenses = currentMonthTransactions
                      .filter((t) => t.type === "expense" && t.category === category)
                      .reduce((sum, t) => sum + t.amount, 0)

                    if (categoryExpenses === 0) return null

                    const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className="font-medium">
                            R$ {categoryExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (
                            {percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}

                  {totalExpenses === 0 && (
                    <p className="text-center text-muted-foreground py-4">Nenhuma despesa registrada neste mês</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {currentMonthTransactions.filter((t) => t.type === "income").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Receitas</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {currentMonthTransactions.filter((t) => t.type === "expense").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Despesas</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{currentMonthTransactions.length}</div>
                    <div className="text-sm text-muted-foreground">Total de Transações</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}
