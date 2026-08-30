"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, CreditCard, MoreVertical, Star } from "lucide-react"
import { useConfirm } from "@/components/Providers/ConfirmProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AirplaneLoader from "@/components/ui/airplane-loader"

type Account = {
  id: number
  label: string
  bank: string
  atasNama: string | null
  nomor: string | null
  bicSwift: string | null
  iban: string | null
  isDefault: boolean
  aktif: boolean
}

const KOSONG = { label: "", bank: "", atasNama: "", nomor: "", bicSwift: "", iban: "", isDefault: false }

export default function AkunPembayaranPage() {
  const { confirm } = useConfirm()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(KOSONG)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const clearError = (name: string) =>
    setErrors(prev => (prev[name] ? { ...prev, [name]: false } : prev))

  // `loading` sudah bernilai true sejak awal, jadi pemuatan pertama tak perlu
  // menyalakannya lagi. Itu pula yang membuat efek di bawah tidak memanggil
  // setState secara sinkron — sekaligus menghilangkan kedip tabel saat data
  // dimuat ulang setelah simpan/nonaktifkan.
  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/payment-accounts")
      if (res.ok) setAccounts(await res.json())
      else toast.error("Gagal memuat akun pembayaran")
    } catch {
      toast.error("Kesalahan jaringan")
    } finally {
      setLoading(false)
    }
  }

  // Pemuatan pertama ditulis inline: setState-nya jelas terjadi di dalam
  // callback, bukan sinkron di badan efek. `fetchAccounts` di atas tetap
  // dipakai untuk memuat ulang setelah simpan/nonaktifkan.
  useEffect(() => {
    fetch("/api/payment-accounts")
      .then(res => (res.ok ? res.json() : Promise.reject(new Error())))
      .then(setAccounts)
      .catch(() => toast.error("Gagal memuat akun pembayaran"))
      .finally(() => setLoading(false))
  }, [])

  const openDialog = (acc?: Account) => {
    if (acc) {
      setEditingId(acc.id)
      setForm({
        label: acc.label,
        bank: acc.bank,
        atasNama: acc.atasNama ?? "",
        nomor: acc.nomor ?? "",
        bicSwift: acc.bicSwift ?? "",
        iban: acc.iban ?? "",
        isDefault: acc.isDefault,
      })
    } else {
      setEditingId(null)
      setForm(KOSONG)
    }
    setErrors({})
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fieldErrors = { label: !form.label.trim(), bank: !form.bank.trim() }
    if (Object.values(fieldErrors).some(Boolean)) {
      setErrors(fieldErrors)
      toast.error("Nama Label dan Bank/Layanan wajib diisi.")
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const url = editingId ? `/api/payment-accounts/${editingId}` : "/api/payment-accounts"
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(editingId ? "Akun diperbarui" : "Akun ditambahkan")
        setOpen(false)
        fetchAccounts()
      } else {
        toast.error(data.error || "Gagal menyimpan")
      }
    } catch {
      toast.error("Kesalahan jaringan")
    } finally {
      setSaving(false)
    }
  }

  // Payload lengkap dipakai ulang oleh aktifkan-kembali: PUT memvalidasi
  // seluruh objek, jadi field wajib harus ikut terkirim.
  const payloadDari = (acc: Account) => ({
    label: acc.label,
    bank: acc.bank,
    atasNama: acc.atasNama ?? "",
    nomor: acc.nomor ?? "",
    bicSwift: acc.bicSwift ?? "",
    iban: acc.iban ?? "",
    isDefault: acc.isDefault,
  })

  const handleReactivate = async (acc: Account) => {
    try {
      const res = await fetch(`/api/payment-accounts/${acc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payloadDari(acc), aktif: true }),
      })
      if (res.ok) { toast.success("Akun diaktifkan kembali"); fetchAccounts() }
      else toast.error("Gagal mengaktifkan akun")
    } catch {
      toast.error("Kesalahan jaringan")
    }
  }

  const handleDeactivate = async (acc: Account) => {
    const ok = await confirm({
      title: "Nonaktifkan akun",
      message: `"${acc.label}" tidak akan muncul lagi saat membuat invoice baru. Invoice lama yang memakai akun ini tetap menampilkannya.`,
      confirmText: "Ya, nonaktifkan",
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/payment-accounts/${acc.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("Akun dinonaktifkan"); fetchAccounts() }
      else toast.error("Gagal menonaktifkan")
    } catch {
      toast.error("Kesalahan jaringan")
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><AirplaneLoader size={48} /></div>

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Akun Pembayaran</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola rekening tujuan yang tercetak di invoice.</p>
        </div>
        <Button onClick={() => openDialog()} className="w-full sm:w-auto rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Tambah Akun
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-bold text-lg">Daftar Akun Pembayaran</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Akun bertanda <Star className="inline h-3.5 w-3.5 fill-current text-amber-500" aria-hidden="true" /> dipakai otomatis di invoice baru.
          </p>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold text-muted-foreground py-4">Label</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Bank / Layanan</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Nomor / IBAN</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map(acc => (
                  <TableRow key={acc.id} className={`border-b-0 ${acc.aktif ? "" : "opacity-60"}`}>
                    <TableCell className="py-4 font-semibold">
                      <span className="flex items-center gap-2">
                        {acc.isDefault && (
                          <Star className="h-4 w-4 fill-current text-amber-500 shrink-0" aria-label="Akun default" />
                        )}
                        {acc.label}
                      </span>
                    </TableCell>
                    <TableCell>{acc.bank}</TableCell>
                    <TableCell className="font-mono text-sm">{acc.nomor || acc.iban || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="rounded-full">{acc.aktif ? "Aktif" : "Nonaktif"}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl">
                          <DropdownMenuItem onClick={() => openDialog(acc)}>Edit Akun</DropdownMenuItem>
                          {acc.aktif ? (
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeactivate(acc)}>
                              Nonaktifkan
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleReactivate(acc)}>
                              Aktifkan kembali
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Belum ada akun pembayaran. Tambahkan rekening bank atau e-wallet untuk ditampilkan di invoice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl max-h-[92dvh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b-2 border-border pb-5 mb-5">
              <DialogTitle className="text-xl">{editingId ? "Edit Akun Pembayaran" : "Tambah Akun Pembayaran"}</DialogTitle>
              <DialogDescription className="sr-only">Formulir akun pembayaran</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="label">Nama Label *</Label>
                <Input
                  id="label"
                  placeholder="Contoh: WISE EUR, BCA IDR"
                  value={form.label}
                  aria-invalid={!!errors.label}
                  onChange={e => { setForm({ ...form, label: e.target.value }); clearError("label") }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bank">Bank/Layanan *</Label>
                <Input
                  id="bank"
                  placeholder="Contoh: WISE, BCA, Mandiri"
                  value={form.bank}
                  aria-invalid={!!errors.bank}
                  onChange={e => { setForm({ ...form, bank: e.target.value }); clearError("bank") }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="atasNama">Nama Pemegang Akun</Label>
                <Input
                  id="atasNama"
                  placeholder="Nama sesuai rekening"
                  value={form.atasNama}
                  onChange={e => setForm({ ...form, atasNama: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nomor">Nomor Rekening</Label>
                <Input
                  id="nomor"
                  placeholder="Nomor rekening"
                  value={form.nomor}
                  onChange={e => setForm({ ...form, nomor: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bicSwift">BIC/SWIFT</Label>
                  <Input
                    id="bicSwift"
                    placeholder="TRWIBEBIXXX"
                    value={form.bicSwift}
                    onChange={e => setForm({ ...form, bicSwift: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    placeholder="BE00 0000 0000 0000"
                    value={form.iban}
                    onChange={e => setForm({ ...form, iban: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="pr-4">
                  <p className="font-medium text-sm">Jadikan Default</p>
                  <p className="text-xs text-muted-foreground">Akan digunakan otomatis di semua invoice baru</p>
                </div>
                <Switch
                  checked={form.isDefault}
                  onCheckedChange={v => setForm({ ...form, isDefault: v })}
                  aria-label="Jadikan akun default"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
              <Button type="submit" disabled={saving} className="rounded-full">
                {saving ? <AirplaneLoader size={20} className="mr-2" /> : null}
                {editingId ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
