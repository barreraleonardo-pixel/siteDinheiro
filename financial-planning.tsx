"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CalendarIcon,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
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
import { cn } from "@/lib/utils"

// Tipos
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

// Categorias com ícones
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

export default function FinancialPlanning() {
  // Estados
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Estados dos formulários
  const [transactionForm, setTransactionForm] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    date: new Date(),
  })

  const [budgetForm, setBudgetForm] = useState({
    category: "",
    limit: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  const [goalForm, setGoalForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: undefined as Date | undefined,
  })

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

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("financial-transactions", JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem("financial-budgets", JSON.stringify(budgets))
  }, [budgets])

  useEffect(() => {
    localStorage.setItem("financial-goals", JSON.stringify(goals))
  }, [goals])

  // Cálculos
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Funções de manipulação
  const handleAddTransaction = () => {
    if (!transactionForm.description || !transactionForm.amount || !transactionForm.category) return

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: transactionForm.description,
      amount: Number.parseFloat(transactionForm.amount),
      type: transactionForm.type,
      category: transactionForm.category,
      date: transactionForm.date,
    }

    if (editingTransaction) {
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id ? { ...newTransaction, id: editingTransaction.id } : t,
        ),
      )
      setEditingTransaction(null)
    } else {
      setTransactions([...transactions, newTransaction])
    }

    // Atualizar orçamentos
    if (newTransaction.type === "expense") {
      const budget = budgets.find(
        (b) => b.category === newTransaction.category && b.month === currentMonth && b.year === currentYear,
      )
      if (budget) {
        setBudgets(budgets.map((b) => (b.id === budget.id ? { ...b, spent: b.spent + newTransaction.amount } : b)))
      }
    }

    setTransactionForm({
      description: "",
      amount: "",
      type: "expense",
      category: "",
      date: new Date(),
    })
    setIsTransactionDialogOpen(false)
  }

  const handleAddBudget = () => {
    if (!budgetForm.category || !budgetForm.limit) return

    const existingBudget = budgets.find(
      (b) => b.category === budgetForm.category && b.month === budgetForm.month && b.year === budgetForm.year,
    )

    if (existingBudget && !editingBudget) {
      alert("Já existe um orçamento para esta categoria neste mês")
      return
    }

    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === budgetForm.category &&
          t.date.getMonth() + 1 === budgetForm.month &&
          t.date.getFullYear() === budgetForm.year,
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const newBudget: Budget = {
      id: editingBudget?.id || Date.now().toString(),
      category: budgetForm.category,
      limit: Number.parseFloat(budgetForm.limit),
      spent,
      month: budgetForm.month,
      year: budgetForm.year,
    }

    if (editingBudget) {
      setBudgets(budgets.map((b) => (b.id === editingBudget.id ? newBudget : b)))
      setEditingBudget(null)
    } else {
      setBudgets([...budgets, newBudget])
    }

    setBudgetForm({
      category: "",
      limit: "",
      month: currentMonth,
      year: currentYear,
    })
    setIsBudgetDialogOpen(false)
  }

  const handleAddGoal = () => {
    if (!goalForm.title || !goalForm.targetAmount) return

    const newGoal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: goalForm.title,
      targetAmount: Number.parseFloat(goalForm.targetAmount),
      currentAmount: Number.parseFloat(goalForm.currentAmount) || 0,
      targetDate: goalForm.targetDate,
    }

    if (editingGoal) {
      setGoals(goals.map((g) => (g.id === editingGoal.id ? newGoal : g)))
      setEditingGoal(null)
    } else {
      setGoals([...goals, newGoal])
    }

    setGoalForm({
      title: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: undefined,
    })
    setIsGoalDialogOpen(false)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionForm({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    })
    setIsTransactionDialogOpen(true)
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setBudgetForm({
      category: budget.category,
      limit: budget.limit.toString(),
      month: budget.month,
      year: budget.year,
    })
    setIsBudgetDialogOpen(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setGoalForm({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
    })
    setIsGoalDialogOpen(true)
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id))
  }

  const getCategoryIcon = (type: "income" | "expense", category: string) => {
    const categoryData = categories[type].find((c) => c.value === category)
    return categoryData?.icon || MoreHorizontal
  }

  const getCategoryLabel = (type: "income" | "expense", category: string) => {
    const categoryData = categories[type].find((c) => c.value === category)
    return categoryData?.label || category
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Planejamento Financeiro</h1>
          <p className="text-muted-foreground">Gerencie suas finanças pessoais de forma inteligente</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Editar" : "Nova"} Transação</DialogTitle>
                <DialogDescription>
                  {editingTransaction ? "Edite os dados da" : "Adicione uma nova"} transação financeira
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder="Ex: Compra no supermercado"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={transactionForm.type}
                    onValueChange={(value: "income" | "expense") =>
                      setTransactionForm({ ...transactionForm, type: value, category: "" })
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
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={transactionForm.category}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[transactionForm.type].map((category) => {
                        const Icon = category.icon
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(transactionForm.date, "PPP", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={transactionForm.date}
                        onSelect={(date) => date && setTransactionForm({ ...transactionForm, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleAddTransaction} className="w-full">
                  {editingTransaction ? "Salvar Alterações" : "Adicionar Transação"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
            <DollarSign className={`h-4 w-4 ${balance >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Transações */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Histórico das suas movimentações financeiras</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma transação encontrada</p>
                  <p className="text-sm">Adicione sua primeira transação para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((transaction) => {
                      const Icon = getCategoryIcon(transaction.type, transaction.category)
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              <Icon
                                className={`h-4 w-4 ${
                                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {getCategoryLabel(transaction.type, transaction.category)} •{" "}
                                {format(transaction.date, "dd/MM/yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                transaction.type === "income" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}R${" "}
                              {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orçamentos */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Orçamentos do Mês</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(currentYear, currentMonth - 1), "MMMM yyyy", { locale: ptBR })}
              </p>
            </div>
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Orçamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBudget ? "Editar" : "Novo"} Orçamento</DialogTitle>
                  <DialogDescription>
                    {editingBudget ? "Edite o" : "Defina um"} limite de gastos para uma categoria
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget-category">Categoria</Label>
                    <Select
                      value={budgetForm.category}
                      onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.expense.map((category) => {
                          const Icon = category.icon
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget-limit">Limite</Label>
                    <Input
                      id="budget-limit"
                      type="number"
                      step="0.01"
                      value={budgetForm.limit}
                      onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget-month">Mês</Label>
                      <Select
                        value={budgetForm.month.toString()}
                        onValueChange={(value) => setBudgetForm({ ...budgetForm, month: Number.parseInt(value) })}
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
                    <div>
                      <Label htmlFor="budget-year">Ano</Label>
                      <Select
                        value={budgetForm.year.toString()}
                        onValueChange={(value) => setBudgetForm({ ...budgetForm, year: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddBudget} className="w-full">
                    {editingBudget ? "Salvar Alterações" : "Criar Orçamento"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {budgets
              .filter((budget) => budget.month === currentMonth && budget.year === currentYear)
              .map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100
                const isOverBudget = percentage > 100
                const Icon = getCategoryIcon("expense", budget.category)

                return (
                  <Card key={budget.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{getCategoryLabel("expense", budget.category)}</h4>
                            <p className="text-sm text-muted-foreground">
                              R$ {budget.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R${" "}
                              {budget.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          <Badge variant={isOverBudget ? "destructive" : percentage > 80 ? "secondary" : "default"}>
                            {percentage.toFixed(0)}%
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleEditBudget(budget)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBudget(budget.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`}
                      />
                      {isOverBudget && (
                        <Alert className="mt-4 border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            Orçamento excedido em R${" "}
                            {(budget.spent - budget.limit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

            {budgets.filter((budget) => budget.month === currentMonth && budget.year === currentYear).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Nenhum orçamento definido para este mês</p>
                  <p className="text-sm text-muted-foreground">Crie orçamentos para controlar seus gastos</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Metas */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Metas Financeiras</h3>
              <p className="text-sm text-muted-foreground">Acompanhe o progresso dos seus objetivos</p>
            </div>
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGoal ? "Editar" : "Nova"} Meta</DialogTitle>
                  <DialogDescription>{editingGoal ? "Edite sua" : "Defina uma nova"} meta financeira</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-title">Título</Label>
                    <Input
                      id="goal-title"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      placeholder="Ex: Viagem para Europa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-target">Valor da Meta</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      step="0.01"
                      value={goalForm.targetAmount}
                      onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-current">Valor Atual</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      step="0.01"
                      value={goalForm.currentAmount}
                      onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Data Limite (Opcional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {goalForm.targetDate
                            ? format(goalForm.targetDate, "PPP", { locale: ptBR })
                            : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={goalForm.targetDate}
                          onSelect={(date) => setGoalForm({ ...goalForm, targetDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button onClick={handleAddGoal} className="w-full">
                    {editingGoal ? "Salvar Alterações" : "Criar Meta"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {goals.map((goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100
              const isCompleted = percentage >= 100

              return (
                <Card key={goal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isCompleted ? "bg-green-100" : "bg-blue-100"}`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Target className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R${" "}
                            {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            {goal.targetDate && <span> • {format(goal.targetDate, "dd/MM/yyyy")}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? "default" : "secondary"}>{percentage.toFixed(0)}%</Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleEditGoal(goal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    {isCompleted && (
                      <Alert className="mt-4 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">Parabéns! Você atingiu sua meta!</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {goals.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Nenhuma meta definida</p>
                  <p className="text-sm text-muted-foreground">Crie metas para alcançar seus objetivos financeiros</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6">
            {/* Resumo Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa de Poupança</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Transações</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Metas Ativas</p>
                    <p className="text-2xl font-bold">{goals.filter((g) => g.currentAmount < g.targetAmount).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gastos por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Gastos por Categoria
                </CardTitle>
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
                      .map(([category, amount]) => {
                        const percentage = (amount / totalExpenses) * 100
                        const Icon = getCategoryIcon("expense", category)
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4" />
                              <span>{getCategoryLabel("expense", category)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                              </div>
                              <span className="text-sm font-medium w-16 text-right">{percentage.toFixed(1)}%</span>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
