"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { ArrowLeft, Save, Plus, Trash2, Clock, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MediaPicker } from "@/components/ui/media-picker"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { hitungDurasi, formatMenit, formatDurasiPanjang } from "@/lib/itinerary"

type Aktivitas = { mulai: string; selesai: string; lokasi: string; catatan: string; gambar: string }
type Hari = { tanggal: string; items: Aktivitas[] }

const AKT_KOSONG: Aktivitas = { mulai: "", selesai: "", lokasi: "", catatan: "", gambar: "" }
const hariKosong = (): Hari => ({ tanggal: "", items: [{ ...AKT_KOSONG }] })
const hariIni = () => new Date().toISOString().slice(0, 10)

export default function ItineraryForm({ mode, id }: { mode: "create" | "edit"; id?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const clearError = (k: string) => setErrors(p => (p[k] ? { ...p, [k]: false } : p))
  const [token, setToken] = useState<string | null>(null)

  const [form, setForm] = useState({
    judul: "", bahasa: "id", status: "draft", tanggalDok: hariIni(),
    klienNama: "", klienNegara: "", klienTelepon: "", klienEmail: "",
    catatan: "",
    hari: [hariKosong()] as Hari[],
  })
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (mode !== "edit" || !id) return
    fetch(`/api/itinerary/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(it => {
        setToken(it.token)
        setForm({
          judul: it.judul ?? "", bahasa: it.bahasa ?? "id", status: it.status ?? "draft",
          tanggalDok: it.tanggalDok ? String(it.tanggalDok).slice(0, 10) : hariIni(),
          klienNama: it.klienNama ?? "", klienNegara: it.klienNegara ?? "",
          klienTelepon: it.klienTelepon ?? "", klienEmail: it.klienEmail ?? "",
          catatan: it.catatan ?? "",
          hari: Array.isArray(it.hari) && it.hari.length
            ? it.hari.map((h: Hari) => ({
                tanggal: h.tanggal ?? "",
                items: Array.isArray(h.items) && h.items.length
                  ? h.items.map((a: Aktivitas) => ({ ...AKT_KOSONG, ...a }))
                  : [{ ...AKT_KOSONG }],
              }))
            : [hariKosong()],
        })
        setLoading(false)
      })
      .catch(() => { toast.error("Gagal memuat itinerary"); router.push("/admin/itinerary") })
  }, [mode, id, router])

  // Helpers repeater
  const ubahHari = (di: number, patch: Partial<Hari>) =>
    setForm(p => { const hari = [...p.hari]; hari[di] = { ...hari[di], ...patch }; return { ...p, hari } })

  const ubahAkt = (di: number, ai: number, k: keyof Aktivitas, v: string) =>
    setForm(p => {
      const hari = [...p.hari]
      const items = [...hari[di].items]
      items[ai] = { ...items[ai], [k]: v }
      hari[di] = { ...hari[di], items }
      return { ...p, hari }
    })

  const tambahAkt = (di: number) =>
    setForm(p => {
      const hari = [...p.hari]
      const items = hari[di].items
      // Prefill jam mulai dari jam selesai aktivitas terakhir agar cepat.
      const jamMulai = items.length ? items[items.length - 1].selesai : ""
      hari[di] = { ...hari[di], items: [...items, { ...AKT_KOSONG, mulai: jamMulai }] }
      return { ...p, hari }
    })

  const hapusAkt = (di: number, ai: number) =>
    setForm(p => {
      const hari = [...p.hari]
      hari[di] = { ...hari[di], items: hari[di].items.filter((_, i) => i !== ai) }
      return { ...p, hari }
    })

  const totalMenitHari = (h: Hari) =>
    h.items.reduce((sum, a) => sum + (hitungDurasi(a.mulai, a.selesai) ?? 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fieldErrors: Record<string, boolean> = {
      judul: !form.judul.trim(),
      klienNama: !form.klienNama.trim(),
      tanggalDok: !form.tanggalDok,
    }
    if (Object.values(fieldErrors).some(Boolean)) {
      setErrors(fieldErrors)
      toast.error("Ada isian wajib yang belum benar. Cek bagian bertanda merah.")
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const payload = {
        judul: form.judul, bahasa: form.bahasa, status: form.status, tanggalDok: form.tanggalDok,
        klienNama: form.klienNama, klienNegara: form.klienNegara || null,
        klienTelepon: form.klienTelepon || null, klienEmail: form.klienEmail || null,
        catatan: form.catatan || null,
        hari: form.hari.map(h => ({
          tanggal: h.tanggal || "",
          items: h.items.map(a => ({
            mulai: a.mulai || "", selesai: a.selesai || "",
            lokasi: a.lokasi || "", catatan: a.catatan || "", gambar: a.gambar || "",
          })),
        })),
      }
      const url = mode === "create" ? "/api/itinerary" : `/api/itinerary/${id}`
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(mode === "create" ? "Itinerary dibuat!" : "Itinerary diperbarui!")
        router.push("/admin/itinerary")
        router.refresh()
      } else {
        toast.error(data.error || "Gagal menyimpan itinerary")
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
            <Link href="/admin/itinerary"><ArrowLeft size={18} /></Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === "create" ? "Buat Itinerary" : "Edit Itinerary"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Jadwal perjalanan per hari untuk klien.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {token && form.status === "published" && (
            <Button asChild variant="outline">
              <Link href={`/itinerary/${token}`} target="_blank">Lihat</Link>
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
              <CardTitle>Dibuat Untuk</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="klienNama">Nama Klien *</Label>
                <Input id="klienNama" placeholder="Nama klien" value={form.klienNama}
                  aria-invalid={!!errors.klienNama}
                  onChange={e => { set("klienNama", e.target.value); clearError("klienNama") }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="klienNegara">Negara</Label>
                <Input id="klienNegara" placeholder="Indonesia" value={form.klienNegara}
                  onChange={e => set("klienNegara", e.target.value)} />
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
            </CardContent>
          </Card>

          {form.hari.map((h, di) => {
            const total = totalMenitHari(h)
            return (
              <Card key={di}>
                <CardHeader className="border-b-2 border-border pb-5 mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle>Hari {di + 1}</CardTitle>
                      <Input type="date" value={h.tanggal} className="w-44"
                        onChange={e => ubahHari(di, { tanggal: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock size={14} /> {formatDurasiPanjang(total, form.bahasa)}
                      </span>
                      {form.hari.length > 1 && (
                        <Button type="button" variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          aria-label={`Hapus hari ${di + 1}`}
                          onClick={() => setForm(p => ({ ...p, hari: p.hari.filter((_, i) => i !== di) }))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {h.items.map((a, ai) => {
                    const durasi = hitungDurasi(a.mulai, a.selesai)
                    return (
                      <div key={ai} className="rounded-xl bg-muted/20 p-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Input type="time" value={a.mulai} className="w-28"
                            onChange={e => ubahAkt(di, ai, "mulai", e.target.value)} />
                          <span className="text-muted-foreground">–</span>
                          <Input type="time" value={a.selesai} className="w-28"
                            onChange={e => ubahAkt(di, ai, "selesai", e.target.value)} />
                          {durasi !== null && (
                            <span className="text-xs text-muted-foreground">({formatMenit(durasi, form.bahasa)})</span>
                          )}
                          <div className="ml-auto flex items-center gap-1">
                            <MediaPicker
                              value={a.gambar}
                              onChange={(url) => ubahAkt(di, ai, "gambar", url)}
                              trigger={
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Gambar (opsional)">
                                  {a.gambar
                                    ? /* eslint-disable-next-line @next/next/no-img-element */
                                      <img src={a.gambar} alt="" className="h-7 w-7 rounded object-cover" />
                                    : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                              }
                            />
                            {h.items.length > 1 && (
                              <Button type="button" variant="ghost" size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                aria-label="Hapus aktivitas"
                                onClick={() => hapusAkt(di, ai)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Input placeholder="Lokasi / aktivitas (mis. Paris, kunjungi Louvre)" value={a.lokasi}
                          onChange={e => ubahAkt(di, ai, "lokasi", e.target.value)} />
                        <Input placeholder="Catatan (opsional)" value={a.catatan} className="text-sm"
                          onChange={e => ubahAkt(di, ai, "catatan", e.target.value)} />
                      </div>
                    )
                  })}
                  <Button type="button" variant="outline" className="w-full border-dashed"
                    onClick={() => tambahAkt(di)}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Aktivitas
                  </Button>
                </CardContent>
              </Card>
            )
          })}

          <Button type="button" variant="secondary" className="w-full"
            onClick={() => setForm(p => ({ ...p, hari: [...p.hari, hariKosong()] }))}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Hari
          </Button>

          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea rows={3} placeholder="Catatan untuk klien..." value={form.catatan}
                onChange={e => set("catatan", e.target.value)} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Dokumen</CardTitle>
              <CardDescription>Draft & Arsip tidak bisa dibuka lewat tautan publik.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Dokumen *</Label>
                <Input id="judul" placeholder="Itinerary Keluarga Jhonson" value={form.judul}
                  aria-invalid={!!errors.judul}
                  onChange={e => { set("judul", e.target.value); clearError("judul") }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalDok">Tanggal Dokumen *</Label>
                <Input id="tanggalDok" type="date" value={form.tanggalDok}
                  aria-invalid={!!errors.tanggalDok}
                  onChange={e => { set("tanggalDok", e.target.value); clearError("tanggalDok") }} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Terbit</SelectItem>
                    <SelectItem value="archived">Arsip</SelectItem>
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
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
