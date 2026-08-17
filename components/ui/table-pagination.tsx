"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Paginasi presentational & fully controlled. Melayani dua mode: client-slice
// (data lokal dipotong via useTablePagination) dan server (halaman datang dari
// API). Gaya tombol sengaja meniru components/reui/data-grid/data-grid-pagination.tsx
// agar seragam dengan 3 tabel TanStack. `page` di sini 1-based (bukan pageIndex).
interface TablePaginationProps {
  page: number
  pageCount: number
  total: number
  from: number
  to: number
  onPageChange: (page: number) => void
  moreLimit?: number
  info?: string
  disabled?: boolean
  className?: string
  previousPageLabel?: string
  nextPageLabel?: string
  ellipsisText?: string
}

function TablePagination({
  page,
  pageCount,
  total,
  from,
  to,
  onPageChange,
  moreLimit = 5,
  info = "{from} – {to} dari {count}",
  disabled = false,
  className,
  previousPageLabel = "Halaman sebelumnya",
  nextPageLabel = "Halaman berikutnya",
  ellipsisText = "...",
}: TablePaginationProps): React.JSX.Element {
  const btnBaseClasses = "size-7 p-0 text-sm"
  const btnArrowClasses = btnBaseClasses + " rtl:transform rtl:rotate-180"

  const pageIndex = page - 1

  const paginationInfo = info
    .replace("{from}", `${from}`)
    .replace("{to}", `${to}`)
    .replace("{count}", `${total}`)

  // Algoritma grup basis-0 (identik DataGridPagination): satu grup memuat
  // `moreLimit` nomor halaman, elipsis melompat ke grup sebelah.
  const currentGroupStart = Math.floor(pageIndex / moreLimit) * moreLimit
  const currentGroupEnd = Math.min(currentGroupStart + moreLimit, pageCount)

  const goTo = (target: number) => {
    if (disabled) return
    if (target < 1 || target > pageCount) return
    if (target === page) return
    onPageChange(target)
  }

  const renderPageButtons = () => {
    const buttons = []
    for (let i = currentGroupStart; i < currentGroupEnd; i++) {
      buttons.push(
        <Button
          key={i}
          size="icon-sm"
          variant="ghost"
          disabled={disabled}
          className={cn(btnBaseClasses, "text-muted-foreground", {
            "bg-accent text-accent-foreground": pageIndex === i,
          })}
          onClick={() => goTo(i + 1)}
        >
          {i + 1}
        </Button>
      )
    }
    return buttons
  }

  const renderEllipsisPrevButton = () => {
    if (currentGroupStart > 0) {
      return (
        <Button
          size="icon-sm"
          className={btnBaseClasses}
          variant="ghost"
          disabled={disabled}
          onClick={() => goTo(currentGroupStart)}
        >
          {ellipsisText}
        </Button>
      )
    }
    return null
  }

  const renderEllipsisNextButton = () => {
    if (currentGroupEnd < pageCount) {
      return (
        <Button
          className={btnBaseClasses}
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={() => goTo(currentGroupEnd + 1)}
        >
          {ellipsisText}
        </Button>
      )
    }
    return null
  }

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        "flex flex-col flex-wrap items-center justify-between gap-2.5 sm:flex-row",
        className
      )}
    >
      <div className="text-muted-foreground text-sm order-2 text-nowrap sm:order-1">
        {paginationInfo}
      </div>
      {pageCount > 1 && (
        <div className="order-1 flex items-center space-x-1 sm:order-2">
          <Button
            size="icon-sm"
            variant="ghost"
            className={btnArrowClasses}
            onClick={() => goTo(page - 1)}
            disabled={disabled || page <= 1}
          >
            <span className="sr-only">{previousPageLabel}</span>
            <ChevronLeftIcon className="size-4" />
          </Button>

          {renderEllipsisPrevButton()}
          {renderPageButtons()}
          {renderEllipsisNextButton()}

          <Button
            size="icon-sm"
            variant="ghost"
            className={btnArrowClasses}
            onClick={() => goTo(page + 1)}
            disabled={disabled || page >= pageCount}
          >
            <span className="sr-only">{nextPageLabel}</span>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export { TablePagination, type TablePaginationProps }
