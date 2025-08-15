"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, ExternalLink, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [step, setStep] = useState(1)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuração do Sistema</h1>
          <p className="mt-2 text-gray-600">Configure sua conexão com o Supabase para começar a usar o sistema</p>
        </div>

        <div className="space-y-6">
          {/* Passo 1: Criar projeto no Supabase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  1
                </span>
                Criar projeto no Supabase
              </CardTitle>
              <CardDescription>Primeiro, você precisa criar um projeto gratuito no Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Acesse</span>
                <Link
                  href="https://supabase.com"
                  target="_blank"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  supabase.com
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Clique em "Start your project"</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Crie uma conta ou faça login</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Crie um novo projeto</span>
              </div>
            </CardContent>
          </Card>

          {/* Passo 2: Obter credenciais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                Obter credenciais do projeto
              </CardTitle>
              <CardDescription>Copie as credenciais do seu projeto Supabase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>No painel do Supabase, vá em "Settings" → "API"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Copie a "Project URL"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Copie a "anon public" key</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="supabase-url">Project URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://seu-projeto.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supabase-key">Anon Key</Label>
                  <Input
                    id="supabase-key"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passo 3: Configurar variáveis de ambiente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  3
                </span>
                Configurar variáveis de ambiente
              </CardTitle>
              <CardDescription>Adicione as credenciais ao arquivo .env.local</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Crie um arquivo .env.local na raiz do projeto</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Adicione o conteúdo abaixo:</span>
                </div>
              </div>

              {supabaseUrl && supabaseKey && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Conteúdo do .env.local:</span>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(envContent)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">{envContent}</pre>
                </div>
              )}

              {(!supabaseUrl || !supabaseKey) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Preencha os campos acima para gerar o arquivo .env.local</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Passo 4: Executar scripts SQL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  4
                </span>
                Executar scripts do banco de dados
              </CardTitle>
              <CardDescription>Execute os scripts SQL para criar as tabelas necessárias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>No Supabase, vá em "SQL Editor"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Execute os scripts na pasta /scripts do projeto</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Execute primeiro 01-create-tables.sql</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Depois execute 02-create-functions.sql</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passo 5: Finalizar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  5
                </span>
                Finalizar configuração
              </CardTitle>
              <CardDescription>Reinicie o servidor de desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Pare o servidor (Ctrl+C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Execute: npm run dev</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Acesse novamente a aplicação</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <Button className="w-full">Voltar para o sistema</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
