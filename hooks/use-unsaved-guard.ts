"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/components/Providers/ConfirmProvider"

const PESAN = {
  title: "Perubahan belum disimpan",
  message:
    "Ada perubahan pada halaman ini yang belum Anda simpan. Kalau meninggalkan halaman sekarang, perubahan itu akan hilang.",
  confirmText: "Tinggalkan halaman",
  cancelText: "Tetap di sini",
}

/**
 * Cegah kehilangan isian yang belum disimpan.
 *
 * Selama `isDirty` true, hook ini memasang dua penjaga:
 *  1. `beforeunload` — refresh, tutup tab, atau ketik URL baru memunculkan
 *     dialog bawaan browser.
 *  2. Cegat klik pada tautan internal mana pun (menu sidebar, tautan "Profil"
 *     di dalam form, tombol Kembali) — navigasi ditahan dulu, lalu dialog
 *     konfirmasi in-app (useConfirm) muncul; pindah hanya bila disetujui.
 *
 * Anchor di dalam area contenteditable (mis. tautan di dalam editor TipTap),
 * yang membuka tab baru (`target=_blank`), unduhan, dan tautan eksternal
 * sengaja DILEWATI — yang eksternal tetap dijaga `beforeunload`.
 */
export function useUnsavedGuard(isDirty: boolean) {
  const router = useRouter()
  const { confirm } = useConfirm()

  // isDirty disimpan di ref supaya listener tidak perlu dipasang ulang tiap
  // ketikan — cukup dipasang sekali, membaca nilai terbaru saat dipicu.
  const dirtyRef = useRef(isDirty)
  dirtyRef.current = isDirty

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || e.defaultPrevented) return
      // Klik kiri polos saja; klik dengan modifier = buka tab/jendela baru.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const a = (e.target as HTMLElement | null)?.closest?.("a")
      if (!a) return

      const href = a.getAttribute("href")
      if (!href || href.startsWith("#")) return
      if (a.target && a.target !== "_self") return
      if (a.hasAttribute("download")) return

      // Tautan di dalam editor (contenteditable) bukan navigasi — biarkan.
      const ce = a.closest("[contenteditable]")
      if (ce && ce.getAttribute("contenteditable") !== "false") return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return // eksternal → dijaga beforeunload
      // Tautan ke halaman yang sama persis: bukan meninggalkan halaman.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      // Tahan navigasi <Link>/anchor (capture mendahului handler React), lalu tanya.
      e.preventDefault()
      e.stopPropagation()
      const tujuan = url.pathname + url.search + url.hash
      void confirm(PESAN).then((ok) => {
        if (ok) router.push(tujuan)
      })
    }

    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [confirm, router])
}
