"use client"

import { useMemo, useState } from "react"

// Hook paginasi client-slice untuk tabel non-TanStack (destinasi/open-trip/
// users/roles). `items` HARUS array yang sudah terfilter (hasil search/filter),
// bukan data mentah — kalau tidak, nomor & total ikut salah. Halaman aktif
// di-clamp saat render bila list menyusut (filter/hapus baris), dan direset ke
// 1 saat pageSize diganti.
export interface UseTablePaginationResult<T> {
  page: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
  pageCount: number
  total: number
  from: number
  to: number
  startIndex: number
  pageItems: T[]
}

export function useTablePagination<T>(
  items: T[],
  initialPageSize = 10
): UseTablePaginationResult<T> {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // Clamp saat render: bila list menyusut (filter mempersempit hasil / baris
  // dihapus), halaman aktif bisa keluar rentang. Turunkan langsung tanpa efek
  // agar tak ada render basi maupun setState-dalam-efek.
  const safePage = Math.min(page, pageCount)

  const setPageSize = (size: number) => {
    setPageSizeState(size)
    setPage(1)
  }

  const startIndex = (safePage - 1) * pageSize
  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize]
  )

  const from = total === 0 ? 0 : startIndex + 1
  const to = Math.min(startIndex + pageSize, total)

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    total,
    from,
    to,
    startIndex,
    pageItems,
  }
}
