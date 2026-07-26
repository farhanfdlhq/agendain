"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Type } from "lucide-react"

export interface FontWeightPickerProps {
  value: string | number | undefined
  onChange: (weight: string) => void
  label?: string
  defaultWeight?: string
}

export const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Thin / Light (300)", weight: 300 },
  { value: "400", label: "Regular / Normal (400) - Default", weight: 400 },
  { value: "500", label: "Medium (500)", weight: 500 },
  { value: "600", label: "Semi Bold (600)", weight: 600 },
  { value: "700", label: "Bold (700)", weight: 700 },
  { value: "800", label: "Extra Bold (800)", weight: 800 },
  { value: "900", label: "Black / Heavy (900)", weight: 900 },
]

export function FontWeightPicker({
  value,
  onChange,
  label = "Ketebalan Font (Font Weight)",
  defaultWeight = "400",
}: FontWeightPickerProps) {
  const currentVal = value ? String(value) : defaultWeight

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Type className="h-3.5 w-3.5 text-primary" />
          <span>{label}</span>
        </Label>
      )}
      <select
        value={currentVal}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors hover:border-primary focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-foreground"
        style={{ fontWeight: Number(currentVal) || 400 }}
      >
        {FONT_WEIGHT_OPTIONS.map((opt) => (
          <option 
            key={opt.value} 
            value={opt.value} 
            style={{ fontWeight: opt.weight }} 
            className="py-1.5 bg-background text-foreground"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
