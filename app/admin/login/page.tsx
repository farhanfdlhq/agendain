"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import styles from "./page.module.css"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        
        {/* Left Side - Image/Branding */}
        <div className={styles.brandingPanel}>
          <Image 
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1080&auto=format&fit=crop"
            alt="Agendain Admin"
            fill
            className={styles.bgImage}
            priority
          />
          <div className={styles.overlay} />
          <div className={styles.brandingContent}>
            <h1 className={styles.logo}>Agendain</h1>
            <p className={styles.tagline}>Sistem Manajemen Perjalanan Eksklusif</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.formPanel}>
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <h2 className={styles.title}>Selamat Datang Kembali</h2>
              <p className={styles.subtitle}>Silakan masuk ke panel admin Anda.</p>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Admin</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@agendain.com"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Kata Sandi</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className={styles.spinner} size={20} />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>
            </form>
            
            <div className={styles.footer}>
              <p>&copy; {new Date().getFullYear()} Agendain Travel.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
