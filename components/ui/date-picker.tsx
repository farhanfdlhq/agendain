"use client"

import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { isOutOfRange, toIsoDate } from "@/lib/date-picker"
import { useCalendar } from "@/hooks/use-calendar"

type DatePickerProps = {
  id?: string
  name?: string
  /** "YYYY-MM-DD" atau "" — sama dengan nilai <input type="date">. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Batas bawah/atas, "YYYY-MM-DD". */
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
}

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
const fmtLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" })
const fmtMonth = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
const fmtFull = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

/**
 * Pengganti <input type="date"> bawaan browser di panel admin: tampilannya
 * beda tiap browser dan tak bisa di-styling. Nilai tetap "YYYY-MM-DD", jadi
 * form dan API tidak berubah. Pola sama dengan MonthPicker (form Private Trip).
 */
export function DatePicker({
  id,
  name,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  min,
  max,
  required,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const cal = useCalendar(value, open)
  const { selected, view, days, tabIso, todayIso } = cal
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const handleOpenChange = (next: boolean) => {
    if (next) cal.prepare()
    setOpen(next)
  }

  const pick = (iso: string) => {
    onChange(iso)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const todayAllowed = !!todayIso && !isOutOfRange(todayIso, min, max)

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-haspopup="dialog"
            className={cn(
              "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
              className,
            )}
          >
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? fmtLabel.format(selected) : placeholder}
            </span>
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Bulan sebelumnya"
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              onClick={cal.prevMonth}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold capitalize" aria-live="polite">
              {fmtMonth.format(view)}
            </span>
            <button
              type="button"
              aria-label="Bulan berikutnya"
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              onClick={cal.nextMonth}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div role="grid" aria-label={fmtMonth.format(view)} className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) => (
              <span key={d} role="columnheader" className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">
                {d}
              </span>
            ))}
            {days.map((day) => {
              const iso = toIsoDate(day)
              const inMonth = day.getMonth() === view.getMonth()
              const isSelected = iso === value
              const isToday = iso === todayIso
              const blocked = isOutOfRange(iso, min, max)
              return (
                <button
                  key={iso}
                  ref={cal.dayRef(iso)}
                  type="button"
                  role="gridcell"
                  tabIndex={iso === tabIso ? 0 : -1}
                  disabled={blocked}
                  aria-selected={isSelected}
                  aria-label={fmtFull.format(day)}
                  onClick={() => pick(iso)}
                  onKeyDown={(e) => cal.onGridKeyDown(e, iso)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30",
                    inMonth ? "text-foreground" : "text-muted-foreground/60",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted",
                    isToday && !isSelected && "font-semibold ring-1 ring-inset ring-primary/40",
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t pt-2">
            <button
              type="button"
              disabled={!todayAllowed}
              className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-muted disabled:opacity-40"
              onClick={() => todayIso && pick(todayIso)}
            >
              Hari ini
            </button>
            {!required && value && (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => pick("")}
              >
                Hapus
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Input tersembunyi menjaga validasi `required` bawaan form; gelembung
          peringatannya muncul di atas tombol karena posisinya ditumpuk. */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          name={name}
          value={value}
          required
          onChange={() => {}}
          onFocus={() => triggerRef.current?.focus()}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        />
      )}
    </div>
  )
}
