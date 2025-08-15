import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/types"

export class HistoricoService {
  private supabase = createClient()

  async getTransactions(
    userId: string,
    filters?: {
      startDate?: string
      endDate?: string
      type?: "income" | "expense"
      category?: string
      search?: string
    },
  ): Promise<Transaction[]> {
    let query = this.supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false })

    if (filters?.startDate) {
      query = query.gte("date", filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte("date", filters.endDate)
    }

    if (filters?.type) {
      query = query.eq("type", filters.type)
    }

    if (filters?.category) {
      query = query.eq("category", filters.category)
    }

    if (filters?.search) {
      query = query.or(`description.ilike.%${filters.search}%,category.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`)
    }

    return data || []
  }

  async getMonthlyStats(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]
    const endDate = new Date(year, month, 0).toISOString().split("T")[0]

    const transactions = await this.getTransactions(userId, {
      startDate,
      endDate,
    })

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      transactions,
    }
  }

  async getCategoryStats(userId: string, startDate?: string, endDate?: string) {
    const transactions = await this.getTransactions(userId, {
      startDate,
      endDate,
      type: "expense",
    })

    const categoryMap = new Map<string, { amount: number; count: number }>()

    transactions.forEach((t) => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 }
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      })
    })

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0)

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  async exportToCSV(
    userId: string,
    filters?: {
      startDate?: string
      endDate?: string
      type?: "income" | "expense"
      category?: string
    },
  ): Promise<string> {
    const transactions = await this.getTransactions(userId, filters)

    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"]
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
        [
          t.date,
          `"${t.description}"`,
          `"${t.category}"`,
          t.type === "income" ? "Receita" : "Despesa",
          t.amount.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    return csvContent
  }
}

export const historicoService = new HistoricoService()
