"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, Users, ArrowUpRight, CheckCircle, Clock } from "lucide-react"

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

export type Inquiry = {
  id: number
  nama: string
  email: string
  noWa: string
  pesan: string
  sudahDibalas: boolean
  createdAt: string
  paket?: { nama: string }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  })
}

export const createTripColumns = (): ColumnDef<PrivateTrip>[] => [
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
      const status = row.original.status
      return (
        <Badge variant={status === 'new' ? 'default' : 'secondary'} className={status === 'new' ? "bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400" : ""}>
          {status === 'new' ? 'Baru' : 'Diproses'}
        </Badge>
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

export const createInquiryColumns = (
  handleMarkAsReplied: (id: number, type: string) => void
): ColumnDef<Inquiry>[] => [
  {
    accessorKey: "nama",
    header: "Pengirim",
    cell: ({ row }) => {
      const inq = row.original
      return (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="font-semibold text-foreground">{inq.nama}</span>
          <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {inq.email}</span>
            {inq.noWa && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {inq.noWa}</span>}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "pesan",
    header: "Pesan / Pertanyaan",
    cell: ({ row }) => {
      const inq = row.original
      return (
        <div className="flex flex-col gap-2 max-w-[300px]">
          {inq.paket && (
            <Badge variant="outline" className="w-fit text-xs bg-muted/50">
              Terkait: {inq.paket.nama}
            </Badge>
          )}
          <p className="text-sm line-clamp-3 text-muted-foreground" title={inq.pesan}>{inq.pesan}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </div>
      )
    },
  },
  {
    accessorKey: "sudahDibalas",
    header: "Status",
    cell: ({ row }) => {
      const sudahDibalas = row.original.sudahDibalas
      return sudahDibalas ? (
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          <CheckCircle className="h-4 w-4" /> Dibalas
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium">
          <Clock className="h-4 w-4" /> Pending
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const inq = row.original
      return (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
          {!inq.sudahDibalas && (
            <Button size="sm" variant="outline" onClick={() => handleMarkAsReplied(inq.id, 'general')} className="gap-1 whitespace-nowrap">
              <CheckCircle className="h-3.5 w-3.5" /> Tandai Selesai
            </Button>
          )}
          {inq.noWa && (
            <Button size="sm" asChild className="gap-1 whitespace-nowrap">
              <a href={`https://wa.me/${inq.noWa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                Balas WA <ArrowUpRight className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      )
    },
  },
]
