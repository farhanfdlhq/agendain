"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type NumberStepperProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: string | number | undefined
  onValueChange: (value: string) => void
  min?: number
  max?: number
  step?: number
}

/**
 * Input angka dengan tombol − / + menyatu (pengganti spinner bawaan browser
 * yang kecil & berbeda tiap browser). Tetap bisa diketik dan dipakai dengan
 * panah atas/bawah keyboard. Nilai dikirim sebagai string, sama seperti input biasa.
 */
function NumberStepper({ value, onValueChange, min, max, step = 1, className, disabled, ...props }: NumberStepperProps) {
  const current = value === undefined || value === "" ? NaN : Number(value)

  const nudge = (dir: 1 | -1) => {
    const base = Number.isFinite(current) ? current : (min ?? 0)
    let next = base + dir * step
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    onValueChange(String(next))
  }

  const atMin = min !== undefined && Number.isFinite(current) && current <= min
  const atMax = max !== undefined && Number.isFinite(current) && current >= max

  const btn =
    "grid size-7 shrink-0 place-items-center rounded-[5px] bg-primary/10 text-base font-bold leading-none text-primary select-none cursor-pointer " +
    "transition-[background-color,color,transform] duration-150 hover:bg-primary hover:text-white active:scale-90 " +
    "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground/50"

  return (
    <div
      data-slot="number-stepper"
      className={cn(
        "flex h-9 w-full items-center gap-1 rounded-md border border-input bg-transparent p-1 shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        disabled && "opacity-50",
        className
      )}
    >
      <button type="button" tabIndex={-1} aria-label="Kurangi" className={btn} disabled={disabled || atMin} onClick={() => nudge(-1)}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-2 text-center text-base font-semibold tabular-nums outline-none md:text-sm placeholder:font-normal placeholder:text-muted-foreground",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
        {...props}
      />
      <button type="button" tabIndex={-1} aria-label="Tambah" className={btn} disabled={disabled || atMax} onClick={() => nudge(1)}>
        +
      </button>
    </div>
  )
}

export { NumberStepper }
