"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { hasPermission } from "@/lib/permissions"

/**
 * Penjaga sisi klien untuk halaman admin: tanpa permission → kembali ke /admin.
 * Hanya UX (menyembunyikan halaman yang tak bisa dipakai); penegakan
 * sebenarnya tetap di gerbang API (`requirePermission` di lib/rbac.ts).
 */
export function useRequirePermission(...required: string[]) {
  const router = useRouter()
  const key = required.join(",")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/admin/me")
        const me = res.ok ? await res.json() : null
        if (!cancelled && !hasPermission(me, ...key.split(","))) router.replace("/admin")
      } catch {
        if (!cancelled) router.replace("/admin")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [key, router])
}
