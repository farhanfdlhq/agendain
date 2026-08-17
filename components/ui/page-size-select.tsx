"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Kontrol "show entries": `Tampilkan [10 ▾] entri`. Satu-satunya kontrol
// page-size di layar (selector bawaan DataGridPagination dinonaktifkan lewat
// prop showSizes={false}). Membuka ke bawah (tanpa side="top") karena diletakkan
// di toolbar atas tabel.
interface PageSizeSelectProps {
  value: number
  onValueChange: (value: number) => void
  sizes?: number[]
  label?: string
  suffix?: string
  disabled?: boolean
  className?: string
}

function PageSizeSelect({
  value,
  onValueChange,
  sizes = [10, 20, 50, 100],
  label = "Tampilkan",
  suffix = "entri",
  disabled = false,
  className,
}: PageSizeSelectProps): React.JSX.Element {
  return (
    <div
      data-slot="page-size-select"
      className={
        "flex items-center gap-2 text-sm text-muted-foreground" +
        (className ? " " + className : "")
      }
    >
      {label && <span>{label}</span>}
      <Select
        value={`${value}`}
        onValueChange={(v) => onValueChange(Number(v))}
        disabled={disabled}
      >
        {/* Tanpa lebar tetap: base SelectTrigger sudah `w-fit` sehingga angka
            2–3 digit (20/50/100) tak terpotong. `min-w-16` hanya menjaga lebar
            stabil agar toolbar tak bergeser saat nilai berubah. */}
        <SelectTrigger size="sm" className="min-w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-16">
          {sizes.map((size) => (
            <SelectItem key={size} value={`${size}`}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {suffix && <span>{suffix}</span>}
    </div>
  )
}

export { PageSizeSelect, type PageSizeSelectProps }
