"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useConfirm } from "@/components/Providers/ConfirmProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { useAdminAccess } from "@/components/admin/admin-access"
import { hasPermission } from "@/lib/permissions"

// URL adalah sumber state agar bookmark, Back, dan navigasi dalam halaman
// yang sama tetap membuka/menutup pengelola label dengan benar.
export function useLabelManagerOpen(kind: string): [boolean, (open: boolean) => void] {
  const search = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  return [search.get("kelola") === kind, (open) => {
    const next = new URLSearchParams(search.toString())
    if (open) next.set("kelola", kind)
    else next.delete("kelola")
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }]
}

/**
 * Label sederhana (nama ID + EN) yang dikelola lewat MODAL di halaman induknya,
 * bukan menu/halaman sendiri: Destinasi (di Paket Wisata) & Kategori Blog (di
 * Artikel Blog). Satu komponen untuk keduanya — perbedaannya hanya konfigurasi.
 */
export type LabelRow = { id: number; nama: string; namaEn: string | null; slug: string }

export type LabelKind = {
  /** Kata benda tunggal, mis. "Destinasi". */
  noun: string
  description: string
  listUrl: string
  itemUrl: (row: LabelRow) => string
  /** Jumlah item induk yang memakai label ini (dari `_count`). */
  usage: (row: LabelRow & Record<string, unknown>) => number
  usageUnit: string
  placeholderNama: string
  placeholderEn: string
  permissions: { create: string; edit: string; delete: string }
}

export const DESTINASI: LabelKind = {
  noun: "Destinasi",
  description: "Label lokasi paket di situs (filter & kartu paket), mis. Eropa Barat atau Turki.",
  listUrl: "/api/destinasi",
  itemUrl: (row) => `/api/destinasi/${row.slug}`,
  usage: (row) => (row._count as { openTrips?: number } | undefined)?.openTrips ?? 0,
  usageUnit: "paket",
  placeholderNama: "Contoh: Eropa Barat",
  placeholderEn: "Contoh: Western Europe",
  permissions: { create: "destinasi_create", edit: "destinasi_edit", delete: "destinasi_delete" },
}

export const KATEGORI_BLOG: LabelKind = {
  noun: "Kategori",
  description: "Pengelompokan artikel di halaman Blog (tombol filter), mis. Tips atau Kuliner.",
  listUrl: "/api/blog/categories",
  itemUrl: (row) => `/api/blog/categories/${row.id}`,
  usage: (row) => (row._count as { posts?: number } | undefined)?.posts ?? 0,
  usageUnit: "artikel",
  placeholderNama: "Contoh: Tips",
  placeholderEn: "Contoh: Tips",
  permissions: { create: "blog_create", edit: "blog_edit", delete: "blog_delete" },
}

/** Tambah/edit satu label. Di-mount ulang per pembukaan (beri `key`). */
export function LabelEditDialog({
  kind,
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  kind: LabelKind
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Diisi = mode edit. */
  editing?: LabelRow | null
  onSaved: (row: LabelRow) => void
}) {
  const [nama, setNama] = useState(editing?.nama ?? "")
  const [namaEn, setNamaEn] = useState(editing?.namaEn ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fieldId = useId()
  const subject = useAdminAccess()
  const canSave = hasPermission(subject, editing ? kind.permissions.edit : kind.permissions.create)

  const save = async () => {
    if (saving || !canSave) return
    if (!nama.trim()) {
      setError(`Nama ${kind.noun.toLowerCase()} wajib diisi`)
      return
    }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(editing ? kind.itemUrl(editing) : kind.listUrl, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim(), namaEn: namaEn.trim() || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error === "Validasi gagal" ? "Periksa kembali isian." : data?.error || `Gagal menyimpan ${kind.noun.toLowerCase()}`)
        return
      }
      toast.success(editing ? `${kind.noun} diperbarui` : `${kind.noun} ditambahkan`)
      onSaved(data as LabelRow)
      onOpenChange(false)
    } catch {
      setError("Gagal terhubung ke server. Coba simpan lagi.")
    } finally {
      setSaving(false)
    }
  }

  if (!canSave) return null
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) onOpenChange(next) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${kind.noun}` : `Tambah ${kind.noun}`}</DialogTitle>
          <DialogDescription>{kind.description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={fieldId}>Nama (Indonesia)</Label>
            <Input id={fieldId} value={nama} onChange={(e) => { setNama(e.target.value); setError(null) }} placeholder={kind.placeholderNama} disabled={saving} autoFocus aria-invalid={!!error} aria-describedby={error ? `${fieldId}-error` : undefined} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-en`}>
              Nama (English) <span className="text-muted-foreground font-normal">Opsional</span>
            </Label>
            <Input id={`${fieldId}-en`} value={namaEn} onChange={(e) => setNamaEn(e.target.value)} placeholder={kind.placeholderEn} disabled={saving} />
            <p className="text-xs text-muted-foreground">Kosong = memakai nama Indonesia di versi Inggris.</p>
          </div>
          {error && <p id={`${fieldId}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Modal daftar + CRUD label. Pemanggil me-mount komponen ini hanya saat dibuka
 * (`{open && <LabelManagerDialog open … />}`), jadi data dimuat per pembukaan.
 */
export function LabelManagerDialog({
  kind,
  open,
  onOpenChange,
  onChanged,
}: {
  kind: LabelKind
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Dipanggil setelah ada perubahan (nama label tampil di tabel induk). */
  onChanged?: () => void
}) {
  const { confirm } = useConfirm()
  const [rows, setRows] = useState<Array<LabelRow & Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const subject = useAdminAccess()
  const canCreate = hasPermission(subject, kind.permissions.create)
  const canEdit = hasPermission(subject, kind.permissions.edit)
  const canDelete = hasPermission(subject, kind.permissions.delete)
  // null = tertutup; { row: null } = tambah; { row } = edit. `key` me-mount ulang.
  const [editor, setEditor] = useState<{ row: LabelRow | null; key: number } | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(kind.listUrl, { signal })
      if (!res.ok) throw new Error()
      const rows = await res.json()
      if (!Array.isArray(rows)) throw new Error()
      if (!signal?.aborted) { setRows(rows); setError(null) }
    } catch {
      if (!signal?.aborted) setError(`Gagal memuat ${kind.noun.toLowerCase()}. Coba lagi.`)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [kind])

  // Muat awal; `load` dipakai lagi setelah tambah/edit/hapus.
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const remove = async (row: LabelRow) => {
    if (!canDelete || deletingId !== null || kind.usage(row) > 0) return
    const ok = await confirm({
      title: `Hapus ${kind.noun.toLowerCase()}`,
      message: `"${row.nama}" akan dihapus permanen. ${kind.noun} yang masih dipakai ${kind.usageUnit} tidak bisa dihapus.`,
      confirmText: "Ya, hapus",
    })
    if (!ok) return
    setDeletingId(row.id)
    try {
      const res = await fetch(kind.itemUrl(row), { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || `Gagal menghapus ${kind.noun.toLowerCase()}`)
        return
      }
      toast.success(`${kind.noun} dihapus`)
      load()
      onChanged?.()
    } catch {
      toast.error("Gagal terhubung ke server")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola {kind.noun}</DialogTitle>
            <DialogDescription>{kind.description}</DialogDescription>
          </DialogHeader>

          {canCreate && <div className="flex justify-end">
            <Button size="sm" onClick={() => setEditor({ row: null, key: Date.now() })}>
              <Plus className="mr-1.5 h-4 w-4" /> Tambah {kind.noun}
            </Button>
          </div>}

          <div className="max-h-[50vh] overflow-y-auto rounded-lg border">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <AirplaneLoader size={24} /> Memuat...
              </div>
            ) : error ? (
              <div className="space-y-3 p-6 text-center">
                <p role="alert" className="text-sm text-destructive">{error}</p>
                <Button variant="outline" onClick={() => { setLoading(true); void load() }}>Coba lagi</Button>
              </div>
            ) : rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Belum ada {kind.noun.toLowerCase()}.</p>
            ) : (
              <ul className="divide-y">
                {rows.map((row) => {
                  const dipakai = kind.usage(row)
                  return (
                    <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{row.nama}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.namaEn ? `EN: ${row.namaEn} · ` : ""}
                          {dipakai > 0 ? `${dipakai} ${kind.usageUnit}` : "Belum dipakai"}
                        </p>
                      </div>
                      {canEdit && <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Edit ${row.nama}`}
                        onClick={() => setEditor({ row, key: Date.now() })}
                      >
                        <Edit2 size={15} />
                      </Button>}
                      {canDelete && <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Hapus ${row.nama}`}
                        disabled={dipakai > 0 || deletingId !== null}
                        title={dipakai > 0 ? `Masih dipakai ${dipakai} ${kind.usageUnit}` : "Hapus"}
                        onClick={() => remove(row)}
                      >
                        <Trash2 size={15} />
                      </Button>}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editor && (
        <LabelEditDialog
          key={editor.key}
          kind={kind}
          open
          onOpenChange={(o) => !o && setEditor(null)}
          editing={editor.row}
          onSaved={() => {
            load()
            onChanged?.()
          }}
        />
      )}
    </>
  )
}
