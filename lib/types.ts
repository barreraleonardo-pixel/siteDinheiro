export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "admin" | "user"
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color: string
  user_id: string
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
  percentage: number
  count: number
}
