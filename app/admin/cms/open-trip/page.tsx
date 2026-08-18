"use client"

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Save, Globe } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { MediaPicker } from "@/components/ui/media-picker"
import { FontWeightPicker } from "@/components/ui/font-weight-picker"

export default function OpenTripCMSPage() {
  const [data, setData] = useState<any>({
    heroTitle: '', heroTitle_en: '', heroTitleWeight: '800',
    heroSubtitle: '', heroSubtitle_en: '', heroSubtitleWeight: '500',
    heroImage: '',
    packagesTitle: '', packagesTitle_en: '', packagesTitleWeight: '800',
    packagesSubtitle: '', packagesSubtitle_en: '', packagesSubtitleWeight: '500',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const [isScrolled, setIsScrolled] = useState(false)
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
    fetch('/api/settings/open-trip')
      .then(res => res.json())
      .then(res => {
        if (!res.error) {
          setData((prev: any) => ({ ...prev, ...res }))
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
      const res = await fetch('/api/settings/open-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        toast.success('Konten berhasil diperbarui!')
      } else {
        toast.error('Gagal menyimpan.')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const renderLivePreview = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*[^*]+\*)/g);
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
            const innerText = part.slice(1, -1);
            return (
              <span 
                key={idx} 
                className="inline-block font-extrabold px-1.5 py-0.5 mx-0.5 rounded bg-amber-400/20 text-[#FFC704] border border-[#FFC704]/40 shadow-[0_0_12px_rgba(255,199,4,0.25)] transition-all duration-300 transform scale-[1.02]"
              >
                {innerText}
              </span>
            );
          }
          return <span key={idx} className="text-slate-100">{part}</span>;
        })}
      </>
    );
  };

  const renderImageInput = (label: string, fieldName: string, placeholder = '', resolutionHint = '') => {
    const activeFieldName = fieldName; 
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          {label}
        </Label>
        {resolutionHint && (
          <p className="text-[11px] text-muted-foreground mt-0 mb-2 font-medium italic">
            💡 Resolusi yang disarankan: <span className="font-bold text-slate-700">{resolutionHint}</span>
          </p>
        )}
        <MediaPicker 
          value={data[activeFieldName] || ''}
          onChange={(url) => setData((prev: any) => ({ ...prev, [activeFieldName]: url }))}
          label="Pilih Gambar"
          description={placeholder ? `Disarankan seperti: ${placeholder}` : undefined}
        />
      </div>
    )
  }

  const renderTextInput = (label: string, fieldName: string, isTextarea = false, placeholder = '', enableWeight = false, defaultWeight = "400") => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    const weightField = `${fieldName}Weight`;
    const selectedWeight = data[weightField] ? Number(data[weightField]) : undefined;
    const isTitleOrHighlight = label.includes('*') || label.toLowerCase().includes('kuning') || fieldName.includes('Title') || (data[activeFieldName] && String(data[activeFieldName]).includes('*'));

    return (
      <div className="space-y-3 p-3.5 rounded-xl border border-border/60 bg-muted/10 shadow-xs">
        <div className="space-y-2">
          <Label className="flex items-center justify-between gap-2 text-sm font-semibold">
            <span>{label}</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              {activeTab}
            </span>
          </Label>
          {isTextarea ? (
            <Textarea 
              name={activeFieldName} 
              value={data[activeFieldName] || ''} 
              onChange={handleChange} 
              placeholder={placeholder}
              rows={3}
              style={enableWeight && selectedWeight ? { fontWeight: selectedWeight } : undefined}
            />
          ) : (
            <Input 
              type="text" 
              name={activeFieldName} 
              value={data[activeFieldName] || ''} 
              onChange={handleChange} 
              placeholder={placeholder}
              style={enableWeight && selectedWeight ? { fontWeight: selectedWeight } : undefined}
            />
          )}
        </div>
        
        {isTitleOrHighlight && data[activeFieldName] && (
          <div className="relative mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-between gap-3 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFC704] to-amber-600 rounded-l-lg opacity-80" />
            <div className="flex flex-col gap-1 w-full pl-1">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFC704]/10 text-[#FFC704] border border-[#FFC704]/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFC704] animate-pulse"></span>
                  Live Preview
                </span>
                {!String(data[activeFieldName]).includes('*') && (
                  <span className="text-[11px] text-slate-400 italic">
                    Tips: Apit kata dengan <code className="text-[#FFC704] bg-slate-900 px-1 py-0.5 rounded font-bold">*bintang*</code> untuk warna kuning
                  </span>
                )}
              </div>
              <div 
                className="text-base font-bold text-slate-100 mt-1 pl-1 pr-2 tracking-tight leading-relaxed break-words"
                style={enableWeight && selectedWeight ? { fontWeight: selectedWeight } : undefined}
              >
                {renderLivePreview(String(data[activeFieldName]))}
              </div>
            </div>
          </div>
        )}

        {enableWeight && (
          <div className="pt-2 border-t border-border/40">
            <FontWeightPicker
              value={data[weightField]}
              onChange={(val) => setData((prev: any) => ({ ...prev, [weightField]: val }))}
              defaultWeight={defaultWeight}
            />
          </div>
        )}
      </div>
    )
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">CMS Open Trip</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola teks untuk halaman Open Trip Eropa.</p>
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

      <div className="flex gap-2">
        <Button 
          type="button"
          variant={activeTab === 'id' ? 'default' : 'outline'}
          onClick={() => setActiveTab('id')}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img src="/flags/id.png" alt="ID" width={20} height={15} className="rounded-xs object-cover" /> 
          Indonesia
        </Button>
        <Button 
          type="button"
          variant={activeTab === 'en' ? 'default' : 'outline'}
          onClick={() => setActiveTab('en')}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img src="/flags/en.png" alt="EN" width={20} height={15} className="rounded-xs object-cover" /> 
          English
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
          
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-lg text-primary">Teks Utama (Hero)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  {renderImageInput('Gambar Latar Belakang (Hero Image)', 'heroImage', '/dest-swiss.webp', '1920x1080 px (Landscape)')}
                </div>
                <div className="space-y-4 flex flex-col justify-start">
                  {renderTextInput('Judul Utama (*Highlight Kuning*)', 'heroTitle', false, 'Eksplorasi Eropa *Lebih Seru* Bareng Teman Baru', true, '800')}
                  {renderTextInput('Sub-Judul (Deskripsi)', 'heroSubtitle', true, 'Gabung di Open Trip Agendain...', true, '500')}
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg text-primary">Teks Daftar Paket</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6">
                {renderTextInput('Judul Daftar Paket (*Highlight Kuning*)', 'packagesTitle', false, 'Pilih *Destinasi* Open Trip Kamu', true, '800')}
                {renderTextInput('Deskripsi Daftar Paket', 'packagesSubtitle', true, 'Beragam pilihan rute menarik...', true, '500')}
              </CardContent>
            </Card>

            <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-lg text-primary">Banner Promo (Bawah)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6">
                {renderTextInput('Label Kecil di Atas', 'ctaLabel', false, 'Penawaran Spesial')}
                {renderTextInput('Baris 1: Judul Utama (*Kuning*)', 'ctaTitle', false, 'Booking Sekarang', true, '800')}
                {renderTextInput('Baris 2: Sub-Judul (Opsional)', 'ctaSubtitle', true, 'Amankan kursi Anda sebelum kehabisan.', true, '500')}
                {renderTextInput('Teks Tombol Primary', 'ctaBtnText', false, 'Chat Whatsapp Sekarang')}
              </CardContent>
            </Card>

        </form>

      {/* Apple / macOS-style Frosted Glass Floating Pill Dock */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar ${
          isScrolled ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        {/* Language Segmented Toggle Container */}
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

        {/* Separator */}
        <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 shrink-0 my-auto hidden sm:block" />

        {/* Action Trigger */}
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
