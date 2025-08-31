'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle, Eye, EyeOff, Calendar, PieChart, BarChart3, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import NovaDespesaButton from './nova-despesa-button'

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

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showBalance, setShowBalance] = useState(true)

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financial-transactions')
    const savedBudgets = localStorage.getItem('financial-budgets')
    const savedGoals = localStorage.getItem('financial-goals')

    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions)
      setTransactions(parsed.map((t: any) => ({ ...t, date: new Date(t.date) })))
    }
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets))
    if (savedGoals) {
      const parsed = JSON.parse(savedGoals)
      setGoals(parsed.map((g: any) => ({ ...g, deadline: new Date(g.deadline) })))
    }
  }, [])

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

  const handleTransactionAdded = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction])
  }

  // Componente de estatísticas principais
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {showBalance ? `R$ ${getTotalIncome().toFixed(2)}` : '••••••'}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {transactions.filter(t => t.type === 'income').length} transações
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">
            {showBalance ? `R$ ${getTotalExpenses().toFixed(2)}` : '••••••'}
          </div>
          <p className="text-xs text-red-600 mt-1">
            {transactions.filter(t => t.type === 'expense').length} transações
          </p>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br ${getBalance() >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${getBalance() >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Saldo</CardTitle>
          <DollarSign className={`h-4 w-4 ${getBalance() >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getBalance() >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {showBalance ? `R$ ${getBalance().toFixed(2)}` : '••••••'}
          </div>
          <p className={`text-xs mt-1 ${getBalance() >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {getBalance() >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Metas</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            {goals.length}
          </div>
          <p className="text-xs text-purple-600 mt-1">
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
            <p className="text-gray-600">Visão geral das suas finanças pessoais</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="bg-white/80 backdrop-blur-sm"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showBalance ? 'Ocultar' : 'Mostrar'}
            </Button>
            
            <NovaDespesaButton onTransactionAdded={handleTransactionAdded} />
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transações Recentes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Transações Recentes
                  </CardTitle>
                  <CardDescription>Últimas movimentações financeiras</CardDescription>
                </div>
                <Badge variant="outline">{transactions.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.slice(-8).reverse().map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-lg border hover:bg-white/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
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
                    <div className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">Nenhuma transação encontrada</p>
                    <NovaDespesaButton onTransactionAdded={handleTransactionAdded} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo Rápido */}
          <div className="space-y-6">
            {/* Status dos Orçamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Orçamentos
                </CardTitle>
                <CardDescription>Status dos seus limites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets.slice(0, 3).map(budget => {
                    const currentSpent = getCategorySpending(budget.category)
                    const percentage = (currentSpent / budget.limit) * 100
                    const isOverBudget = percentage > 100
                    const isNearLimit = percentage > budget.alertThreshold
                    
                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{budget.category}</span>
                          <span className={`text-xs ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-gray-100'}`}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>R$ {currentSpent.toFixed(2)}</span>
                          <span>R$ {budget.limit.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  })}
                  {budgets.length === 0 && (
                    <p className="text-center text-gray-500 py-4 text-sm">Nenhum orçamento configurado</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Próximas Metas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas
                </CardTitle>
                <CardDescription>Progresso dos objetivos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.slice(0, 2).map(goal => {
                    const percentage = (goal.currentAmount / goal.targetAmount) * 100
                    const isCompleted = percentage >= 100
                    const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div key={goal.id} className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white/60'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{goal.title}</h4>
                          <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                            {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{percentage.toFixed(1)}%</span>
                          <span>{daysLeft > 0 ? `${daysLeft}d` : 'Vencido'}</span>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                            <CheckCircle className="h-3 w-3" />
                            Concluída!
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {goals.length === 0 && (
                    <p className="text-center text-gray-500 py-4 text-sm">Nenhuma meta configurada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alertas e Notificações */}
        {(budgets.some(b => getCategorySpending(b.category) > b.limit) || goals.some(g => {
          const daysLeft = Math.ceil((g.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          return daysLeft < 0 && (g.currentAmount / g.targetAmount) < 1
        })) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Alertas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {budgets
                .filter(b => getCategorySpending(b.category) > b.limit)
                .map(budget => (
                  <Alert key={budget.id} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      <strong>{budget.category}:</strong> Orçamento excedido em R$ {(getCategorySpending(budget.category) - budget.limit).toFixed(2)}
                    </AlertDescription>
                  </Alert>
                ))}
              
              {goals
                .filter(g => {
                  const daysLeft = Math.ceil((g.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return daysLeft < 0 && (g.currentAmount / g.targetAmount) < 1
                })
                .map(goal => (
                  <Alert key={goal.id} className="border-orange-200 bg-orange-50">
                    <Calendar className="h-4 w-4" />
                    <AlertDescription className="text-orange-800">
                      <strong>{goal.title}:</strong> Meta vencida há {Math.abs(Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias
                    </AlertDescription>
                  </Alert>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Receitas:</span>
                  <span className="font-bold text-green-600">R$ {getTotalIncome().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Despesas:</span>
                  <span className="font-bold text-red-600">R$ {getTotalExpenses().toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Economia:</span>
                  <span className={`font-bold ${getBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {getBalance().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Maior Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.filter(t => t.type === 'income').length > 0 ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount)).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {transactions.filter(t => t.type === 'income').find(t => t.amount === Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount)))?.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma receita registrada</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Maior Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.filter(t => t.type === 'expense').length > 0 ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">
                    R$ {Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount)).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {transactions.filter(t => t.type === 'expense').find(t => t.amount === Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount)))?.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma despesa registrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
