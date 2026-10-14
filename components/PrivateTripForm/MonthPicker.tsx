"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./MonthPicker.module.css";

type MonthPickerProps = {
  id: string;
  name: string;
  /** Format "YYYY-MM" — sama dengan nilai <input type="month"> sebelumnya. */
  value: string;
  onChange: (value: string) => void;
  locale: "id" | "en";
  placeholder: string;
  prevYearLabel: string;
  nextYearLabel: string;
  className?: string;
  required?: boolean;
  /** Berapa tahun ke depan yang bisa dipilih. */
  yearsAhead?: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pengganti <input type="month"> bawaan browser (tampilannya beda tiap browser
 * dan tak bisa di-styling). Bulan yang sudah lewat dinonaktifkan karena ini
 * rencana keberangkatan.
 */
export default function MonthPicker({
  id,
  name,
  value,
  onChange,
  locale,
  placeholder,
  prevYearLabel,
  nextYearLabel,
  className,
  required,
  yearsAhead = 3,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const intl = locale === "en" ? "en-US" : "id-ID";
  const [selYear, selMonth] = value ? value.split("-").map(Number) : [NaN, NaN];
  const [viewYear, setViewYear] = useState<number>(() =>
    Number.isFinite(selYear) ? selYear : new Date().getFullYear(),
  );

  // "Hari ini" dihitung saat panel dibuka (hanya di klien), bukan saat render server.
  const [today, setToday] = useState<{ y: number; m: number } | null>(null);

  const label = value
    ? new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(
        new Date(selYear, selMonth - 1, 1),
      )
    : "";

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(intl, { month: "short" }).format(new Date(2000, i, 1)),
  );

  const openPanel = () => {
    const now = new Date();
    setToday({ y: now.getFullYear(), m: now.getMonth() + 1 });
    setViewYear(Number.isFinite(selYear) ? selYear : now.getFullYear());
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const minYear = today?.y ?? new Date().getFullYear();
  const maxYear = minYear + yearsAhead;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`${className ?? ""} ${styles.trigger}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openPanel())}
      >
        <span className={value ? styles.value : styles.placeholder}>
          {value ? label : placeholder}
        </span>
        <CalendarDays size={18} strokeWidth={1.75} className={styles.icon} aria-hidden />
      </button>

      {/* Input tersembunyi menjaga validasi `required` bawaan form; gelembung
          peringatannya muncul tepat di atas tombol karena posisinya ditumpuk. */}
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
            <button
              type="button"
              className={styles.nav}
              aria-label={prevYearLabel}
              disabled={viewYear <= minYear}
              onClick={() => setViewYear((y) => y - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span className={styles.year} aria-live="polite">
              {viewYear}
            </span>
            <button
              type="button"
              className={styles.nav}
              aria-label={nextYearLabel}
              disabled={viewYear >= maxYear}
              onClick={() => setViewYear((y) => y + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className={styles.grid}>
            {monthNames.map((m, i) => {
              const month = i + 1;
              const past = !!today && (viewYear < today.y || (viewYear === today.y && month < today.m));
              const selected = viewYear === selYear && month === selMonth;
              const isNow = !!today && viewYear === today.y && month === today.m;
              return (
                <button
                  key={m}
                  type="button"
                  className={[
                    styles.month,
                    selected && styles.selected,
                    isNow && !selected && styles.now,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={past}
                  aria-pressed={selected}
                  autoFocus={selected || (!value && isNow)}
                  onClick={() => {
                    onChange(`${viewYear}-${pad(month)}`);
                    close();
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
