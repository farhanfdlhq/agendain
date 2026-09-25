"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Ruler } from "lucide-react"
import { FontWeightPicker } from "@/components/ui/font-weight-picker"

export interface FontSizePickerProps {
  value: string | number | undefined
  onChange: (size: string) => void
  label?: string
  placeholder?: string
}

// Preset px umum untuk datalist — user tetap bebas mengetik nilai lain.
export const FONT_SIZE_PRESETS = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]

export function FontSizePicker({
  value,
  onChange,
  label = "Ukuran Font (Font Size)",
  placeholder = "auto",
}: FontSizePickerProps) {
  const listId = React.useId()
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Ruler className="h-3.5 w-3.5 text-primary" />
          <span>{label}</span>
        </Label>
      )}
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          min={8}
          max={200}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          list={listId}
          placeholder={placeholder}
          className="flex h-9 w-full items-center rounded-md border border-input bg-background pl-3 pr-9 py-1 text-sm shadow-xs transition-colors hover:border-primary focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          px
        </span>
        <datalist id={listId}>
          {FONT_SIZE_PRESETS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
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
