"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { hitungInvoice, formatUang, type MataUang } from "@/lib/invoice"
import { formatMoneyInput, parseMoneyInput } from "@/lib/currency"

type Item = { deskripsi: string; qty: number | string; harga: number | string }
type Akun = { id: number; label: string; bank: string; aktif: boolean; isDefault: boolean }

const ITEM_KOSONG: Item = { deskripsi: "", qty: 1, harga: 0 }

const hariIni = () => new Date().toISOString().slice(0, 10)

export default function InvoiceForm({ mode, id }: { mode: "create" | "edit"; id?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [akunList, setAkunList] = useState<Akun[]>([])
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const clearError = (k: string) => setErrors(p => (p[k] ? { ...p, [k]: false } : p))

  const [form, setForm] = useState({
    klienNama: "", klienEmail: "", klienTelepon: "", klienAlamat: "",
    judul: "", tanggal: hariIni(), jatuhTempo: "",
    bahasa: "id", mataUang: "IDR" as MataUang,
    pajakLabel: "", pajakPersen: 0 as number | string,
    catatan: "", status: "draft", paymentAccountId: "" as string,
    items: [ { ...ITEM_KOSONG } ] as Item[],
  })
  const [nomor, setNomor] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  // Akun pembayaran + nilai bawaan dari Pengaturan Invoice.
  useEffect(() => {
    fetch("/api/payment-accounts")
      .then(r => r.ok ? r.json() : [])
      .then((list: Akun[]) => {
        const aktif = list.filter(a => a.aktif)
        setAkunList(aktif)
        if (mode === "create") {
          const def = list.find(a => a.isDefault && a.aktif)
          if (def) setForm(p => ({ ...p, paymentAccountId: String(def.id) }))
        }
      })
      .catch(() => {})

    if (mode === "create") {
      fetch("/api/settings/invoice")
        .then(r => (r.ok ? r.json() : {}))
        .then((s: Record<string, unknown>) => {
          setForm(p => {
            const termin = Number(s.terminHari)
            let jatuhTempo = p.jatuhTempo
            if (!jatuhTempo && Number.isFinite(termin) && termin > 0) {
              const d = new Date(p.tanggal)
              d.setDate(d.getDate() + termin)
              jatuhTempo = d.toISOString().slice(0, 10)
            }
            return {
              ...p,
              jatuhTempo,
              pajakLabel: p.pajakLabel || String(s.pajakLabel ?? ""),
              pajakPersen: p.pajakPersen || (Number(s.pajakPersen) || 0),
              catatan: p.catatan || String(s.catatanDefault ?? ""),
            }
          })
        })
        .catch(() => {})
    }
  }, [mode])

  useEffect(() => {
    if (mode !== "edit" || !id) return
    fetch(`/api/invoice/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(inv => {
        setNomor(inv.nomor)
        setToken(inv.token)
        setForm({
          klienNama: inv.klienNama ?? "", klienEmail: inv.klienEmail ?? "",
          klienTelepon: inv.klienTelepon ?? "", klienAlamat: inv.klienAlamat ?? "",
          judul: inv.judul ?? "",
          tanggal: inv.tanggal ? String(inv.tanggal).slice(0, 10) : hariIni(),
          jatuhTempo: inv.jatuhTempo ? String(inv.jatuhTempo).slice(0, 10) : "",
          bahasa: inv.bahasa ?? "id", mataUang: (inv.mataUang ?? "IDR") as MataUang,
          pajakLabel: inv.pajakLabel ?? "", pajakPersen: Number(inv.pajakPersen ?? 0),
          catatan: inv.catatan ?? "", status: inv.status ?? "draft",
          paymentAccountId: inv.paymentAccountId ? String(inv.paymentAccountId) : "",
          items: Array.isArray(inv.items) && inv.items.length ? inv.items : [{ ...ITEM_KOSONG }],
        })
        setLoading(false)
      })
      .catch(() => { toast.error("Gagal memuat invoice"); router.push("/admin/invoice") })
  }, [mode, id, router])

  const ubahItem = (i: number, k: keyof Item, v: string) => {
    setForm(p => {
      const items = [...p.items]
      items[i] = { ...items[i], [k]: v }
      return { ...p, items }
    })
    clearError(`item-${i}`)
  }

  // Ringkasan hidup memakai fungsi yang SAMA dengan server, jadi angka di layar
  // tidak akan berbeda dari yang tersimpan.
  const angka = hitungInvoice(
    form.items.map(it => ({ deskripsi: it.deskripsi, qty: Number(it.qty) || 0, harga: Number(it.harga) || 0 })),
    Number(form.pajakPersen) || 0,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fieldErrors: Record<string, boolean> = {
      klienNama: !form.klienNama.trim(),
      tanggal: !form.tanggal,
    }
    form.items.forEach((it, i) => {
      fieldErrors[`item-${i}`] = !it.deskripsi.trim() || Number(it.qty) <= 0 || Number(it.harga) < 0
    })
    if (Object.values(fieldErrors).some(Boolean)) {
      setErrors(fieldErrors)
      toast.error("Ada isian wajib yang belum benar. Cek bagian bertanda merah.")
      return
    }
    setErrors({})
    setSaving(true)

    try {
      const payload = {
        klienNama: form.klienNama, klienEmail: form.klienEmail || null,
        klienTelepon: form.klienTelepon || null, klienAlamat: form.klienAlamat || null,
        judul: form.judul || null, tanggal: form.tanggal,
        jatuhTempo: form.jatuhTempo || null,
        bahasa: form.bahasa, mataUang: form.mataUang,
        items: form.items.map(it => ({
          deskripsi: it.deskripsi, qty: Number(it.qty) || 0, harga: Number(it.harga) || 0,
        })),
        pajakLabel: form.pajakLabel || null, pajakPersen: Number(form.pajakPersen) || 0,
        catatan: form.catatan || null, status: form.status,
        paymentAccountId: form.paymentAccountId ? Number(form.paymentAccountId) : null,
      }
      const url = mode === "create" ? "/api/invoice" : `/api/invoice/${id}`
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(mode === "create" ? "Invoice dibuat!" : "Invoice diperbarui!")
        router.push("/admin/invoice")
        router.refresh()
      } else {
        toast.error(data.error || "Gagal menyimpan invoice")
      }
    } catch {
      toast.error("Terjadi kesalahan server.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><AirplaneLoader size={48} /></div>

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 shrink-0">
            <Link href="/admin/invoice"><ArrowLeft size={18} /></Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === "create" ? "Buat Invoice" : `Edit ${nomor ?? "Invoice"}`}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "create"
                ? "Nomor invoice dibuat otomatis saat disimpan."
                : "Nomor invoice tidak berubah saat disunting."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {token && form.status !== "draft" && form.status !== "batal" && (
            <Button asChild variant="outline">
              <Link href={`/invoice/${token}`} target="_blank">Lihat</Link>
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={saving} className="flex-1 sm:flex-none">
            {saving ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
            Simpan
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Ditagihkan Kepada</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="klienNama">Nama Klien *</Label>
                <Input id="klienNama" placeholder="Nama lengkap klien" value={form.klienNama}
                  aria-invalid={!!errors.klienNama}
                  onChange={e => { set("klienNama", e.target.value); clearError("klienNama") }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="klienTelepon">No. WhatsApp</Label>
                <Input id="klienTelepon" placeholder="+62..." value={form.klienTelepon}
                  onChange={e => set("klienTelepon", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="klienEmail">Email</Label>
                <Input id="klienEmail" placeholder="klien@contoh.com" value={form.klienEmail}
                  onChange={e => set("klienEmail", e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="klienAlamat">Alamat</Label>
                <Textarea id="klienAlamat" rows={2} placeholder="Alamat penagihan" value={form.klienAlamat}
                  onChange={e => set("klienAlamat", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Item Invoice *</CardTitle>
              <CardDescription>Jumlah per baris dihitung otomatis dari Qty × Harga.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.items.map((it, i) => (
                <div key={i}
                  className={`grid grid-cols-12 gap-2 items-start rounded-xl p-3 ${errors[`item-${i}`] ? "ring-2 ring-destructive" : "bg-muted/20"}`}>
                  <div className="col-span-12 sm:col-span-5 space-y-1">
                    <Label className="text-xs sm:hidden">Deskripsi</Label>
                    <Input placeholder="Deskripsi item" value={it.deskripsi}
                      onChange={e => ubahItem(i, "deskripsi", e.target.value)} />
                  </div>
                  <div className="col-span-3 sm:col-span-2 space-y-1">
                    <Label className="text-xs sm:hidden">Qty</Label>
                    <Input type="number" min="0.01" step="any" value={it.qty}
                      onChange={e => ubahItem(i, "qty", e.target.value)} />
                  </div>
                  <div className="col-span-5 sm:col-span-3 space-y-1">
                    <Label className="text-xs sm:hidden">Harga</Label>
                    <Input type="text" inputMode="decimal" value={formatMoneyInput(it.harga)}
                      onChange={e => ubahItem(i, "harga", parseMoneyInput(e.target.value))} />
                  </div>
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1 pt-1">
                    <span className="text-sm font-medium tabular-nums truncate">
                      {formatUang((Number(it.qty) || 0) * (Number(it.harga) || 0), form.mataUang)}
                    </span>
                    {form.items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                        aria-label={`Hapus item ${i + 1}`}
                        onClick={() => setForm(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full border-dashed"
                onClick={() => setForm(p => ({ ...p, items: [...p.items, { ...ITEM_KOSONG }] }))}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Item
              </Button>

              <div className="border-t pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatUang(angka.subtotal, form.mataUang)}</span></div>
                {Number(form.pajakPersen) > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">{form.pajakLabel || `Pajak ${form.pajakPersen}%`}</span>
                    <span className="tabular-nums">{formatUang(angka.pajakNominal, form.mataUang)}</span></div>
                )}
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Total</span><span className="tabular-nums">{formatUang(angka.total, form.mataUang)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea rows={4} placeholder="Syarat pembayaran, catatan untuk klien..." value={form.catatan}
                onChange={e => set("catatan", e.target.value)} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Status & Tanggal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="terkirim">Terkirim</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="batal">Batal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Draft & Batal tidak bisa dibuka lewat tautan publik.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal Invoice *</Label>
                <Input id="tanggal" type="date" value={form.tanggal}
                  aria-invalid={!!errors.tanggal}
                  onChange={e => { set("tanggal", e.target.value); clearError("tanggal") }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jatuhTempo">Jatuh Tempo</Label>
                <Input id="jatuhTempo" type="date" value={form.jatuhTempo}
                  onChange={e => set("jatuhTempo", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Dokumen & Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mata Uang</Label>
                <Select value={form.mataUang} onValueChange={v => set("mataUang", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bahasa Dokumen</Label>
                <Select value={form.bahasa} onValueChange={v => set("bahasa", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Akun Pembayaran</Label>
                <Select value={form.paymentAccountId} onValueChange={v => set("paymentAccountId", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih akun pembayaran" /></SelectTrigger>
                  <SelectContent>
                    {akunList.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.label} — {a.bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {akunList.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Belum ada akun. Tambahkan di menu <Link href="/admin/invoice/akun-pembayaran" className="underline">Akun Pembayaran</Link>.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pajakLabel">Label Pajak</Label>
                  <Input id="pajakLabel" placeholder="PPN 11%" value={form.pajakLabel}
                    onChange={e => set("pajakLabel", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pajakPersen">Pajak (%)</Label>
                  <Input id="pajakPersen" type="number" min="0" max="100" step="0.01" value={form.pajakPersen}
                    onChange={e => set("pajakPersen", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Dokumen</Label>
                <Input id="judul" placeholder="Paket Eropa Barat 10 Hari" value={form.judul}
                  onChange={e => set("judul", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
