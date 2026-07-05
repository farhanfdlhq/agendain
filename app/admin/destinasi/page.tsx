"use client"

import { useState, useEffect, useMemo, useDeferredValue } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Search, MapPin, WifiOff, AlertCircle, RefreshCw, Map } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { Badge } from "@/components/ui/badge"

export default function AdminDestinasiPage() {
  const [destinasi, setDestinasi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    fetchDestinasi()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchDestinasi = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/destinasi")
      if (res.ok) {
        const data = await res.json()
        setDestinasi(data)
      } else {
        setError("Gagal memuat data dari server.")
      }
    } catch (error) {
      console.error("Failed to fetch destinations", error)
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (confirm("Hapus destinasi ini? Semua paket yang terkait mungkin akan kehilangan relasinya.")) {
      try {
        const res = await fetch(`/api/destinasi/${slug}`, {
          method: "DELETE"
        });
        if (res.ok) {
          toast.success("Destinasi berhasil dihapus");
          fetchDestinasi();
        } else {
          toast.error("Gagal menghapus destinasi");
        }
      } catch (e) {
        toast.error("Terjadi kesalahan server");
      }
    }
  }

  const filteredData = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase()
    return destinasi.filter(d => 
      d.nama.toLowerCase().includes(searchLower)
    )
  }, [destinasi, deferredSearch])

  const renderState = () => {
    if (isOffline) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="h-64 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <WifiOff className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium">Anda Sedang Offline</h3>
              <p className="text-sm text-muted-foreground">Koneksi internet terputus. Silakan periksa jaringan Anda lalu coba lagi.</p>
              <Button onClick={fetchDestinasi} variant="outline" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Coba Ulang
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }
    
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="h-64 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium">Terjadi Kesalahan</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={fetchDestinasi} variant="outline" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="h-64 text-center">
            <div className="flex w-full items-center justify-center">
              <AirplaneLoader size={32} className="text-primary" />
              <span className="ml-2 text-muted-foreground">Memuat data...</span>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (filteredData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="h-64 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Map className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Tidak Ada Destinasi Ditemukan</h3>
              <p className="text-sm text-muted-foreground">Belum ada destinasi wisata yang ditambahkan atau pencarian tidak cocok.</p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/destinasi/baru">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Destinasi
                </Link>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Manajemen Destinasi</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola negara dan kota tujuan wisata.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 font-semibold rounded-full px-6 whitespace-nowrap" style={{ color: '#ffffff' }}>
          <Link href="/admin/destinasi/baru" style={{ color: '#ffffff' }}>
            <Plus size={18} className="mr-2" />
            Tambah Destinasi
          </Link>
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Cari nama destinasi..." 
              className="pl-9 rounded-full bg-white dark:bg-zinc-900 border-zinc-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%] py-4 px-4 font-semibold">Nama Destinasi</TableHead>
                  <TableHead className="w-[25%] px-4 font-semibold">Slug</TableHead>
                  <TableHead className="w-[20%] px-4 font-semibold">Jumlah Paket</TableHead>
                  <TableHead className="w-[20%] text-right px-4 font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderState() || (
                  filteredData.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2 font-medium">
                          <MapPin size={16} className="text-primary" />
                          {d.nama}
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <Badge variant="secondary" className="font-normal bg-muted text-muted-foreground border-transparent">
                          {d.slug}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4">
                        {d._count?.pakets || 0}
                      </TableCell>
                      <TableCell className="text-right px-4">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                            <Link href={`/admin/destinasi/edit/${d.slug}`}>
                              <Edit2 size={16} />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDelete(d.slug)}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
