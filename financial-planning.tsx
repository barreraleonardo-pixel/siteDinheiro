'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Target, CalendarIcon, Edit, Trash2, AlertTriangle, CheckCircle, BarChart3, PieChart, Filter, Download, Upload, Settings, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// Tipos
interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: Date
  recurring?: boolean
  tags?: string[]
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  period: 'monthly' | 'weekly' | 'yearly'
  alertThreshold: number
}

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  category: string
  description?: string
  priority: 'low' | 'medium' | 'high'
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

// Categorias padrão
const defaultCategories: Category[] = [
  { id: '1', name: 'Salário', type: 'income', color: '#10B981', icon: '💰' },
  { id: '2', name: 'Freelance', type: 'income', color: '#059669', icon: '💼' },
  { id: '3', name: 'Investimentos', type: 'income', color: '#047857', icon: '📈' },
  { id: '4', name: 'Alimentação', type: 'expense', color: '#EF4444', icon: '🍽️' },
  { id: '5', name: 'Transporte', type: 'expense', color: '#F97316', icon: '🚗' },
  { id: '6', name: 'Moradia', type: 'expense', color: '#DC2626', icon: '🏠' },
  { id: '7', name: 'Saúde', type: 'expense', color: '#7C3AED', icon: '🏥' },
  { id: '8', name: 'Educação', type: 'expense', color: '#2563EB', icon: '📚' },
  { id: '9', name: 'Lazer', type: 'expense', color: '#DB2777', icon: '🎮' },
  { id: '10', name: 'Outros', type: 'expense', color: '#6B7280', icon: '📦' }
]

export default function FinancialPlanning() {
  // Estados principais
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  
  // Estados de formulários
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date()
  })
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    period: 'monthly',
    alertThreshold: 80
  })
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    priority: 'medium',
    deadline: new Date()
  })
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('month')
  const [showBalance, setShowBalance] = useState(true)
  
  const { toast } = useToast()

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financial-transactions')
    const savedBudgets = localStorage.getItem('financial-budgets')
    const savedGoals = localStorage.getItem('financial-goals')
    const savedCategories = localStorage.getItem('financial-categories')

    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions)
      setTransactions(parsed.map((t: any) => ({ ...t, date: new Date(t.date) })))
    }
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets))
    if (savedGoals) {
      const parsed = JSON.parse(savedGoals)
      setGoals(parsed.map((g: any) => ({ ...g, deadline: new Date(g.deadline) })))
    }
    if (savedCategories) setCategories(JSON.parse(savedCategories))
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('financial-transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('financial-budgets', JSON.stringify(budgets))
  }, [budgets])

  useEffect(() => {
    localStorage.setItem('financial-goals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem('financial-categories', JSON.stringify(categories))
  }, [categories])

  // Funções de cálculo
  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getBalance = () => getTotalIncome() - getTotalExpenses()

  const getCategorySpending = (category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Funções CRUD
  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type as 'income' | 'expense',
      amount: newTransaction.amount,
      category: newTransaction.category,
      description: newTransaction.description,
      date: newTransaction.date || new Date(),
      recurring: newTransaction.recurring || false,
      tags: newTransaction.tags || []
    }

    setTransactions([...transactions, transaction])
    setNewTransaction({ type: 'expense', date: new Date() })
    setShowTransactionDialog(false)
    
    toast({
      title: "Sucesso",
      description: "Transação adicionada com sucesso!"
    })
  }

  const addBudget = () => {
    if (!newBudget.category || !newBudget.limit) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      limit: newBudget.limit,
      spent: getCategorySpending(newBudget.category),
      period: newBudget.period as 'monthly' | 'weekly' | 'yearly',
      alertThreshold: newBudget.alertThreshold || 80
    }

    setBudgets([...budgets, budget])
    setNewBudget({ period: 'monthly', alertThreshold: 80 })
    setShowBudgetDialog(false)
    
    toast({
      title: "Sucesso",
      description: "Orçamento criado com sucesso!"
    })
  }

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount || 0,
      deadline: newGoal.deadline,
      category: newGoal.category || 'Geral',
      description: newGoal.description,
      priority: newGoal.priority as 'low' | 'medium' | 'high'
    }

    setGoals([...goals, goal])
    setNewGoal({ priority: 'medium', deadline: new Date() })
    setShowGoalDialog(false)
    
    toast({
      title: "Sucesso",
      description: "Meta criada com sucesso!"
    })
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id))
    toast({
      title: "Sucesso",
      description: "Transação removida com sucesso!"
    })
  }

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id))
    toast({
      title: "Sucesso",
      description: "Orçamento removido com sucesso!"
    })
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id))
    toast({
      title: "Sucesso",
      description: "Meta removida com sucesso!"
    })
  }

  // Componente de estatísticas
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {showBalance ? `R$ ${getTotalIncome().toFixed(2)}` : '••••••'}
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
            {showBalance ? `R$ ${getTotalExpenses().toFixed(2)}` : '••••••'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {showBalance ? `R$ ${getBalance().toFixed(2)}` : '••••••'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Metas</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {goals.length}
          </div>
          <p className="text-xs text-muted-foreground">
            {goals.filter(g => (g.currentAmount / g.targetAmount) >= 1).length} concluídas
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Planejamento Financeiro</h1>
            <p className="text-gray-600">Gerencie suas finanças de forma inteligente</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nova Transação</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova receita ou despesa
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={newTransaction.type}
                        onValueChange={(value) => setNewTransaction({...newTransaction, type: value as 'income' | 'expense'})}
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
                        value={newTransaction.amount || ''}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(c => c.type === newTransaction.type)
                          .map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Descrição da transação"
                      value={newTransaction.description || ''}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newTransaction.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTransaction.date ? format(newTransaction.date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTransaction.date}
                          onSelect={(date) => setNewTransaction({...newTransaction, date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={newTransaction.recurring || false}
                      onCheckedChange={(checked) => setNewTransaction({...newTransaction, recurring: checked})}
                    />
                    <Label htmlFor="recurring">Transação recorrente</Label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addTransaction}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transações Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Transações Recentes</CardTitle>
                  <CardDescription>Últimas movimentações financeiras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(-5).reverse().map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.category}</p>
                          </div>
                        </div>
                        <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Nenhuma transação encontrada</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Orçamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Orçamentos</CardTitle>
                  <CardDescription>Acompanhe seus limites de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgets.map(budget => {
                      const percentage = (budget.spent / budget.limit) * 100
                      const isOverBudget = percentage > 100
                      const isNearLimit = percentage > budget.alertThreshold
                      
                      return (
                        <div key={budget.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{budget.category}</span>
                            <span className={`text-sm ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}`}>
                              R$ {budget.spent.toFixed(2)} / R$ {budget.limit.toFixed(2)}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={`h-2 ${isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-gray-100'}`}
                          />
                          {isOverBudget && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Orçamento excedido em R$ {(budget.spent - budget.limit).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )
                    })}
                    {budgets.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Nenhum orçamento configurado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metas */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso das Metas</CardTitle>
                <CardDescription>Acompanhe o progresso dos seus objetivos financeiros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goals.map(goal => {
                    const percentage = (goal.currentAmount / goal.targetAmount) * 100
                    const isCompleted = percentage >= 100
                    const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <Card key={goal.id} className={`${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                              {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>
                          {goal.description && (
                            <CardDescription>{goal.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>R$ {goal.currentAmount.toFixed(2)}</span>
                            <span>R$ {goal.targetAmount.toFixed(2)}</span>
                          </div>
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{percentage.toFixed(1)}% concluído</span>
                            <span>
                              {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                            </span>
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              Meta concluída!
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  {goals.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      Nenhuma meta configurada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Todas as Transações</CardTitle>
                    <CardDescription>Gerencie suas receitas e despesas</CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions
                    .filter(t => filterCategory === 'all' || t.category === filterCategory)
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{transaction.category}</span>
                              <span>•</span>
                              <span>{format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}</span>
                              {transaction.recurring && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">Recorrente</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Nenhuma transação encontrada</p>
                      <Button onClick={() => setShowTransactionDialog(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar primeira transação
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Orçamentos</CardTitle>
                    <CardDescription>Controle seus gastos por categoria</CardDescription>
                  </div>
                  
                  <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Novo Orçamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Orçamento</DialogTitle>
                        <DialogDescription>
                          Defina um limite de gastos para uma categoria
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="budget-category">Categoria</Label>
                          <Select
                            value={newBudget.category}
                            onValueChange={(value) => setNewBudget({...newBudget, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories
                                .filter(c => c.type === 'expense')
                                .map(category => (
                                  <SelectItem key={category.id} value={category.name}>
                                    {category.icon} {category.name}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="budget-limit">Limite (R$)</Label>
                            <Input
                              id="budget-limit"
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={newBudget.limit || ''}
                              onChange={(e) => setNewBudget({...newBudget, limit: parseFloat(e.target.value)})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="budget-period">Período</Label>
                            <Select
                              value={newBudget.period}
                              onValueChange={(value) => setNewBudget({...newBudget, period: value as 'monthly' | 'weekly' | 'yearly'})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                                <SelectItem value="yearly">Anual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="alert-threshold">Alerta em (%)</Label>
                          <Input
                            id="alert-threshold"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="80"
                            value={newBudget.alertThreshold || ''}
                            onChange={(e) => setNewBudget({...newBudget, alertThreshold: parseInt(e.target.value)})}
                          />
                          <p className="text-xs text-gray-500">
                            Receba um alerta quando atingir esta porcentagem do limite
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={addBudget}>
                          Criar Orçamento
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {budgets.map(budget => {
                    const currentSpent = getCategorySpending(budget.category)
                    const percentage = (currentSpent / budget.limit) * 100
                    const isOverBudget = percentage > 100
                    const isNearLimit = percentage > budget.alertThreshold
                    
                    return (
                      <Card key={budget.id} className={`${isOverBudget ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{budget.category}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={budget.period === 'monthly' ? 'default' : 'secondary'}>
                                {budget.period === 'monthly' ? 'Mensal' : budget.period === 'weekly' ? 'Semanal' : 'Anual'}
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => deleteBudget(budget.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Gasto atual</span>
                            <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                              R$ {currentSpent.toFixed(2)} / R$ {budget.limit.toFixed(2)}
                            </span>
                          </div>
                          
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={`h-3 ${isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-gray-100'}`}
                          />
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className={isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}>
                              {percentage.toFixed(1)}% utilizado
                            </span>
                            {isOverBudget ? (
                              <span className="text-red-600 font-medium">
                                Excedido em R$ {(currentSpent - budget.limit).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-green-600">
                                Restam R$ {(budget.limit - currentSpent).toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          {isOverBudget && (
                            <Alert className="border-red-200 bg-red-50">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-red-800">
                                Atenção! Você excedeu o orçamento desta categoria.
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {isNearLimit && !isOverBudget && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-yellow-800">
                                Cuidado! Você está próximo do limite do orçamento.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  
                  {budgets.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Nenhum orçamento configurado</p>
                      <Button onClick={() => setShowBudgetDialog(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar primeiro orçamento
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Metas Financeiras</CardTitle>
                    <CardDescription>Defina e acompanhe seus objetivos</CardDescription>
                  </div>
                  
                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Target className="h-4 w-4 mr-2" />
                        Nova Meta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Meta</DialogTitle>
                        <DialogDescription>
                          Defina um objetivo financeiro para alcançar
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="goal-title">Título da Meta</Label>
                          <Input
                            id="goal-title"
                            placeholder="Ex: Viagem para Europa"
                            value={newGoal.title || ''}
                            onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="goal-description">Descrição (opcional)</Label>
                          <Textarea
                            id="goal-description"
                            placeholder="Descreva sua meta..."
                            value={newGoal.description || ''}
                            onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="goal-target">Valor Alvo (R$)</Label>
                            <Input
                              id="goal-target"
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={newGoal.targetAmount || ''}
                              onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value)})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="goal-current">Valor Atual (R$)</Label>
                            <Input
                              id="goal-current"
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={newGoal.currentAmount || ''}
                              onChange={(e) => setNewGoal({...newGoal, currentAmount: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="goal-category">Categoria</Label>
                            <Input
                              id="goal-category"
                              placeholder="Ex: Viagem, Casa, Carro"
                              value={newGoal.category || ''}
                              onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="goal-priority">Prioridade</Label>
                            <Select
                              value={newGoal.priority}
                              onValueChange={(value) => setNewGoal({...newGoal, priority: value as 'low' | 'medium' | 'high'})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Prazo</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newGoal.deadline && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newGoal.deadline ? format(newGoal.deadline, "PPP", { locale: ptBR }) : "Selecione uma data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newGoal.deadline}
                                onSelect={(date) => setNewGoal({...newGoal, deadline: date})}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={addGoal}>
                          Criar Meta
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {goals.map(goal => {
                    const percentage = (goal.currentAmount / goal.targetAmount) * 100
                    const isCompleted = percentage >= 100
                    const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isOverdue = daysLeft < 0
                    
                    return (
                      <Card key={goal.id} className={`${isCompleted ? 'border-green-200 bg-green-50' : isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <CardTitle className="text-xl">{goal.title}</CardTitle>
                              {goal.description && (
                                <CardDescription>{goal.description}</CardDescription>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                                  {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                                <Badge variant="outline">{goal.category}</Badge>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingItem(goal)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progresso</span>
                            <span className="font-bold">
                              R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
                            </span>
                          </div>
                          
                          <Progress value={Math.min(percentage, 100)} className="h-3" />
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className={isCompleted ? 'text-green-600' : 'text-gray-600'}>
                              {percentage.toFixed(1)}% concluído
                            </span>
                            <span className={isOverdue ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-gray-600'}>
                              {isOverdue ? `${Math.abs(daysLeft)} dias em atraso` : `${daysLeft} dias restantes`}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Prazo: {format(goal.deadline, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          
                          {isCompleted && (
                            <Alert className="border-green-200 bg-green-50">
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription className="text-green-800">
                                🎉 Parabéns! Você alcançou sua meta!
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {isOverdue && !isCompleted && (
                            <Alert className="border-red-200 bg-red-50">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-red-800">
                                Esta meta está em atraso. Considere revisar o prazo ou o valor.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  
                  {goals.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Nenhuma meta configurada</p>
                      <Button onClick={() => setShowGoalDialog(true)}>
                        <Target className="h-4 w-4 mr-2" />
                        Criar primeira meta
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Gastos por Categoria
                  </CardTitle>
                  <CardDescription>Distribuição das suas despesas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories
                      .filter(c => c.type === 'expense')
                      .map(category => {
                        const spent = getCategorySpending(category.name)
                        const percentage = getTotalExpenses() > 0 ? (spent / getTotalExpenses()) * 100 : 0
                        
                        return (
                          <div key={category.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span className="font-medium">{category.name}</span>
                              </span>
                              <span className="font-bold">R$ {spent.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className="flex-1 h-2" />
                              <span className="text-sm text-gray-500 w-12">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estatísticas Gerais
                  </CardTitle>
                  <CardDescription>Resumo das suas finanças</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{transactions.filter(t => t.type === 'income').length}</p>
                        <p className="text-sm text-green-700">Receitas</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{transactions.filter(t => t.type === 'expense').length}</p>
                        <p className="text-sm text-red-700">Despesas</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Maior receita</span>
                        <span className="font-bold text-green-600">
                          R$ {Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Maior despesa</span>
                        <span className="font-bold text-red-600">
                          R$ {Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Média de gastos</span>
                        <span className="font-bold">
                          R$ {transactions.filter(t => t.type === 'expense').length > 0 
                            ? (getTotalExpenses() / transactions.filter(t => t.type === 'expense').length).toFixed(2)
                            : '0.00'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de poupança</span>
                        <span className={`font-bold ${getBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {getTotalIncome() > 0 ? ((getBalance() / getTotalIncome()) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações de Relatório */}
            <Card>
              <CardHeader>
                <CardTitle>Ações de Relatório</CardTitle>
                <CardDescription>Exporte ou importe seus dados financeiros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" onClick={() => {
                    const data = {
                      transactions,
                      budgets,
                      goals,
                      categories,
                      exportDate: new Date().toISOString()
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `financeiro-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                    toast({
                      title: "Sucesso",
                      description: "Dados exportados com sucesso!"
                    })
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  
                  <Button variant="outline" onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.json'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          try {
                            const data = JSON.parse(e.target?.result as string)
                            if (data.transactions) setTransactions(data.transactions.map((t: any) => ({ ...t, date: new Date(t.date) })))
                            if (data.budgets) setBudgets(data.budgets)
                            if (data.goals) setGoals(data.goals.map((g: any) => ({ ...g, deadline: new Date(g.deadline) })))
                            if (data.categories) setCategories(data.categories)
                            toast({
                              title: "Sucesso",
                              description: "Dados importados com sucesso!"
                            })
                          } catch (error) {
                            toast({
                              title: "Erro",
                              description: "Arquivo inválido ou corrompido",
                              variant: "destructive"
                            })
                          }
                        }
                        reader.readAsText(file)
                      }
                    }
                    input.click()
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Dados
                  </Button>
                  
                  <Button variant="outline" onClick={() => {
                    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                      setTransactions([])
                      setBudgets([])
                      setGoals([])
                      setCategories(defaultCategories)
                      toast({
                        title: "Sucesso",
                        description: "Todos os dados foram limpos!"
                      })
                    }
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Limpar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
