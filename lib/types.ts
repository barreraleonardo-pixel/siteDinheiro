export interface Transaction {
  id: string
  user_id: string
  type: "receita" | "despesa"
  category: string
  description: string
  amount: number
  date: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: "receita" | "despesa"
  color: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: "monthly" | "yearly"
  year: number
  month?: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  updated_at: string
  username: string
  full_name: string
  avatar_url: string
  website: string
}

export interface UserStats {
  total_income: number
  total_expenses: number
  current_month_income: number
  current_month_expenses: number
  balance: number
  current_month_balance: number
  transaction_count: number
}
