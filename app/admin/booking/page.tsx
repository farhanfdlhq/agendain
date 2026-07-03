"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Eye, PackageX, RefreshCw, AlertCircle, CalendarDays, ExternalLink } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DataGrid, DataGridContainer } from "@/components/reui/data-grid/data-grid"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { createColumns, Booking } from "./columns"
import AirplaneLoader from "@/components/ui/airplane-loader"

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    fetchBookings()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/booking")
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        setError("Gagal memuat data dari server.")
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error)
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success("Status berhasil diperbarui")
        fetchBookings()
      } else {
        toast.error("Gagal memperbarui status")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan sistem")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pemesanan ini?")) return;
    
    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        toast.success("Pemesanan berhasil dihapus")
        fetchBookings()
      } else {
        toast.error("Gagal menghapus pemesanan")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan pada server")
    }
  }

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(price))
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    })
  }

  const filteredBookings = bookings.filter((b: any) => {
    const matchesSearch = b.nama.toLowerCase().includes(search.toLowerCase()) || 
                          b.email.toLowerCase().includes(search.toLowerCase()) ||
                          (b.paket?.nama || "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || b.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const columns = createColumns(handleStatusChange, handleDelete, setSelectedBooking)

  const table = useReactTable({
    data: filteredBookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const renderState = () => {
    if (isOffline) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 h-64">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-medium">Anda Sedang Offline</h3>
          <p className="text-sm text-muted-foreground">Koneksi internet terputus. Silakan periksa jaringan Anda lalu coba lagi.</p>
          <Button onClick={fetchBookings} variant="outline" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Coba Ulang
          </Button>
        </div>
      )
    }
    
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-64 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium">Terjadi Kesalahan</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={fetchBookings} variant="outline" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (loading) {
      return (
        <div className="flex h-64 w-full items-center justify-center">
          <AirplaneLoader className="h-8 w-8  text-primary" />
          <span className="ml-2 text-muted-foreground">Memuat data...</span>
        </div>
      )
    }

    if (filteredBookings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <PackageX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Tidak Ada Pesanan Ditemukan</h3>
          <p className="text-sm text-muted-foreground">Belum ada riwayat booking atau pesanan yang dicari tidak ada.</p>
        </div>
      )
    }

    return (
      <DataGrid table={table} recordCount={filteredBookings.length}>
        <DataGridContainer border={false}>
          <DataGridTable />
          <div className="p-4 border-t">
            <DataGridPagination />
          </div>
        </DataGridContainer>
      </DataGrid>
    )
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
      case 'cancelled': return "text-destructive bg-destructive/10 border-destructive/20"
      default: return "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Manajemen Booking</h2>
          <p className="text-muted-foreground text-sm">Kelola daftar pemesanan dari pelanggan.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Cari nama, email, atau paket..." 
              className="pl-9 rounded-full bg-white dark:bg-zinc-900 border-zinc-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-full bg-white dark:bg-zinc-900 border-zinc-200">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Lunas (Paid)</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {renderState() || (
            <DataGrid table={table} recordCount={filteredBookings.length}>
              <DataGridContainer border={false} className="border-0 rounded-none">
                <DataGridTable />
                <div className="p-4 border-t border-border">
                  <DataGridPagination />
                </div>
              </DataGridContainer>
            </DataGrid>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>
              Informasi lengkap untuk pemesanan ini.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6 mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">ID Pemesanan</span>
                <strong className="text-lg font-mono">#BKG-{selectedBooking.id.toString().padStart(4, '0')}</strong>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Pelanggan</span>
                  <strong className="font-medium">{selectedBooking.nama}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">No. WhatsApp</span>
                  <a href={`https://wa.me/${selectedBooking.noWa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                    {selectedBooking.noWa} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Paket Wisata</span>
                <strong className="font-medium">{selectedBooking.paket?.nama || "Paket Dihapus"}</strong>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Tanggal Trip</span>
                  <strong className="font-medium">{formatDate(selectedBooking.tanggal)}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Jumlah Pax</span>
                  <strong className="font-medium">{selectedBooking.jumlahPax} Orang</strong>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Total Tagihan</span>
                <strong className="text-xl text-primary">{formatPrice(selectedBooking.total)}</strong>
              </div>
              
              {selectedBooking.catatan && (
                <div className="flex flex-col gap-1 mt-2 p-4 bg-muted/50 rounded-lg border">
                  <span className="text-sm text-muted-foreground font-medium">Catatan Tambahan:</span>
                  <p className="text-sm leading-relaxed">{selectedBooking.catatan}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">Tutup</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
