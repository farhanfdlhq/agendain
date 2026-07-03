"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Phone, Calendar, Users, CheckCircle, Clock, WifiOff, AlertCircle, RefreshCw, Inbox, MessageSquare, ArrowUpRight } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DataGrid, DataGridContainer } from "@/components/reui/data-grid/data-grid"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { createTripColumns, createInquiryColumns } from "./columns"
import AirplaneLoader from "@/components/ui/airplane-loader"

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<"privatetrip" | "inquiries">("privatetrip")
  const [data, setData] = useState({ inquiries: [], privateTrips: [] })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Handle offline status
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
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/inquiries")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        setError("Gagal memuat data dari server.")
      }
    } catch (error) {
      console.error("Failed to fetch inquiries", error)
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsReplied = async (id: number, type: string) => {
    try {
      const res = await fetch(`/api/inquiries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, sudahDibalas: true })
      })
      if (res.ok) {
        toast.success("Status berhasil diperbarui")
        fetchData()
      } else {
        toast.error("Gagal memperbarui status")
      }
    } catch (err) {
      console.error("Failed to update status", err)
      toast.error("Terjadi kesalahan sistem")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  }

  const filteredTrips = data.privateTrips.filter((t: any) => 
    t.nama.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.destinasi.toLowerCase().includes(search.toLowerCase())
  )

  const filteredInquiries = data.inquiries.filter((i: any) => 
    i.nama.toLowerCase().includes(search.toLowerCase()) || 
    i.email.toLowerCase().includes(search.toLowerCase())
  )

  const tripColumns = createTripColumns()
  const inquiryColumns = createInquiryColumns(handleMarkAsReplied)

  const tripsTable = useReactTable({
    data: filteredTrips,
    columns: tripColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

  const inquiriesTable = useReactTable({
    data: filteredInquiries,
    columns: inquiryColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pusat Pesan & Inquiries</h2>
          <p className="text-muted-foreground text-sm">Kelola permintaan Private Trip dan pertanyaan masuk dari pelanggan.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "privatetrip" | "inquiries")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="privatetrip" className="flex items-center gap-2">
            Private Trip
            {data.privateTrips.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{data.privateTrips.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            Pesan Masuk
            {data.inquiries.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{data.inquiries.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <Card className="mt-6 border-border">
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
          </CardHeader>
          
          <CardContent className="p-0">
            <TabsContent value="privatetrip" className="m-0 border-0 outline-none">
              {renderState() || (filteredTrips.length > 0 ? (
                <DataGrid table={tripsTable} recordCount={filteredTrips.length}>
                  <DataGridContainer border={false} className="border-0 rounded-none">
                    <DataGridTable />
                    <div className="p-4 border-t border-border">
                      <DataGridPagination />
                    </div>
                  </DataGridContainer>
                </DataGrid>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Inbox className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Belum Ada Private Trip</h3>
                  <p className="text-sm text-muted-foreground">Saat ini belum ada pengajuan Private Trip baru dari pelanggan.</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="inquiries" className="m-0 border-0 outline-none">
              {renderState() || (filteredInquiries.length > 0 ? (
                <DataGrid table={inquiriesTable} recordCount={filteredInquiries.length}>
                  <DataGridContainer border={false} className="border-0 rounded-none">
                    <DataGridTable />
                    <div className="p-4 border-t border-border">
                      <DataGridPagination />
                    </div>
                  </DataGridContainer>
                </DataGrid>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Inbox Kosong</h3>
                  <p className="text-sm text-muted-foreground">Belum ada pertanyaan masuk dari pelanggan.</p>
                </div>
              ))}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
