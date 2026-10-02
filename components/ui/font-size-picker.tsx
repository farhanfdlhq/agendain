"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Check, ChevronDown, Ruler } from "lucide-react"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FontWeightPicker } from "@/components/ui/font-weight-picker"

export interface FontSizePickerProps {
  value: string | number | undefined
  onChange: (size: string) => void
  label?: string
  placeholder?: string
}

// Preset px di daftar dropdown. Nilai lain tetap bisa diketik langsung.
export const FONT_SIZE_PRESETS = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96]

const MIN = 8
const MAX = 200
const clamp = (n: number) => Math.min(MAX, Math.max(MIN, Math.round(n)))

/**
 * Kontrol ukuran font ala Figma: kolom angka yang bisa diketik + tombol ▾
 * berisi daftar preset. ↑/↓ menaikkan/menurunkan 1 (Shift = 10), Enter
 * menyimpan, kosong = ukuran default desain.
 */
export function FontSizePicker({
  value,
  onChange,
  label = "Ukuran Font (Font Size)",
  placeholder = "Auto",
}: FontSizePickerProps) {
  const current = value === undefined || value === null ? "" : String(value)
  const [draft, setDraft] = React.useState(current)
  const [open, setOpen] = React.useState(false)
  const inputId = React.useId()
  const listId = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sinkron bila nilai berubah dari luar (mis. ganti tab ID/EN) — disesuaikan
  // saat render (pola "state dari props sebelumnya"), bukan lewat useEffect.
  const [prevCurrent, setPrevCurrent] = React.useState(current)
  if (prevCurrent !== current) {
    setPrevCurrent(current)
    setDraft(current)
  }

  const commit = (raw: string) => {
    const trimmed = raw.trim()
    if (trimmed === "") {
      setDraft("")
      onChange("")
      return
    }
    const n = Number(trimmed)
    if (!Number.isFinite(n)) {
      setDraft(current)
      return
    }
    const next = String(clamp(n))
    setDraft(next)
    onChange(next)
  }

  const step = (delta: number) => {
    const base = Number(draft) || Number(current) || 16
    commit(String(base + delta))
  }

  const pick = (v: string) => {
    commit(v)
    setOpen(false)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label htmlFor={inputId} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Ruler className="h-3.5 w-3.5 text-primary" />
          <span>{label}</span>
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="group flex h-9 w-full items-stretch overflow-hidden rounded-md border border-input bg-background shadow-xs transition-colors hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-ring">
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="none"
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
              onBlur={() => commit(draft)}
              onFocus={(e) => e.currentTarget.select()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  commit(draft)
                  setOpen(false)
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  step(e.shiftKey ? 10 : 1)
                } else if (e.key === "ArrowDown") {
                  e.preventDefault()
                  step(e.shiftKey ? -10 : -1)
                } else if (e.key === "Escape") {
                  setDraft(current)
                  setOpen(false)
                }
              }}
              // Inline: menang atas aturan global `input:focus-visible` (bayangan merah
              // 3px) yang terpotong jadi garis di samping "px". Fokus sudah
              // ditandai oleh kotak luar (focus-within).
              style={{ boxShadow: "none", outline: "none", border: "none" }}
              className="min-w-0 flex-1 bg-transparent pl-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground"
            />
            <span className="pointer-events-none flex items-center pr-2 text-xs text-muted-foreground">px</span>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Pilih ukuran font"
                style={{ boxShadow: "none", outline: "none" }}
                className="flex w-8 shrink-0 items-center justify-center border-l border-input text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary [&[data-state=open]>svg]:rotate-180"
              >
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-(--radix-popover-trigger-width) min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-lg"
        >
          <ul id={listId} role="listbox" aria-label="Ukuran font" className="max-h-72 overflow-y-auto p-1 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
            {[{ v: "", text: "Auto (default desain)" }, ...FONT_SIZE_PRESETS.map((s) => ({ v: String(s), text: String(s) }))].map(
              ({ v, text }) => {
                const selected = current === v
                return (
                  <li key={v || "auto"} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => pick(v)}
                      style={{ boxShadow: "none", outline: "none" }}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm tabular-nums transition-colors hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary ${selected ? "font-semibold text-primary" : ""}`}
                    >
                      <Check className={`h-3.5 w-3.5 shrink-0 ${selected ? "opacity-100" : "opacity-0"}`} />
                      {text}
                    </button>
                  </li>
                )
              },
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export interface FontControlsProps {
  weightValue: string | number | undefined
  onWeightChange: (weight: string) => void
  sizeValue: string | number | undefined
  onSizeChange: (size: string) => void
  defaultWeight?: string
}

/** Font Weight + Font Size bersebelahan (satu baris di layar lebar). */
export function FontControls({
  weightValue,
  onWeightChange,
  sizeValue,
  onSizeChange,
  defaultWeight = "400",
}: FontControlsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FontWeightPicker value={weightValue} onChange={onWeightChange} defaultWeight={defaultWeight} />
      <FontSizePicker value={sizeValue} onChange={onSizeChange} />
    </div>
  )
}
