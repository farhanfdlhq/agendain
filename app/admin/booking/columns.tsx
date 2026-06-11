"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Trash2, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

export type Booking = {
  id: number
  nama: string
  email: string
  noWa: string
  tanggal: string
  jumlahPax: number
  total: number
  status: string
  paket?: { nama: string }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const formatPrice = (price: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(price) || 0)
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'paid': return "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
    case 'cancelled': return "text-destructive bg-destructive/10 border-destructive/20"
    default: return "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
  }
}

export const createColumns = (
  handleStatusChange: (id: number, status: string) => void,
  handleDelete: (id: number) => void,
  handleViewDetails: (booking: Booking) => void
): ColumnDef<Booking>[] => [
  {
    accessorKey: "nama",
    header: "Pelanggan",
    cell: ({ row }) => {
      const b = row.original
      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">{b.nama}</span>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{b.email}</span>
            {b.noWa && (
              <>
                <span>&bull;</span>
                <a 
                  href={`https://wa.me/${b.noWa.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  WA
                </a>
              </>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "paket",
    header: "Paket",
    cell: ({ row }) => {
      const paketNama = row.original.paket?.nama || "Paket Dihapus"
      return (
        <Badge variant="secondary" className="font-normal bg-muted hover:bg-muted whitespace-nowrap">
          {paketNama}
        </Badge>
      )
    },
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal Trip",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
        <CalendarDays className="h-3.5 w-3.5 opacity-70" />
        {formatDate(row.original.tanggal)}
      </div>
    ),
  },
  {
    accessorKey: "jumlahPax",
    header: "Pax",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.jumlahPax} pax</span>,
  },
  {
    accessorKey: "total",
    header: "Total Tagihan",
    cell: ({ row }) => (
      <span className="font-medium text-foreground whitespace-nowrap">
        {formatPrice(row.original.total)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const b = row.original
      return (
        <Select 
          value={b.status} 
          onValueChange={(val) => handleStatusChange(b.id, val)}
        >
          <SelectTrigger className={`h-8 border-none font-medium ${getStatusColor(b.status)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Lunas</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const b = row.original
      return (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => handleViewDetails(b)}
            title="Lihat Detail"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:border-transparent"
            onClick={() => handleDelete(b.id)}
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
