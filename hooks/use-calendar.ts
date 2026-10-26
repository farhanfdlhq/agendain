"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { addDays, monthGrid, parseIsoDate, startOfMonth, toIsoDate } from "@/lib/date-picker"

const MOVES: Record<string, [days: number, months: number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [-7, 0],
  ArrowDown: [7, 0],
  PageUp: [0, -1],
  PageDown: [0, 1],
}

/**
 * Otak kalender bersama DatePicker admin (components/ui/date-picker.tsx) dan
 * pemilih tanggal publik (components/PublicDatePicker). Tampilan berbeda —
 * token shadcn vs --color-* situs — tetapi grid, "hari ini", dan navigasi
 * keyboard (roving tabindex) harus sama.
 */
export function useCalendar(value: string, open: boolean) {
  const selected = parseIsoDate(value)
  const [view, setView] = useState(() => startOfMonth(selected ?? new Date()))
  const [focusIso, setFocusIso] = useState<string | null>(null)
  // "Hari ini" dihitung saat panel dibuka (klien), bukan saat render server.
  const [todayIso, setTodayIso] = useState<string | null>(null)
  const dayRefs = useRef(new Map<string, HTMLButtonElement>())

  /** Dipanggil tepat sebelum panel dibuka. */
  const prepare = () => {
    const today = new Date()
    const start = selected ?? today
    setTodayIso(toIsoDate(today))
    setView(startOfMonth(start))
    setFocusIso(toIsoDate(start))
  }

  // Hanya saat panel dibuka atau tanggal digeser dengan keyboard — bukan saat
  // pindah bulan lewat tombol panah (fokus tetap di tombol itu).
  useEffect(() => {
    if (open && focusIso) dayRefs.current.get(focusIso)?.focus()
  }, [open, focusIso])

  const onGridKeyDown = (e: React.KeyboardEvent, iso: string) => {
    const move = MOVES[e.key]
    if (!move) return
    e.preventDefault()
    const base = parseIsoDate(iso)!
    const target = move[1]
      ? new Date(base.getFullYear(), base.getMonth() + move[1], Math.min(base.getDate(), 28))
      : addDays(base, move[0])
    setView(startOfMonth(target))
    setFocusIso(toIsoDate(target))
  }

  const dayRef = useCallback(
    (iso: string) => (el: HTMLButtonElement | null) => {
      if (el) dayRefs.current.set(iso, el)
      else dayRefs.current.delete(iso)
    },
    [],
  )

  const days = monthGrid(view)
  // Satu sel yang bisa dicapai lewat Tab: tanggal fokus bila tampil di bulan
  // ini, selain itu tanggal 1.
  const tabIso =
    focusIso && days.some((d) => toIsoDate(d) === focusIso) ? focusIso : toIsoDate(startOfMonth(view))

  return {
    selected,
    view,
    prevMonth: () => setView((v) => startOfMonth(v, -1)),
    nextMonth: () => setView((v) => startOfMonth(v, 1)),
    todayIso,
    days,
    tabIso,
    prepare,
    onGridKeyDown,
    dayRef,
  }
}
