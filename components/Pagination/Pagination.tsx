"use client"

import styles from "./Pagination.module.css"

/** 1 … 4 5 6 … 12 — selalu tampilkan halaman pertama, terakhir, dan tetangga halaman aktif. */
export function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  const out: (number | "gap")[] = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("gap")
    out.push(p)
  })
  return out
}

/**
 * Pagination bulat untuk halaman publik (token brand --color-*).
 * Tidak dirender bila hanya ada satu halaman.
 */
export default function Pagination({
  page,
  pageCount,
  onPageChange,
  label = "Navigasi halaman",
  prevLabel = "Halaman sebelumnya",
  nextLabel = "Halaman berikutnya",
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  label?: string
  prevLabel?: string
  nextLabel?: string
}) {
  if (pageCount <= 1) return null

  return (
    <nav className={styles.pagination} aria-label={label}>
      {page > 1 && (
        <button type="button" className={styles.step} onClick={() => onPageChange(page - 1)} aria-label={prevLabel}>
          ‹
        </button>
      )}
      {pageList(page, pageCount).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`${styles.page} ${p === page ? styles.active : ""}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Halaman ${p}`}
          >
            {p}
          </button>
        ),
      )}
      {page < pageCount && (
        <button type="button" className={styles.step} onClick={() => onPageChange(page + 1)} aria-label={nextLabel}>
          ›
        </button>
      )}
    </nav>
  )
}
