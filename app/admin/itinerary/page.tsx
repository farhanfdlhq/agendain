"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { Plus, Route, MoreVertical, Search, ExternalLink } from "lucide-react"
import { useConfirm } from "@/components/Providers/ConfirmProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PageSizeSelect } from "@/components/ui/page-size-select"
import { TablePagination } from "@/components/ui/table-pagination"
import { useTablePagination } from "@/lib/use-table-pagination"

type Itinerary = {
  id: number
  token: string
  judul: string
  klienNama: string
  tanggalDok: string
  status: string
}

const GAYA_STATUS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success/10 text-success border-success/30",
  archived: "bg-destructive/10 text-destructive border-destructive/30",
}
const LABEL_STATUS: Record<string, string> = {
  draft: "Draft", published: "Terbit", archived: "Arsip",
}

export default function AdminItineraryPage() {
  const { confirm } = useConfirm()
  const [items, setItems] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("semua")

  useEffect(() => {
    fetch("/api/itinerary")
      .then(res => (res.ok ? res.json() : Promise.reject(new Error())))
      .then(setItems)
      .catch(() => toast.error("Gagal memuat itinerary"))
      .finally(() => setLoading(false))
  }, [])

  const refetch = async () => {
    try {
      const res = await fetch("/api/itinerary")
      if (res.ok) setItems(await res.json())
    } catch { /* diam */ }
  }

  const handleStatusChange = async (it: Itinerary, status: string) => {
    if (status === it.status) return
    setItems(prev => prev.map(i => (i.id === it.id ? { ...i, status } : i)))
    try {
      const res = await fetch(`/api/itinerary/${it.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || "Gagal mengubah status")
      }
      toast.success(`Status → ${LABEL_STATUS[status] ?? status}`)
    } catch (e) {
      setItems(prev => prev.map(i => (i.id === it.id ? { ...i, status: it.status } : i)))
      toast.error(e instanceof Error ? e.message : "Gagal mengubah status")
    }
  }

  const handleDelete = async (it: Itinerary) => {
    const ok = await confirm({
      title: "Hapus itinerary",
      message: `"${it.judul}" akan dihapus permanen. Tautan klien tidak akan bisa dibuka lagi.`,
      confirmText: "Ya, hapus",
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/itinerary/${it.id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) { toast.success("Itinerary dihapus"); refetch() }
      else toast.error(data.error || "Gagal menghapus")
    } catch {
      toast.error("Kesalahan jaringan")
    }
  }

  const terfilter = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter(i =>
      (filterStatus === "semua" || i.status === filterStatus) &&
      (i.judul.toLowerCase().includes(q) || i.klienNama.toLowerCase().includes(q)),
    )
  }, [items, search, filterStatus])

  const pagination = useTablePagination(terfilter)
  const { pageItems, setPage } = pagination
  useEffect(() => { setPage(1) }, [search, filterStatus, setPage])

  const fmtTanggal = (s: string) =>
    s ? new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"

  if (loading) return <div className="flex h-64 items-center justify-center"><Route className="animate-pulse" /></div>

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Itinerary</h2>
          <p className="text-muted-foreground text-sm mt-1">Buat dan bagikan jadwal perjalanan untuk klien.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari judul / klien..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" />
          </div>
          <Button asChild className="rounded-full px-6 whitespace-nowrap">
            <Link href="/admin/itinerary/baru"><Plus className="mr-2 h-4 w-4" /> Buat Itinerary</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {["semua", "draft", "published", "archived"].map(s => (
              <Button key={s} type="button" size="sm"
                variant={filterStatus === s ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => setFilterStatus(s)}>
                {s === "semua" ? "Semua" : LABEL_STATUS[s]}
              </Button>
            ))}
            <div className="ml-auto">
              <PageSizeSelect value={pagination.pageSize} onValueChange={pagination.setPageSize} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold text-muted-foreground py-4">Judul</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Klien</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Tanggal</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(it => (
                  <TableRow key={it.id} className="border-b-0">
                    <TableCell className="py-4 font-semibold">{it.judul}</TableCell>
                    <TableCell>{it.klienNama}</TableCell>
                    <TableCell className="text-sm">{fmtTanggal(it.tanggalDok)}</TableCell>
                    <TableCell className="text-center">
                      <Select value={it.status} onValueChange={(v) => handleStatusChange(it, v)}>
                        <SelectTrigger className={`h-7 w-28 justify-center rounded-full text-xs font-medium ${GAYA_STATUS[it.status] ?? ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Terbit</SelectItem>
                          <SelectItem value="archived">Arsip</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/itinerary/${it.id}/edit`}>Edit Itinerary</Link>
                          </DropdownMenuItem>
                          {it.status === "published" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/itinerary/${it.token}`} target="_blank">
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Buka tautan klien
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(it)}>
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {terfilter.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Belum ada itinerary. Klik &ldquo;Buat Itinerary&rdquo; untuk membuat yang pertama.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {terfilter.length > 0 && (
            <div className="border-t mt-4 pt-4">
              <TablePagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                onPageChange={pagination.setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
