"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertOctagon, RefreshCcw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    console.error("Application Error:", error)
  }, [error])

  const handleRetry = () => {
    if (attempts > 0) {
      window.location.reload()
      return
    }
    setAttempts((prev) => prev + 1)
    try {
      startTransition(() => {
        router.refresh()
        reset()
      })
    } catch {
      window.location.reload()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '70vh', padding: '0 1rem', textAlign: 'center', fontFamily: 'var(--font-body, system-ui, sans-serif)'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes errorRetrySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div style={{ 
          position: 'absolute', inset: 0, backgroundColor: 'var(--color-error, #ef4444)', 
          opacity: 0.15, filter: 'blur(30px)', borderRadius: '50%', width: '120px', height: '120px', zIndex: -1,
          left: '50%', top: '50%', transform: 'translate(-50%, -50%)' 
        }} />
        <AlertOctagon size={80} style={{ color: 'var(--color-error, #ef4444)' }} strokeWidth={1.5} />
      </div>
      
      <h1 style={{
        fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: 900, marginBottom: '0.5rem',
        color: 'var(--color-error, #ef4444)', lineHeight: 1
      }}>
        500
      </h1>
      
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-ink, #1c1c1c)' }}>
        Oops! Ada Kesalahan Sistem
      </h2>
      
      <p style={{ maxWidth: '400px', color: 'var(--color-ink, #1c1c1c)', opacity: 0.7, marginBottom: '2rem', fontSize: '1.125rem' }}>
        Maaf, sistem kami mengalami gangguan internal. Tim kami telah diberitahu dan sedang memperbaikinya.
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleRetry}
          disabled={isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
            fontWeight: 600, backgroundColor: 'var(--color-error, #ef4444)', color: '#ffffff', border: 'none',
            cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.8 : 1,
            transition: 'opacity 0.2s', boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
          }}
          onMouseOver={(e) => { if (!isPending) e.currentTarget.style.opacity = '0.9' }}
          onMouseOut={(e) => { if (!isPending) e.currentTarget.style.opacity = '1' }}
        >
          <RefreshCcw size={18} style={{ animation: isPending ? 'errorRetrySpin 1s linear infinite' : 'none' }} />
          {isPending ? 'Memuat Ulang...' : 'Coba Lagi'}
        </button>
        <a 
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
            fontWeight: 600, backgroundColor: 'var(--color-surface-soft, #f4f4f5)', color: 'var(--color-ink, #1c1c1c)', textDecoration: 'none',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Home size={18} /> Beranda Utama
        </a>
      </div>
    </div>
  )
}
