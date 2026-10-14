"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type NumberStepperProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange" | "step"> & {
  value: string | number | undefined
  onValueChange: (value: string) => void
  min?: number
  max?: number
  /** Atribut `step` input (validasi ketikan), mis. 0.01 atau "any" untuk desimal bebas. */
  step?: number | "any"
  /** Lompatan tombol − / +. Default = `step` (atau 1 bila step "any"). */
  buttonStep?: number
  /**
   * "admin" memakai token shadcn (hanya ada di admin.css). "public" memakai
   * --color-* dari tokens.css; bingkai (border, radius, latar, fokus) diberikan
   * lewat `className` dari CSS module form agar serasi dengan input lain di sana.
   */
  variant?: "admin" | "public"
  decrementLabel?: string
  incrementLabel?: string
}

const decimalsOf = (n: number) => (String(n).split(".")[1] ?? "").length

/**
 * Input angka dengan tombol − / + menyatu (pengganti spinner bawaan browser
 * yang kecil & berbeda tiap browser). Tetap bisa diketik dan dipakai dengan
 * panah atas/bawah keyboard. Nilai dikirim sebagai string, sama seperti input biasa.
 */
function NumberStepper({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  buttonStep,
  variant = "admin",
  decrementLabel = "Kurangi",
  incrementLabel = "Tambah",
  className,
  disabled,
  ...props
}: NumberStepperProps) {
  const current = value === undefined || value === "" ? NaN : Number(value)
  const jump = buttonStep ?? (step === "any" ? 1 : step)
  const isDecimal = step === "any" || !Number.isInteger(step) || !Number.isInteger(jump)

  const nudge = (dir: 1 | -1) => {
    // Kolom kosong dihitung dari 0 lalu dijepit ke min (min 2 → "+" langsung 2).
    let next = (Number.isFinite(current) ? current : 0) + dir * jump
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    // Buang sisa floating point (0.1 + 0.2) tanpa memotong desimal yang diketik.
    const places = Math.max(decimalsOf(jump), Number.isFinite(current) ? decimalsOf(current) : 0)
    onValueChange(String(Number(next.toFixed(places))))
  }

  // Nonaktif bila satu lompatan penuh melewati batas: Qty 1 (min 0,01) tidak
  // diturunkan ke 0,01 lewat tombol; nilai pecahan tetap bisa diketik.
  const EPS = 1e-9
  const atMin = min !== undefined && Number.isFinite(current) && current - jump < min - EPS
  const atMax = max !== undefined && Number.isFinite(current) && current + jump > max + EPS

  const isPublic = variant === "public"

  const btn = cn(
    "grid shrink-0 place-items-center font-bold leading-none select-none cursor-pointer transition-[background-color,color,transform] duration-150 active:scale-90",
    isPublic
      ? "size-9 rounded-[6px] text-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] disabled:pointer-events-none disabled:opacity-35"
      : "size-7 rounded-[5px] text-base bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground/50"
  )

  return (
    <div
      data-slot="number-stepper"
      className={cn(
        "flex w-full items-center gap-1",
        !isPublic && [
          "h-9 rounded-md border border-input bg-transparent p-1 shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          "has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20",
        ],
        disabled && "opacity-50",
        className
      )}
    >
      <button type="button" tabIndex={-1} aria-label={decrementLabel} className={btn} disabled={disabled || atMin} onClick={() => nudge(-1)}>
        −
      </button>
      <input
        type="number"
        inputMode={isDecimal ? "decimal" : "numeric"}
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-2 text-center text-base font-semibold tabular-nums outline-none placeholder:font-normal",
          isPublic
            ? "text-[var(--color-ink)] placeholder:text-[var(--color-muted)] disabled:cursor-not-allowed"
            : "md:text-sm placeholder:text-muted-foreground",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
        {...props}
      />
      <button type="button" tabIndex={-1} aria-label={incrementLabel} className={btn} disabled={disabled || atMax} onClick={() => nudge(1)}>
        +
      </button>
    </div>
  )
}

export { NumberStepper }
