"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Public Error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        <AlertTriangle className="w-10 h-10" style={{ color: 'var(--color-error)' }} />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--color-ink)' }}>Oops! Ada yang tidak beres.</h2>
      <p className="max-w-lg mb-8" style={{ color: 'var(--color-ink)', opacity: 0.7 }}>
        Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba muat ulang atau kembali ke halaman utama.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <RefreshCcw size={18} />
          Coba Lagi
        </button>
        <a 
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors border"
          style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-ink)', borderColor: 'var(--color-ink)' }}
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}
