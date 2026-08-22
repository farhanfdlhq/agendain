"use client"

import { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react"
import { Search, WifiOff, AlertCircle, RefreshCw, Inbox } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DataGrid, DataGridContainer } from "@/components/reui/data-grid/data-grid"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { createTripColumns } from "./columns"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { PageSizeSelect } from "@/components/ui/page-size-select"
import {
  PRIVATE_TRIP_STATUS_LABEL,
  type PrivateTripStatus,
} from "@/lib/private-trip-status"

export default function AdminInquiriesPage() {
  const [privateTrips, setPrivateTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  // Baris yang sedang menunggu jawaban server; dropdown-nya dinonaktifkan agar
  // admin tak mengirim dua perubahan status beruntun pada baris yang sama.
  const [pendingId, setPendingId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/inquiries")
      if (res.ok) {
        const json = await res.json()
        setPrivateTrips(json.privateTrips ?? [])
      } else {
        setError("Gagal memuat data dari server.")
      }
    } catch (error) {
      console.error("Failed to fetch private trips", error)
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    fetchData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [fetchData])

  const handleStatusChange = useCallback(async (id: number, status: PrivateTripStatus) => {
    // Optimistic update: status langsung terlihat berubah, lalu dikembalikan
    // ke nilai semula bila server menolak.
    const previous = privateTrips
    setPendingId(id)
    setPrivateTrips((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)))

    try {
      const res = await fetch("/api/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        toast.success(`Status diubah ke "${PRIVATE_TRIP_STATUS_LABEL[status]}"`)
      } else {
        setPrivateTrips(previous)
        toast.error("Gagal memperbarui status")
      }
    } catch (err) {
      console.error("Failed to update status", err)
      setPrivateTrips(previous)
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setPendingId(null)
    }
  }, [privateTrips])

  const filteredTrips = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase()
    return privateTrips.filter((t: any) =>
      t.nama.toLowerCase().includes(searchLower) ||
      t.email.toLowerCase().includes(searchLower) ||
      t.destinasi.toLowerCase().includes(searchLower)
    )
  }, [privateTrips, deferredSearch])

  const tripColumns = useMemo(
    () => createTripColumns(handleStatusChange, pendingId),
    [handleStatusChange, pendingId]
  )

  const tripsTable = useReactTable({
    data: filteredTrips,
    columns: tripColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

  // Sinkronkan pilihan "Tampilkan N entri"; kembali ke halaman 1 agar pilihan
  // baru tak mendarat di tengah data (TanStack tak reset sendiri).
  useEffect(() => {
    tripsTable.setPageSize(pageSize)
    tripsTable.setPageIndex(0)
  }, [pageSize, tripsTable])

  // Balik ke halaman 1 saat kriteria pencarian berubah.
  useEffect(() => {
    tripsTable.setPageIndex(0)
  }, [deferredSearch, tripsTable])

  const renderState = () => {
    if (isOffline) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <WifiOff className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-medium">Anda Sedang Offline</h3>
          <p className="text-sm text-muted-foreground">Koneksi internet terputus. Silakan periksa jaringan Anda lalu coba lagi.</p>
          <Button onClick={fetchData} variant="outline" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Coba Ulang
          </Button>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-medium">Terjadi Kesalahan</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchData} variant="outline" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
          </Button>
        </div>
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

    return null
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Permintaan Private Trip</h2>
          <p className="text-muted-foreground text-sm">Kelola pengajuan Private Trip yang masuk dari halaman depan.</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama, email, atau destinasi..."
              className="pl-9 rounded-full bg-white dark:bg-zinc-900 border-zinc-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <PageSizeSelect value={pageSize} onValueChange={setPageSize} />
        </CardHeader>

        <CardContent className="p-0">
          {renderState() || (filteredTrips.length > 0 ? (
            <DataGrid table={tripsTable} recordCount={filteredTrips.length} tableLayout={{ width: "auto" }}>
              <DataGridContainer border={false} className="border-0 rounded-none">
                <DataGridTable />
                <div className="p-4 border-t border-border">
                  <DataGridPagination
                    showSizes={false}
                    info="{from} – {to} dari {count}"
                    previousPageLabel="Halaman sebelumnya"
                    nextPageLabel="Halaman berikutnya"
                  />
                </div>
              </DataGridContainer>
            </DataGrid>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">
                {privateTrips.length === 0 ? "Belum Ada Permintaan" : "Tidak Ada Hasil"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {privateTrips.length === 0
                  ? "Saat ini belum ada pengajuan Private Trip baru dari pelanggan."
                  : "Tidak ada permintaan yang cocok dengan pencarian Anda."}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
