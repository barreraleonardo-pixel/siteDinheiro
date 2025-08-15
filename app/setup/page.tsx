"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const validateCredentials = () => {
    const urlValid = supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co")
    const keyValid = supabaseKey.startsWith("eyJ") && supabaseKey.length > 100
    setIsValid(urlValid && keyValid)
    return urlValid && keyValid
  }

  const handleCheck = async () => {
    if (!validateCredentials()) return

    setIsChecking(true)
    // Simulate API check
    setTimeout(() => {
      setIsChecking(false)
      router.push("/")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Configuração do Sistema</CardTitle>
          <CardDescription className="text-center">
            Configure as credenciais do Supabase para começar a usar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Você precisa configurar um projeto no Supabase para usar este sistema.</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 1: Criar projeto no Supabase</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>
                  Acesse{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    supabase.com <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </li>
                <li>Crie uma conta gratuita</li>
                <li>Crie um novo projeto</li>
                <li>Aguarde a criação do projeto (pode levar alguns minutos)</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 2: Obter credenciais</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>No painel do seu projeto, vá em Settings → API</li>
                <li>Copie a URL do projeto</li>
                <li>Copie a chave anon/public</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 3: Configurar credenciais</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supabase-url">URL do Projeto Supabase</Label>
                  <Input
                    id="supabase-url"
                    type="url"
                    placeholder="https://seu-projeto.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => {
                      setSupabaseUrl(e.target.value)
                      validateCredentials()
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="supabase-key">Chave Anon/Public</Label>
                  <Input
                    id="supabase-key"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => {
                      setSupabaseKey(e.target.value)
                      validateCredentials()
                    }}
                  />
                </div>
              </div>
            </div>

            {isValid && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Credenciais válidas! Você pode prosseguir com a configuração.</AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Passo 4: Configurar variáveis de ambiente</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Adicione estas variáveis ao seu arquivo .env.local:</p>
                <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                  {`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || "sua-url-aqui"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey || "sua-chave-aqui"}`}
                </pre>
              </div>
            </div>

            <Button onClick={handleCheck} disabled={!isValid || isChecking} className="w-full">
              {isChecking ? "Verificando..." : "Continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
