export interface Transaction {
  id: string
  user_id: string
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  date: string
  created_at: string
}

export interface MonthlyStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
}

export interface CategoryStats {
  category: string
  amount: number
  count: number
  percentage: number
}

export interface User {
  id: string
  email: string
  name?: string
  role?: "admin" | "user"
  created_at: string
}
