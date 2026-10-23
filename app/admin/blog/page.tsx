"use client"

import { useState, useEffect, useMemo, useDeferredValue } from "react"
import { EmptyState } from "@/components/reui/empty-state"
import { AdminHeader } from "@/components/reui/admin-header"
import { KATEGORI_BLOG, LabelManagerDialog, useLabelManagerOpen } from "@/components/admin/label-manager"
import { useAdminAccess } from "@/components/admin/admin-access"
import { hasPermission } from "@/lib/permissions"
import Link from "next/link"
import Image from "next/image"
import { Plus, Edit2, Trash2, Search, FileText, RefreshCw, Eye } from "lucide-react"
import { toast } from "react-hot-toast"
import { useConfirm } from "@/components/Providers/ConfirmProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { Badge } from "@/components/ui/badge"
import { PageSizeSelect } from "@/components/ui/page-size-select"
import { TablePagination } from "@/components/ui/table-pagination"
import { useTablePagination } from "@/lib/use-table-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BlogPost = {
  id: number
  title: string
  slug: string
  thumbnail: string
  status: string
  publishedAt: string | null
  createdAt: string
  readCount?: number
  category: { id: number; nama: string; slug: string }
}

export default function AdminBlogPage() {
  const { confirm } = useConfirm()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Array<{ id: number; nama: string; slug: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [kategoriOpen, setKategoriOpen] = useLabelManagerOpen("kategori")
  const subject = useAdminAccess()
  const canCreate = hasPermission(subject, 'blog_create')
  const canEdit = hasPermission(subject, 'blog_edit')
  const canDelete = hasPermission(subject, 'blog_delete')
  const [sortByReads, setSortByReads] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/blog?admin=true&pageSize=200")
      if (!res.ok) throw new Error("Gagal memuat artikel")
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/blog/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch {}
  }

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

  const filtered = useMemo(() => {
    const rows = posts.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(deferredSearch.toLowerCase())
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const matchCategory = categoryFilter === "all" || p.category?.slug === categoryFilter
      return matchSearch && matchStatus && matchCategory
    })
    // Urut "Terpopuler": jumlah dibaca terbanyak di atas (urutan asli = terbaru).
    return sortByReads ? [...rows].sort((a, b) => (b.readCount ?? 0) - (a.readCount ?? 0)) : rows
  }, [posts, deferredSearch, statusFilter, categoryFilter, sortByReads])

  const { page, pageSize, setPage, setPageSize, pageCount, startIndex, pageItems: paginatedPosts, from, to, total } = useTablePagination(filtered)

  const handleDelete = async (slug: string, title: string) => {
    if (!canDelete) return
    const ok = await confirm({
      title: "Hapus artikel",
      message: `Artikel "${title}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
      confirmText: "Ya, hapus",
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Gagal menghapus")
      toast.success("Artikel berhasil dihapus")
      fetchPosts()
    } catch {
      toast.error("Gagal menghapus artikel")
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Artikel Blog"
        description="Kelola semua artikel blog dan konten travel tips."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setKategoriOpen(true)}>Kelola Kategori</Button>
            {canCreate && <Button asChild className="gap-2"><Link href="/admin/blog/baru"><Plus size={16} /> Buat Artikel</Link></Button>}
          </div>
        }
      />

      {kategoriOpen && (
        <LabelManagerDialog
          kind={KATEGORI_BLOG}
          open
          onOpenChange={setKategoriOpen}
          onChanged={() => {
            fetchPosts()
            fetchCategories()
          }}
        />
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Cari artikel" placeholder="Cari artikel..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger aria-label="Filter status" className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger aria-label="Filter kategori" className="w-full sm:w-[160px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><AirplaneLoader size={32} /></div>
          ) : error ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchPosts} className="gap-2"><RefreshCw size={14} /> Coba lagi</Button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<FileText size={40} />} title={posts.length ? "Artikel tidak ditemukan" : "Belum ada artikel"} description={posts.length ? "Ubah pencarian atau filter untuk melihat artikel lain." : "Artikel yang dibuat akan muncul di sini."} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <PageSizeSelect value={pageSize} onValueChange={(v: number) => { setPageSize(v); setPage(1) }} />
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead className="w-16">Cover</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">
                        <button
                          type="button"
                          onClick={() => { setSortByReads((v) => !v); setPage(1) }}
                          className="inline-flex items-center gap-1 font-medium hover:text-foreground cursor-pointer"
                          aria-pressed={sortByReads}
                          title={sortByReads ? "Kembali urut terbaru" : "Urutkan dari yang paling banyak dibaca"}
                        >
                          Dibaca {sortByReads ? "↓" : <span className="text-muted-foreground/60">↕</span>}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPosts.map((post, i) => (
                      <TableRow key={post.id}>
                        <TableCell className="text-muted-foreground">{startIndex + i + 1}</TableCell>
                        <TableCell>
                          <div className="w-12 h-8 rounded overflow-hidden bg-muted relative">
                            {post.thumbnail && <Image src={post.thumbnail} alt="" fill className="object-cover" sizes="48px" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-[300px] truncate">{post.title}</TableCell>
                        <TableCell><Badge variant="secondary">{post.category?.nama || '-'}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={post.status === 'published' ? 'default' : 'outline'} className={post.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : ''}>
                            {post.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {post.status === 'published' ? (post.readCount ?? 0).toLocaleString('id-ID') : <span className="text-muted-foreground">–</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Pratinjau">
                              <Link href={`/blog/${post.slug}?preview=true`} target="_blank" aria-label={`Pratinjau ${post.title}`}><Eye size={14} /></Link>
                            </Button>
                            {canEdit && <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                              <Link href={`/admin/blog/${post.slug}/edit`} aria-label={`Edit ${post.title}`}><Edit2 size={14} /></Link>
                            </Button>}
                            {canDelete && <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(post.slug, post.title)} title="Hapus" aria-label={`Hapus ${post.title}`}><Trash2 size={14} /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3">
                <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
