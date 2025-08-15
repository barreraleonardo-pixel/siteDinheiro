"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, ExternalLink } from "lucide-react"

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")

  const handleSave = () => {
    // In a real app, you would save these to environment variables
    // For now, we'll just show a success message
    alert("Configuração salva! Reinicie a aplicação para aplicar as mudanças.")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Configuração do Sistema</h1>
          <p className="text-lg text-gray-600">Configure o Supabase para começar a usar o sistema financeiro</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    1
                  </span>
                  Criar Projeto no Supabase
                </CardTitle>
                <CardDescription>Primeiro, você precisa criar um projeto no Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  1. Acesse{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p className="text-sm text-gray-600">2. Clique em "Start your project"</p>
                <p className="text-sm text-gray-600">3. Crie uma conta ou faça login</p>
                <p className="text-sm text-gray-600">4. Clique em "New Project"</p>
                <p className="text-sm text-gray-600">5. Escolha um nome e senha para o banco de dados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    2
                  </span>
                  Obter Credenciais
                </CardTitle>
                <CardDescription>Copie as credenciais do seu projeto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">1. No dashboard do projeto, vá em "Settings" → "API"</p>
                <p className="text-sm text-gray-600">2. Copie a "Project URL"</p>
                <p className="text-sm text-gray-600">3. Copie a "anon public" key</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    3
                  </span>
                  Executar Scripts SQL
                </CardTitle>
                <CardDescription>Execute os scripts para criar as tabelas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">1. No Supabase, vá em "SQL Editor"</p>
                <p className="text-sm text-gray-600">2. Execute os scripts da pasta "scripts/" do projeto</p>
                <p className="text-sm text-gray-600">3. Comece com "01-create-tables.sql"</p>
                <p className="text-sm text-gray-600">4. Depois execute "02-create-functions.sql"</p>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Configurar Credenciais</CardTitle>
                <CardDescription>Cole suas credenciais do Supabase aqui</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Variáveis de Ambiente</h4>
                  <p className="text-sm text-yellow-700 mb-3">Adicione estas variáveis ao seu arquivo .env.local:</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                    <div className="flex items-center justify-between mb-1">
                      <span>NEXT_PUBLIC_SUPABASE_URL={supabaseUrl || "sua-url-aqui"}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>NEXT_PUBLIC_SUPABASE_ANON_KEY={supabaseKey || "sua-chave-aqui"}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full" disabled={!supabaseUrl || !supabaseKey}>
                  Salvar Configuração
                </Button>

                <div className="text-center">
                  <a href="/" className="text-blue-600 hover:underline text-sm">
                    ← Voltar para o sistema
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
