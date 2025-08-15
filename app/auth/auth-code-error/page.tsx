import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Erro na Autenticação</CardTitle>
          <CardDescription>
            Houve um problema ao confirmar sua conta. O link pode ter expirado ou já foi usado.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild className="w-full">
            <Link href="/login">Voltar ao Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
