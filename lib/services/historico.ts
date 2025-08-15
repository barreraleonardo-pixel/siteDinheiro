import { createClient } from "@/lib/supabase/client"
import type { Transaction, UserStats } from "@/lib/types"

export class HistoricoService {
  private supabase = createClient()

  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`)
    }

    return data || []
  }

  async addTransaction(transaction: Omit<Transaction, "id" | "created_at" | "updated_at">): Promise<Transaction> {
    const { data, error } = await this.supabase.from("transactions").insert([transaction]).select().single()

    if (error) {
      throw new Error(`Erro ao adicionar transação: ${error.message}`)
    }

    return data
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await this.supabase.from("transactions").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`)
    }

    return data
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.supabase.from("transactions").delete().eq("id", id)

    if (error) {
      throw new Error(`Erro ao deletar transação: ${error.message}`)
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const { data, error } = await this.supabase.rpc("get_user_stats", { user_uuid: userId })

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }

    return data
  }

  async getTransactionsByPeriod(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar transações por período: ${error.message}`)
    }

    return data || []
  }

  async getTransactionsByCategory(userId: string, category: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("category", category)
      .order("date", { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar transações por categoria: ${error.message}`)
    }

    return data || []
  }
}

export const historicoService = new HistoricoService()
