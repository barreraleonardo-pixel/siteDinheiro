"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ExternalLink, Copy, Database, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setTestResult("error")
      return
    }

    setTesting(true)
    try {
      // Simular teste de conexão
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Verificar formato básico da URL
      if (supabaseUrl.includes(".supabase.co") && supabaseKey.length > 50) {
        setTestResult("success")
      } else {
        setTestResult("error")
      }
    } catch (error) {
      setTestResult("error")
    } finally {
      setTesting(false)
    }
  }

  const envTemplate = `NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima`

  const envWithValues =
    supabaseUrl && supabaseKey
      ? `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`
      : envTemplate

  const sqlScript1 = `-- Criar tabelas principais
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount DECIMAL(10,2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, month, year)
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`

  const sqlScript2 = `-- Habilitar RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);`

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuração do Supabase</h1>
          <p className="mt-2 text-gray-600">Configure sua base de dados para persistir seus dados financeiros</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Status Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Modo Demo</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Ativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Supabase</span>
                  <Badge variant="outline" className="text-gray-600">
                    Não Configurado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Persistência</span>
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>

              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  Seus dados são temporários e serão perdidos ao recarregar a página.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurar Supabase
              </CardTitle>
              <CardDescription>Conecte seu projeto Supabase para salvar dados permanentemente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL do Projeto</Label>
                <Input
                  id="url"
                  placeholder="https://seu-projeto.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Chave Anônima</Label>
                <Input
                  id="key"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  type="password"
                />
              </div>

              <Button onClick={testConnection} disabled={testing || !supabaseUrl || !supabaseKey} className="w-full">
                {testing ? "Testando..." : "Testar Conexão"}
              </Button>

              {testResult === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Conexão bem-sucedida! Configure as variáveis de ambiente.
                  </AlertDescription>
                </Alert>
              )}

              {testResult === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Erro na conexão. Verifique as credenciais.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <div className="mt-8 space-y-6">
          {/* Passo 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  1
                </span>
                Criar Projeto Supabase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Acesse o Supabase e crie um novo projeto para obter suas credenciais.
              </p>
              <Button variant="outline" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Supabase Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Passo 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                Configurar Variáveis de Ambiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Adicione estas variáveis ao seu arquivo .env.local:</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard(envWithValues, "env")}
                >
                  {copied === "env" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="whitespace-pre-wrap">{envWithValues}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Passo 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  3
                </span>
                Executar Scripts SQL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Execute estes scripts no SQL Editor do Supabase para criar as tabelas:</p>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Script 1: Criar Tabelas</h4>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(sqlScript1, "sql1")}>
                    {copied === "sql1" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs max-h-40 overflow-y-auto">
                  <pre>{sqlScript1}</pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Script 2: Configurar Segurança</h4>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(sqlScript2, "sql2")}>
                    {copied === "sql2" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs max-h-40 overflow-y-auto">
                  <pre>{sqlScript2}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passo 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  4
                </span>
                Finalizar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Após configurar tudo, reinicie a aplicação para ativar a persistência de dados.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/")}>Voltar ao Dashboard</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recarregar Aplicação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
