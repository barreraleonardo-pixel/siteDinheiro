import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Erro de Autenticação</CardTitle>
          <CardDescription className="text-center">Houve um problema ao confirmar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>O link de confirmação pode ter expirado ou já foi usado.</AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">Voltar ao Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
