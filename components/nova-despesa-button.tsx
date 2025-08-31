'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { PlusCircle, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

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

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

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

interface NovaDespesaButtonProps {
  onTransactionAdded?: (transaction: Transaction) => void
}

export default function NovaDespesaButton({ onTransactionAdded }: NovaDespesaButtonProps) {
  const [open, setOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date()
  })
  const { toast } = useToast()

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

    // Salvar no localStorage
    const existingTransactions = JSON.parse(localStorage.getItem('financial-transactions') || '[]')
    const updatedTransactions = [...existingTransactions, transaction]
    localStorage.setItem('financial-transactions', JSON.stringify(updatedTransactions))

    // Callback para componente pai
    if (onTransactionAdded) {
      onTransactionAdded(transaction)
    }

    // Reset form
    setNewTransaction({ type: 'expense', date: new Date() })
    setOpen(false)
    
    toast({
      title: "Sucesso",
      description: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ou despesa ao seu controle financeiro
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
                  <SelectItem value="income">💰 Receita</SelectItem>
                  <SelectItem value="expense">💸 Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
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
                {defaultCategories
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={addTransaction}>
            Adicionar Transação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
