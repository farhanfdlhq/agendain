"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin Error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Terjadi Kesalahan Sistem</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Sistem gagal memuat data yang Anda minta. Ini bisa jadi karena koneksi terputus atau masalah pada server.
      </p>
      <div className="flex items-center gap-4">
        <Button onClick={() => reset()} size="lg" className="gap-2">
          <RefreshCcw size={18} />
          Muat Ulang
        </Button>
        <Button variant="outline" size="lg" asChild className="gap-2">
          <Link href="/admin">
            <Home size={18} />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
