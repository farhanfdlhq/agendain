"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { Plus, Receipt, MoreVertical, Search, ExternalLink } from "lucide-react"
import { useConfirm } from "@/components/Providers/ConfirmProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PageSizeSelect } from "@/components/ui/page-size-select"
import { TablePagination } from "@/components/ui/table-pagination"
import { useTablePagination } from "@/lib/use-table-pagination"
import { formatUang, type MataUang } from "@/lib/invoice"

type Invoice = {
  id: number
  nomor: string
  token: string
  klienNama: string
  judul: string | null
  tanggal: string
  jatuhTempo: string | null
  mataUang: string
  total: string
  status: string
}

const GAYA_STATUS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  terkirim: "bg-info/10 text-info border-info/30",
  lunas: "bg-success/10 text-success border-success/30",
  batal: "bg-destructive/10 text-destructive border-destructive/30",
}

const LABEL_STATUS: Record<string, string> = {
  draft: "Draft", terkirim: "Terkirim", lunas: "Lunas", batal: "Batal",
}

const awalHari = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export default function AdminInvoicePage() {
  const { confirm } = useConfirm()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("semua")

  // `loading` sudah bernilai true sejak awal — lihat catatan yang sama di
  // halaman Akun Pembayaran.
  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoice")
      if (res.ok) setInvoices(await res.json())
      else toast.error("Gagal memuat invoice")
    } catch {
      toast.error("Kesalahan jaringan")
    } finally {
      setLoading(false)
    }
  }

  // Lihat catatan yang sama di halaman Akun Pembayaran.
  useEffect(() => {
    fetch("/api/invoice")
      .then(res => (res.ok ? res.json() : Promise.reject(new Error())))
      .then(setInvoices)
      .catch(() => toast.error("Gagal memuat invoice"))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (inv: Invoice) => {
    const ok = await confirm({
      title: "Hapus invoice",
      message: `${inv.nomor} akan dihapus permanen. Hanya invoice draft yang bisa dihapus — invoice yang sudah dikirim harus dibatalkan, bukan dihapus.`,
      confirmText: "Ya, hapus",
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/invoice/${inv.id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) { toast.success("Invoice dihapus"); fetchInvoices() }
      else toast.error(data.error || "Gagal menghapus")
    } catch {
      toast.error("Kesalahan jaringan")
    }
  }

  const terfilter = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(i =>
      (filterStatus === "semua" || i.status === filterStatus) &&
      (i.nomor.toLowerCase().includes(q) || i.klienNama.toLowerCase().includes(q)),
    )
  }, [invoices, search, filterStatus])

  const pagination = useTablePagination(terfilter)
  const { pageItems, setPage } = pagination
  useEffect(() => { setPage(1) }, [search, filterStatus, setPage])

  const fmtTanggal = (s: string | null) =>
    s ? new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"

  if (loading) return <div className="flex h-64 items-center justify-center"><Receipt className="animate-pulse" /></div>

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Invoice</h2>
          <p className="text-muted-foreground text-sm mt-1">Buat dan kelola tagihan untuk klien.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nomor / klien..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" />
          </div>
          <Button asChild className="rounded-full px-6 whitespace-nowrap">
            <Link href="/admin/invoice/baru"><Plus className="mr-2 h-4 w-4" /> Buat Invoice</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {["semua", "draft", "terkirim", "lunas", "batal"].map(s => (
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
                  <TableHead className="font-semibold text-muted-foreground py-4">Nomor</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Klien</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Tanggal</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Jatuh Tempo</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-right">Total</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(inv => {
                  const terlewat = inv.status === "terkirim" && inv.jatuhTempo &&
                    awalHari(new Date(inv.jatuhTempo)) < awalHari(new Date())
                  return (
                    <TableRow key={inv.id} className="border-b-0">
                      <TableCell className="py-4 font-mono text-sm font-semibold">{inv.nomor}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{inv.klienNama}</span>
                          {inv.judul && <span className="text-xs text-muted-foreground">{inv.judul}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{fmtTanggal(inv.tanggal)}</TableCell>
                      <TableCell className="text-sm">
                        <span className={terlewat ? "text-destructive font-semibold" : ""}>
                          {fmtTanggal(inv.jatuhTempo)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatUang(Number(inv.total), (inv.mataUang as MataUang) ?? "IDR")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`rounded-full ${GAYA_STATUS[inv.status] ?? ""}`}>
                          {terlewat ? "Jatuh Tempo" : LABEL_STATUS[inv.status] ?? inv.status}
                        </Badge>
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
                              <Link href={`/admin/invoice/${inv.id}/edit`}>Edit Invoice</Link>
                            </DropdownMenuItem>
                            {inv.status !== "draft" && inv.status !== "batal" && (
                              <DropdownMenuItem asChild>
                                <Link href={`/invoice/${inv.token}`} target="_blank">
                                  <ExternalLink className="mr-2 h-3.5 w-3.5" /> Buka tautan klien
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {inv.status === "draft" && (
                              <DropdownMenuItem className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(inv)}>
                                Hapus
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {terfilter.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Belum ada invoice. Klik &ldquo;Buat Invoice&rdquo; untuk membuat tagihan pertama.
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
