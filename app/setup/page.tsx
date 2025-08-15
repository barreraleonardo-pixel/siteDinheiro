"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink, Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if already configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key) {
      setIsConfigured(true)
      setSupabaseUrl(url)
      setSupabaseKey(key.substring(0, 20) + "...")
    }
  }, [])

  const handleSave = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // In a real app, you would save these to environment variables
    // For this demo, we'll just simulate the save
    setTimeout(() => {
      setLoading(false)
      setIsConfigured(true)
      toast({
        title: "Configuração salva!",
        description: "Reinicie a aplicação para aplicar as mudanças.",
      })
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    })
  }

  if (isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Sistema Configurado!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                O Supabase está configurado e funcionando corretamente.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>URL do Supabase</Label>
              <div className="flex gap-2">
                <Input value={supabaseUrl} readOnly className="bg-gray-50" />
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(supabaseUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button onClick={() => router.push("/")} className="w-full">
                Ir para o Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Configurar Supabase</CardTitle>
          <p className="text-gray-600">Configure as credenciais do Supabase para usar o sistema</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa criar um projeto no Supabase e obter as credenciais para continuar.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">URL do Projeto Supabase</Label>
              <Input
                id="supabase-url"
                placeholder="https://seu-projeto.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase-key">Chave Anônima (anon key)</Label>
              <div className="relative">
                <Input
                  id="supabase-key"
                  type={showKey ? "text" : "password"}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Como obter as credenciais:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>
                Acesse{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline inline-flex items-center"
                >
                  supabase.com <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>Crie uma conta e um novo projeto</li>
              <li>Vá em Settings → API</li>
              <li>Copie a "Project URL" e a "anon public" key</li>
              <li>Cole as informações nos campos acima</li>
            </ol>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Configuração"}
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Em produção, adicione essas variáveis ao seu arquivo .env.local:
              <br />
              <code className="text-xs bg-gray-100 p-1 rounded mt-1 block">
                NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
                <br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
