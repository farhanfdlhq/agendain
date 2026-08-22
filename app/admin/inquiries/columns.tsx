"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Phone, Calendar, Users, ArrowUpRight } from "lucide-react"
import {
  PRIVATE_TRIP_STATUSES,
  PRIVATE_TRIP_STATUS_LABEL,
  normalizePrivateTripStatus,
  type PrivateTripStatus,
} from "@/lib/private-trip-status"

export type PrivateTrip = {
  id: number
  nama: string
  email: string
  noWa: string
  destinasi: string
  tanggal: string
  jumlahPax: number
  budget: string
  status: string
}

// Warna dipilih agar urutan alur terbaca sekilas: biru (masuk) → kuning
// (sedang digarap) → hijau (menang) → abu (selesai/gugur).
const STATUS_STYLE: Record<PrivateTripStatus, string> = {
  new: "text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40",
  contacted: "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40",
  deal: "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40",
  cancelled: "text-muted-foreground border-border bg-muted/40",
}

export const createTripColumns = (
  onStatusChange: (id: number, status: PrivateTripStatus) => void,
  pendingId?: number | null
): ColumnDef<PrivateTrip>[] => [
  {
    // Nomor urut. row.index benar selama tabel tak di-sort (belum ada sorting);
    // bila kelak sorting ditambah, ganti ke nomor berbasis data asli.
    id: "rowNumber",
    header: () => <div className="text-muted-foreground">#</div>,
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.index + 1}</span>,
    size: 48,
    enableResizing: false,
  },
  {
    accessorKey: "nama",
    header: "Pelanggan",
    cell: ({ row }) => {
      const trip = row.original
      return (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="font-semibold text-foreground">{trip.nama}</span>
          <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {trip.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {trip.noWa}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "destinasi",
    header: "Destinasi & Tanggal",
    cell: ({ row }) => {
      const trip = row.original
      return (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="font-semibold text-foreground">{trip.destinasi}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {new Date(trip.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "jumlahPax",
    header: "Detail Pax & Budget",
    cell: ({ row }) => {
      const trip = row.original
      return (
        <div className="flex flex-col gap-1 min-w-[150px]">
          <span className="text-sm font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" /> {trip.jumlahPax} Orang
          </span>
          <span className="text-xs font-mono text-muted-foreground">{trip.budget}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const trip = row.original
      const current = normalizePrivateTripStatus(trip.status)
      return (
        <Select
          value={current}
          onValueChange={(val) => onStatusChange(trip.id, val as PrivateTripStatus)}
          disabled={pendingId === trip.id}
        >
          <SelectTrigger
            size="sm"
            className={`min-w-[120px] font-semibold ${STATUS_STYLE[current]}`}
            aria-label={`Ubah status ${trip.nama}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIVATE_TRIP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {PRIVATE_TRIP_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const trip = row.original
      return (
        <div className="text-right">
          <Button size="sm" asChild className="gap-1">
            <a href={`https://wa.me/${trip.noWa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              Balas WA <ArrowUpRight className="h-3 w-3" />
            </a>
          </Button>
        </div>
      )
    },
  },
]
