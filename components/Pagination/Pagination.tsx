"use client"

import Link from "next/link"
import type { ReactNode } from "react"
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
 *
 * Dua mode: `onPageChange` (tombol, state klien — mis. Tentang) atau `hrefFor`
 * (tautan <a> ber-URL — bisa dirayapi mesin pencari & dibuka di tab baru,
 * mis. daftar Blog yang dipaginasi server).
 */
export default function Pagination({
  page,
  pageCount,
  onPageChange,
  hrefFor,
  label = "Navigasi halaman",
  prevLabel = "Halaman sebelumnya",
  nextLabel = "Halaman berikutnya",
}: {
  page: number
  pageCount: number
  onPageChange?: (page: number) => void
  hrefFor?: (page: number) => string
  label?: string
  prevLabel?: string
  nextLabel?: string
}) {
  if (pageCount <= 1) return null

  const item = (target: number, className: string, content: ReactNode, extra: Record<string, string | undefined>) =>
    hrefFor ? (
      <Link key={`${className}-${target}`} href={hrefFor(target)} className={className} {...extra}>
        {content}
      </Link>
    ) : (
      <button key={`${className}-${target}`} type="button" className={className} onClick={() => onPageChange?.(target)} {...extra}>
        {content}
      </button>
    )

  return (
    <nav className={styles.pagination} aria-label={label}>
      {page > 1 && item(page - 1, styles.step, "‹", { "aria-label": prevLabel, rel: hrefFor ? "prev" : undefined })}
      {pageList(page, pageCount).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">…</span>
        ) : (
          item(p, `${styles.page} ${p === page ? styles.active : ""}`, p, {
            "aria-current": p === page ? "page" : undefined,
            "aria-label": `Halaman ${p}`,
          })
        ),
      )}
      {page < pageCount && item(page + 1, styles.step, "›", { "aria-label": nextLabel, rel: hrefFor ? "next" : undefined })}
    </nav>
  )
}
