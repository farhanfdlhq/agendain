"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/reui/alert"
import AirplaneLoader from "@/components/ui/airplane-loader"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        router.push("/admin")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-background rounded-2xl shadow-xl overflow-hidden border">
        
        {/* Left Side - Image/Branding */}
        <div className="hidden md:flex flex-col items-center justify-center bg-primary p-12 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">Agendain</h1>
            <p className="text-lg text-primary-foreground/80">Sistem Manajemen Perjalanan Eksklusif</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight">Selamat Datang Kembali</h2>
              <p className="text-muted-foreground">Silakan masuk ke panel admin Anda.</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Admin</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@agendain.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <AirplaneLoader className="mr-2 h-4 w-4 " />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </Button>
            </form>
            
            <div className="pt-6 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Agendain Travel.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
