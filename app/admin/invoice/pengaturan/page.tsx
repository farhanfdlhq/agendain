"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MediaPicker } from "@/components/ui/media-picker"
import AirplaneLoader from "@/components/ui/airplane-loader"

// Bentuknya sengaja cermin InvoiceSettingsSchema di lib/security.ts — kalau
// menambah field, tambahkan di kedua tempat.
const KOSONG = {
  namaLegal: "",
  alamat: "",
  telepon: "",
  email: "",
  website: "",
  npwp: "",
  logo: "",
  tandaTangan: "",
  penandaTanganNama: "",
  penandaTanganJabatan: "",
  prefixNomor: "INV",
  pajakLabel: "PPN 11%",
  pajakPersen: 11,
  terminHari: 7,
  catatanDefault: "",
  tampilkanPadanan: true,
}

export default function PengaturanInvoicePage() {
  const [form, setForm] = useState(KOSONG)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings/invoice")
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setForm(prev => ({ ...prev, ...data })))
      .catch(() => toast.error("Gagal memuat pengaturan invoice."))
      .finally(() => setFetching(false))
  }, [])

  const set = (key: keyof typeof KOSONG, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/settings/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Input number mengembalikan string; server memakai z.coerce tetapi
          // dikirim sebagai angka agar payloadnya jujur.
          pajakPersen: Number(form.pajakPersen) || 0,
          terminHari: Number(form.terminHari) || 0,
        }),
      })
      const data = await res.json()
      if (res.ok) toast.success("Pengaturan invoice tersimpan")
      else toast.error(data.error || "Gagal menyimpan")
    } catch {
      toast.error("Gagal terhubung ke server.")
    } finally {
      setSaving(false)
    }
  }

  if (fetching) {
    return <div className="flex h-64 items-center justify-center"><AirplaneLoader size={48} /></div>
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Invoice</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Identitas yang tercetak di kop invoice dan nilai bawaan untuk invoice baru.
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto">
          {saving ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="border-b-2 border-border pb-5 mb-5">
            <CardTitle>Identitas Perusahaan</CardTitle>
            <CardDescription>Muncul sebagai kop di bagian atas setiap invoice.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="namaLegal">Nama Legal Perusahaan</Label>
              <Input
                id="namaLegal"
                placeholder="PT Agendain Wisata Indonesia"
                value={form.namaLegal}
                onChange={e => set("namaLegal", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Boleh berbeda dari nama situs. Dikosongkan → memakai nama situs.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                rows={2}
                placeholder="Jl. Contoh No. 1, Jakarta Selatan 12345, Indonesia"
                value={form.alamat}
                onChange={e => set("alamat", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input id="telepon" placeholder="+62 812 3456 7890" value={form.telepon} onChange={e => set("telepon", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="billing@agendain.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://agendain.com" value={form.website} onChange={e => set("website", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="npwp">NPWP <span className="text-muted-foreground font-normal">Opsional</span></Label>
              <Input id="npwp" placeholder="01.234.567.8-901.000" value={form.npwp} onChange={e => set("npwp", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b-2 border-border pb-5 mb-5">
            <CardTitle>Logo & Tanda Tangan</CardTitle>
            <CardDescription>
              Logo invoice boleh berbeda dari logo situs — pakai versi gelap agar terbaca di kertas putih.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo Invoice</Label>
              <MediaPicker value={form.logo} onChange={url => set("logo", url)} label="Pilih logo" />
              <p className="text-xs text-muted-foreground">
                Dikosongkan → nama perusahaan tampil sebagai teks. Logo situs sengaja
                tidak dipakai di sini karena versinya putih dan akan hilang di kertas.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tanda Tangan / Stempel</Label>
              <MediaPicker value={form.tandaTangan} onChange={url => set("tandaTangan", url)} label="Pilih tanda tangan" />
              <p className="text-xs text-muted-foreground">PNG berlatar transparan paling rapi.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="penandaTanganNama">Nama Penanda Tangan</Label>
              <Input id="penandaTanganNama" placeholder="Dinda" value={form.penandaTanganNama} onChange={e => set("penandaTanganNama", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="penandaTanganJabatan">Jabatan</Label>
              <Input id="penandaTanganJabatan" placeholder="Finance Manager" value={form.penandaTanganJabatan} onChange={e => set("penandaTanganJabatan", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b-2 border-border pb-5 mb-5">
            <CardTitle>Bawaan Invoice Baru</CardTitle>
            <CardDescription>
              Hanya mengisi otomatis form invoice baru. Setelah invoice tersimpan, angkanya
              milik invoice itu sendiri dan tidak ikut berubah bila pengaturan ini diubah.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prefixNomor">Prefix Nomor</Label>
              <Input
                id="prefixNomor"
                placeholder="INV"
                value={form.prefixNomor}
                onChange={e => set("prefixNomor", e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Hasil: <span className="font-mono">{(form.prefixNomor || "INV")}/2026/08/0001</span>. Huruf, angka, dan tanda hubung saja.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="terminHari">Termin Bayar (hari)</Label>
              <Input
                id="terminHari"
                type="number"
                min={0}
                max={365}
                value={form.terminHari}
                onChange={e => set("terminHari", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Mengisi tanggal jatuh tempo otomatis.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pajakLabel">Label Pajak</Label>
              <Input id="pajakLabel" placeholder="PPN 11%" value={form.pajakLabel} onChange={e => set("pajakLabel", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pajakPersen">Persen Pajak (%)</Label>
              <Input
                id="pajakPersen"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.pajakPersen}
                onChange={e => set("pajakPersen", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Isi 0 → baris pajak tidak tercetak.</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="catatanDefault">Catatan / Syarat & Ketentuan</Label>
              <Textarea
                id="catatanDefault"
                rows={4}
                placeholder="Pembayaran dianggap sah setelah dana diterima. Bukti transfer mohon dikirim via WhatsApp."
                value={form.catatanDefault}
                onChange={e => set("catatanDefault", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b-2 border-border pb-5 mb-5">
            <CardTitle>Tampilan Dokumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="pr-4">
                <p className="font-medium text-sm">Tampilkan padanan mata uang</p>
                <p className="text-xs text-muted-foreground">
                  Menambahkan baris kecil di bawah total (mis. total IDR disertai perkiraan EUR) memakai kurs saat invoice diterbitkan.
                </p>
              </div>
              <Switch
                checked={!!form.tampilkanPadanan}
                onCheckedChange={v => set("tampilkanPadanan", v)}
                aria-label="Tampilkan padanan mata uang"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
