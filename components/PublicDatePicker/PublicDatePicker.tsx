"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { isOutOfRange, toIsoDate } from "@/lib/date-picker"
import { useCalendar } from "@/hooks/use-calendar"
import styles from "./PublicDatePicker.module.css"

type PublicDatePickerProps = {
  id: string
  name: string
  /** "YYYY-MM-DD" atau "" — sama dengan nilai <input type="date"> sebelumnya. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Tanggal sebelum hari ini dinonaktifkan (rencana keberangkatan). */
  disablePast?: boolean
  className?: string
  required?: boolean
  disabled?: boolean
}

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
const fmtLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" })
const fmtMonth = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
const fmtFull = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

/**
 * Pengganti <input type="date"> di halaman publik (form booking). Logika
 * kalender sama dengan DatePicker admin (hooks/use-calendar.ts); tampilannya
 * mengikuti MonthPicker form Private Trip.
 */
export default function PublicDatePicker({
  id,
  name,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disablePast,
  className,
  required,
  disabled,
}: PublicDatePickerProps) {
  const [open, setOpen] = useState(false)
  const cal = useCalendar(value, open)
  const { selected, view, days, tabIso, todayIso } = cal
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const min = disablePast && todayIso ? todayIso : undefined

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        className={`${className ?? ""} ${styles.trigger}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) return close(false)
          cal.prepare()
          setOpen(true)
        }}
      >
        <span className={selected ? styles.value : styles.placeholder}>
          {selected ? fmtLabel.format(selected) : placeholder}
        </span>
        <CalendarDays size={18} strokeWidth={1.75} className={styles.icon} aria-hidden />
      </button>

      {/* Input tersembunyi menjaga validasi `required` bawaan form. */}
      <input
        className={styles.proxy}
        name={name}
        value={value}
        required={required}
        tabIndex={-1}
        aria-hidden
        onChange={() => {}}
        onFocus={() => triggerRef.current?.focus()}
      />

      {open && (
        <div className={styles.panel} role="dialog" aria-label={placeholder}>
          <div className={styles.header}>
            <button type="button" className={styles.nav} aria-label="Bulan sebelumnya" onClick={cal.prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <span className={styles.month} aria-live="polite">
              {fmtMonth.format(view)}
            </span>
            <button type="button" className={styles.nav} aria-label="Bulan berikutnya" onClick={cal.nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div role="grid" aria-label={fmtMonth.format(view)} className={styles.grid}>
            {WEEKDAYS.map((d) => (
              <span key={d} role="columnheader" className={styles.weekday}>
                {d}
              </span>
            ))}
            {days.map((day) => {
              const iso = toIsoDate(day)
              const isSelected = iso === value
              return (
                <button
                  key={iso}
                  ref={cal.dayRef(iso)}
                  type="button"
                  role="gridcell"
                  tabIndex={iso === tabIso ? 0 : -1}
                  disabled={isOutOfRange(iso, min)}
                  aria-selected={isSelected}
                  aria-label={fmtFull.format(day)}
                  onClick={() => {
                    onChange(iso)
                    close()
                  }}
                  onKeyDown={(e) => cal.onGridKeyDown(e, iso)}
                  className={[
                    styles.day,
                    day.getMonth() !== view.getMonth() && styles.outside,
                    iso === todayIso && !isSelected && styles.today,
                    isSelected && styles.selected,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
