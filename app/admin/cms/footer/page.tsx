"use client"

import { useState, useEffect, useRef } from 'react'
import { useUnsavedGuardSnapshot } from '@/hooks/use-unsaved-guard'
import { toast } from 'react-hot-toast'
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { FontControls } from "@/components/ui/font-size-picker"
import { sanitizeHtml } from "@/lib/sanitize"
import {
  DEFAULT_FOOTER_SOCIALS,
  DEFAULT_PAYMENT_BADGES,
  FOOTER_SOCIAL_PLATFORMS,
  type FooterSocial,
  taglineToHtml,
  taglineToStars,
} from "@/lib/footer-settings"

export default function FooterCMSPage() {
  const [data, setData] = useState<any>({
    eyebrow: '', eyebrow_en: '',
    tagline: '', tagline_en: '',
    desc: '', desc_en: '',
    waButton: '', waButton_en: '',
    menuTitle: '', menuTitle_en: '',
    contactTitle: '', contactTitle_en: '',
    paymentTitle: '', paymentTitle_en: '',
    copyright: '', copyright_en: '',
  })
  // Dua daftar ini tidak per-bahasa (nama akun & merek pembayaran sama saja),
  // jadi disimpan di state terpisah dari field teks yang ber-tab ID/EN.
  const [socials, setSocials] = useState<FooterSocial[]>(DEFAULT_FOOTER_SOCIALS)
  const [badges, setBadges] = useState<string[]>(DEFAULT_PAYMENT_BADGES)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const [isScrolled, setIsScrolled] = useState(false)

  // Penjaga perubahan belum-disimpan (data + sosial + badge pembayaran).
  const snapshot = JSON.stringify({ data, socials, badges })
  const snapRef = useRef(snapshot)
  snapRef.current = snapshot
  const { setBaseline } = useUnsavedGuardSnapshot(snapshot)
  useEffect(() => { if (!fetching) setBaseline(snapRef.current) }, [fetching, setBaseline])
  const topHeaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = topHeaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(!entry.isIntersecting)
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetching])

  useEffect(() => {
    fetch('/api/settings/footer')
      .then(res => res.json())
      .then(res => {
        if (!res.error) {
          const { socials: s, paymentBadges: b, ...rest } = res
          // Tagline lama ber-<strong> ditampilkan dalam format standar *bintang*.
          for (const k of ['tagline', 'tagline_en']) {
            if (typeof rest[k] === 'string') rest[k] = taglineToStars(rest[k])
          }
          setData((prev: any) => ({ ...prev, ...rest }))
          if (Array.isArray(s) && s.length) setSocials(s)
          if (Array.isArray(b) && b.length) setBadges(b)
        }
        setFetching(false)
      })
      .catch(() => {
        setFetching(false)
        toast.error('Gagal memuat data')
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...data,
        socials: socials
          .map(s => ({ platform: s.platform, label: s.label.trim(), url: s.url.trim() }))
          .filter(s => s.url),
        paymentBadges: badges.map(b => b.trim()).filter(Boolean),
      }
      const res = await fetch('/api/settings/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setBaseline(snapRef.current) // tandai bersih setelah simpan
        toast.success('Footer berhasil diperbarui!')
      } else {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error || 'Gagal menyimpan.')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Pola sama dengan CMS Beranda/Tentang: badge bahasa aktif, Font Weight +
  // Font Size (disimpan `${field}Weight/Size`, berlaku ID & EN), dan live preview
  // untuk teks ber-sorotan (`*bintang*` = kata kuning, sama dengan CMS lain).
  const renderTextInput = (
    label: string,
    fieldName: string,
    opts: { textarea?: boolean; placeholder?: string; hint?: string; defaultWeight?: string; preview?: boolean } = {},
  ) => {
    const { textarea = false, placeholder = '', hint = '', defaultWeight = '400', preview = false } = opts
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName
    const weightField = `${fieldName}Weight`
    const sizeField = `${fieldName}Size`
    const selectedWeight = data[weightField] ? Number(data[weightField]) : undefined
    const selectedSize = data[sizeField] ? Number(data[sizeField]) : undefined
    // Placeholder = teks yang BENAR-BENAR muncul bila kolom dikosongkan. Di tab
    // EN itu berarti nilai Indonesia lebih dulu (lihat fs() di
    // components/Footer/Footer.tsx), baru default kamus.
    const effectivePlaceholder = activeTab === 'en' ? data[fieldName] || placeholder : placeholder
    const previewValue = String(data[activeFieldName] || effectivePlaceholder || '')
    const weightStyle = selectedWeight ? { fontWeight: selectedWeight } : undefined

    return (
      <div className="space-y-3 p-3.5 rounded-xl border border-border/60 bg-muted/10 shadow-xs">
        <div className="space-y-2">
          <Label className="flex items-center justify-between gap-2 text-sm font-semibold">
            <span>{label}</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              {activeTab}
            </span>
          </Label>
          {textarea ? (
            <Textarea name={activeFieldName} value={data[activeFieldName] || ''} onChange={handleChange} placeholder={effectivePlaceholder} rows={3} style={weightStyle} />
          ) : (
            <Input type="text" name={activeFieldName} value={data[activeFieldName] || ''} onChange={handleChange} placeholder={effectivePlaceholder} style={weightStyle} />
          )}
          {hint && <p className="text-[11px] text-muted-foreground italic">{hint}</p>}
        </div>

        {preview && previewValue && (
          <div className="relative p-3 rounded-lg bg-[#054569] border border-white/10 overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFC704]/15 text-[#FFC704] border border-[#FFC704]/25 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC704] animate-pulse" />
              Live Preview
            </span>
            <p
              className="mt-2 text-white leading-snug break-words [&_strong]:text-[#FFC704]"
              style={{ fontWeight: selectedWeight || Number(defaultWeight), ...(selectedSize ? { fontSize: selectedSize } : {}) }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(taglineToHtml(previewValue)) }}
            />
          </div>
        )}

        <div className="pt-2 border-t border-border/40">
          <FontControls
            weightValue={data[weightField]}
            onWeightChange={(val) => setData((prev: Record<string, unknown>) => ({ ...prev, [weightField]: val }))}
            sizeValue={data[sizeField]}
            onSizeChange={(val) => setData((prev: Record<string, unknown>) => ({ ...prev, [sizeField]: val }))}
            defaultWeight={defaultWeight}
          />
        </div>
      </div>
    )
  }

  const updateSocial = (index: number, patch: Partial<FooterSocial>) => {
    setSocials(prev => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const moveSocial = (index: number, delta: number) => {
    setSocials(prev => {
      const next = [...prev]
      const target = index + delta
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  if (fetching) {
    return (
      <div className="flex h-full min-h-[500px] w-full items-center justify-center">
        <AirplaneLoader size={48} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div ref={topHeaderRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">CMS Footer</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola isi footer: kolom brand, judul kolom, kontak & sosial media, mitra pembayaran, dan copyright.</p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold rounded-full px-6 shadow-xs cursor-pointer transition-all text-white"
          style={{ color: '#ffffff' }}
        >
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          Simpan Perubahan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'id' | 'en')}>
        <TabsList className="w-fit">
          <TabsTrigger value="id" className="gap-2 px-4">
            <img src="/flags/id.png" alt="ID" width={20} height={15} className="rounded-xs object-cover" />
            Indonesia
          </TabsTrigger>
          <TabsTrigger value="en" className="gap-2 px-4">
            <img src="/flags/en.png" alt="EN" width={20} height={15} className="rounded-xs object-cover" />
            English
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'en' && (
        <p className="-mt-3 text-[11px] text-muted-foreground italic">
          Kolom yang dibiarkan kosong otomatis memakai teks Indonesia. Tautan sosial
          media & badge pembayaran dipakai bersama oleh kedua bahasa.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">Kolom Brand</CardTitle>
            <CardDescription>Bagian kiri footer: label kecil, tagline, deskripsi, dan tombol WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {renderTextInput('Eyebrow (label kecil kuning)', 'eyebrow', { placeholder: 'Spesialis Trip Eropa', defaultWeight: '700' })}
              {renderTextInput('Teks Tombol WhatsApp', 'waButton', { placeholder: 'Chat WhatsApp', defaultWeight: '700', hint: 'Nomor diambil dari Pengaturan → Nomor WhatsApp. Kosongkan nomor di sana untuk menyembunyikan tombol.' })}
              <div className="sm:col-span-2">
                {renderTextInput('Tagline', 'tagline', { textarea: true, preview: true, defaultWeight: '700', placeholder: 'Mau Jalan tapi Wacana Doang? *Agendain aja!*', hint: 'Apit kata dengan *bintang* untuk warna kuning.' })}
              </div>
              <div className="sm:col-span-2">
                {renderTextInput('Deskripsi Singkat', 'desc', { textarea: true, placeholder: 'Travel agency digital terpercaya untuk perjalanan Anda dari Indonesia ke Eropa.' })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">Kolom Navigasi & Hubungi Kami</CardTitle>
            <CardDescription>Judul dua kolom tengah footer. Isi menu navigasi otomatis; isi kontak diatur di kartu berikutnya.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {renderTextInput('Judul Kolom Navigasi', 'menuTitle', { placeholder: 'Menu Utama', defaultWeight: '700' })}
              {renderTextInput('Judul Kolom Kontak', 'contactTitle', { placeholder: 'Hubungi', defaultWeight: '700' })}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">Kontak & Sosial Media</CardTitle>
            <CardDescription>Email, WhatsApp &amp; Telepon tampil di kolom &quot;Hubungi&quot;; platform lain (Instagram, YouTube, dll.) jadi tombol ikon di baris atas footer.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {socials.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Belum ada tautan. Footer akan memakai daftar bawaan.</p>
            )}
            {socials.map((social, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[170px_1fr_1fr_auto] items-end p-3.5 rounded-xl border border-border/60 bg-muted/10">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Platform (ikon)</Label>
                  <Select value={social.platform} onValueChange={(val) => updateSocial(i, { platform: val })}>
                    <SelectTrigger><SelectValue placeholder="Pilih platform" /></SelectTrigger>
                    <SelectContent>
                      {FOOTER_SOCIAL_PLATFORMS.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Teks yang tampil</Label>
                  <Input value={social.label} onChange={(e) => updateSocial(i, { label: e.target.value })} placeholder="@agendain.id" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tautan</Label>
                  <Input value={social.url} onChange={(e) => updateSocial(i, { url: e.target.value })} placeholder="https://instagram.com/agendain.id" />
                </div>
                <div className="flex items-center gap-1 pb-0.5">
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => moveSocial(i, -1)} disabled={i === 0} title="Naikkan">
                    <ArrowUp size={16} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => moveSocial(i, 1)} disabled={i === socials.length - 1} title="Turunkan">
                    <ArrowDown size={16} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => setSocials(prev => prev.filter((_, idx) => idx !== i))} title="Hapus">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => setSocials(prev => [...prev, { platform: 'link', label: '', url: '' }])}
            >
              <Plus size={16} /> Tambah Tautan
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">Mitra Pembayaran</CardTitle>
            <CardDescription>Judul dan teks pada kotak-kotak di baris pembayaran.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {renderTextInput('Judul Baris Pembayaran', 'paymentTitle', { placeholder: 'Payment Partners', defaultWeight: '700' })}
            </div>
            <Label className="text-sm font-semibold">Badge Pembayaran</Label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={badge}
                    onChange={(e) => setBadges(prev => prev.map((b, idx) => (idx === i ? e.target.value : b)))}
                    placeholder="Visa"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive hover:text-destructive" onClick={() => setBadges(prev => prev.filter((_, idx) => idx !== i))} title="Hapus">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" className="rounded-full gap-2" onClick={() => setBadges(prev => [...prev, ''])}>
              <Plus size={16} /> Tambah Badge
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">Baris Bawah</CardTitle>
            <CardDescription>Teks copyright di bagian paling bawah footer.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {renderTextInput('Teks Copyright', 'copyright', { placeholder: 'Semua hak dilindungi.', hint: 'Tahun & nama situs ditambahkan otomatis di depannya.' })}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Apple / macOS-style Frosted Glass Floating Pill Dock */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar ${
          isScrolled ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1 bg-black/[0.05] dark:bg-white/[0.08] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('id')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
              activeTab === 'id'
                ? 'bg-white dark:bg-zinc-800 text-foreground font-bold shadow-sm ring-1 ring-black/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <img src="/flags/id.png" alt="ID" width={16} height={12} className="rounded-2xs object-cover shrink-0" />
            <span>ID</span>
            <span className="hidden sm:inline">Indonesia</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
              activeTab === 'en'
                ? 'bg-white dark:bg-zinc-800 text-foreground font-bold shadow-sm ring-1 ring-black/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <img src="/flags/en.png" alt="EN" width={16} height={12} className="rounded-2xs object-cover shrink-0" />
            <span>EN</span>
            <span className="hidden sm:inline">English</span>
          </button>
        </div>

        <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 shrink-0 my-auto hidden sm:block" />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          style={{ color: '#ffffff' }}
        >
          {loading ? (
            <AirplaneLoader size={16} className="text-white shrink-0 animate-spin" />
          ) : (
            <Save size={16} className="shrink-0" />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>
    </div>
  )
}
