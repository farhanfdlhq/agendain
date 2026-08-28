"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/reui/admin-header"
import { Plus, Edit2, Trash2, Tag } from "lucide-react"
import { toast } from "react-hot-toast"
import { useConfirm } from "@/components/Providers/ConfirmProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { EmptyState } from "@/components/reui/empty-state"

type BlogCategory = {
  id: number
  nama: string
  namaEn: string | null
  slug: string
  _count?: { posts: number }
}

export default function AdminBlogKategoriPage() {
  const { confirm } = useConfirm()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formNama, setFormNama] = useState("")
  const [formNamaEn, setFormNamaEn] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/blog/categories")
      if (res.ok) setCategories(await res.json())
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditingId(null)
    setFormNama("")
    setFormNamaEn("")
    setDialogOpen(true)
  }

  const openEdit = (cat: BlogCategory) => {
    setEditingId(cat.id)
    setFormNama(cat.nama)
    setFormNamaEn(cat.namaEn || "")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formNama.trim()) { toast.error("Nama kategori harus diisi"); return }
    setSaving(true)
    try {
      const body = { nama: formNama.trim(), namaEn: formNamaEn.trim() || null }
      const url = editingId ? `/api/blog/categories/${editingId}` : "/api/blog/categories"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menyimpan")
      }
      toast.success(editingId ? "Kategori diperbarui" : "Kategori ditambahkan")
      setDialogOpen(false)
      fetchCategories()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: BlogCategory) => {
    const ok = await confirm({
      title: "Hapus kategori",
      message: `Kategori "${cat.nama}" akan dihapus permanen. Artikel yang memakainya bisa kehilangan kategori.`,
      confirmText: "Ya, hapus",
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/blog/categories/${cat.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menghapus")
      }
      toast.success("Kategori dihapus")
      fetchCategories()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Kategori Blog"
        description="Kelola kategori untuk mengelompokkan artikel blog."
        action={<Button onClick={openCreate} className="gap-2"><Plus size={16} /> Tambah Kategori</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><AirplaneLoader size={32} /></div>
          ) : categories.length === 0 ? (
            <EmptyState icon={<Tag size={40} />} title="Belum ada kategori" description="Buat kategori pertama untuk mengelompokkan artikel." />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Nama (ID)</TableHead>
                    <TableHead>Nama (EN)</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Artikel</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat, i) => (
                    <TableRow key={cat.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{cat.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{cat.namaEn || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{cat.slug}</Badge></TableCell>
                      <TableCell>{cat._count?.posts ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(cat)} title="Edit"><Edit2 size={14} /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(cat)} title="Hapus"><Trash2 size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama (Indonesia)</Label>
              <Input value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Contoh: Destinasi" />
            </div>
            <div className="space-y-2">
              <Label>Nama (English)</Label>
              <Input value={formNamaEn} onChange={(e) => setFormNamaEn(e.target.value)} placeholder="Contoh: Destinations" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
