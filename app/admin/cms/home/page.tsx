"use client"

import { useState, useEffect, useRef } from 'react'
import { useUnsavedGuardSnapshot } from '@/hooks/use-unsaved-guard'
import { toast } from 'react-hot-toast'
import { ArrowUp, ArrowDown, GripVertical, Save, Globe, Type, FolderOpen, Trash2, X, Plus } from 'lucide-react'
import { Reorder } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { useConfirm } from "@/components/Providers/ConfirmProvider"
import { MediaPicker } from "@/components/ui/media-picker"
import { FontControls } from "@/components/ui/font-size-picker"
import { foldLegacyRepeaters, HOME_REPEATERS } from "@/lib/i18n/localize"
import idDict from "@/lib/i18n/locales/id"
import enDict from "@/lib/i18n/locales/en"

// Teks yang dulu tetap di kode (tombol, label kecil, poin). Field yang belum
// pernah diisi diisikan teks yang sedang tampil saat CMS dimuat, agar admin
// mengedit isi nyata, bukan placeholder kosong. Situs tak berubah sampai disimpan.
function fillHomeDefaults(res: Record<string, unknown>) {
  const texts: Record<string, string> = {
    heroBtnWa: "home.hero.btnWa",
    heroBtnPack: "home.hero.btnPack",
    destEyebrow: "dest.subtitle",
    destTitle: "home.popularDest",
    destBtn: "home.exploreDest",
    testiBtnGallery: "home.testi.btnGallery",
    testiBtnWa: "home.testi.btnWa",
    accBadge: "home.acc.badge",
    accBtn: "home.viewAll",
    socialQuote: "home.social.quote",
    faqBadge: "home.faq.subtitle",
    faqCtaText: "home.faq.ctaText",
    faqBtnWa: "home.faq.btnWa",
  }
  for (const [field, key] of Object.entries(texts)) {
    if (!String(res[field] ?? "").trim()) res[field] = idDict[key]
    if (!String(res[`${field}_en`] ?? "").trim()) res[`${field}_en`] = enDict[key]
  }
  if (Array.isArray(res.testiHighlights)) {
    const idLines = res.testiHighlights.map((it: any) => {
      const txt = typeof it === 'string' ? it : (it?.text || '')
      return txt ? String(txt).trim() : ''
    }).filter(Boolean).join('\n')
    const enLines = res.testiHighlights.map((it: any) => {
      const txt = typeof it === 'string' ? it : (it?.text_en || it?.text || '')
      return txt ? String(txt).trim() : ''
    }).filter(Boolean).join('\n')
    res.testiHighlights = idLines
    if (!res.testiHighlights_en) res.testiHighlights_en = enLines
  }
  if (!String(res.testiHighlights ?? "").trim()) {
    res.testiHighlights = [
      idDict["home.testi.highlight1"],
      idDict["home.testi.highlight2"],
      idDict["home.testi.highlight3"],
    ].filter(Boolean).join("\n")
  }
  if (!String(res.testiHighlights_en ?? "").trim()) {
    res.testiHighlights_en = [
      enDict["home.testi.highlight1"],
      enDict["home.testi.highlight2"],
      enDict["home.testi.highlight3"],
    ].filter(Boolean).join("\n")
  }
}

export default function HomeCMSPage() {
  const [data, setData] = useState<any>({
    // Hero
    heroTitle: '', heroTitle_en: '',
    heroSubtitle: '', heroSubtitle_en: '',
    
    // Why
    whyTitleMain: '', whyTitleMain_en: '',
    whyTitleSub: '', whyTitleSub_en: '',
    whyBorderColor: '#f1f5f9',
    whyBorderWidth: '1.5px',

    // Destinations
    destEyebrow: '', destEyebrow_en: '',
    destTitle: '', destTitle_en: '',
    destBtn: '', destBtn_en: '',

    // Testimonial
    testiBadge: '', testiBadge_en: '',
    testiTitle: '', testiTitle_en: '',
    testiHighlights: '', testiHighlights_en: '',
    testiHighlightsWeight: '', testiHighlightsSize: '',
    heroBtnWa: '', heroBtnWa_en: '',
    heroBtnPack: '', heroBtnPack_en: '',
    accBadge: '', accBadge_en: '',
    accBtn: '', accBtn_en: '',
    faqBadge: '', faqBadge_en: '',
    faqCtaText: '', faqCtaText_en: '',
    faqBtnWa: '', faqBtnWa_en: '',
    testiBtnGallery: '', testiBtnGallery_en: '',
    testiBtnWa: '', testiBtnWa_en: '',

    // Accordion
    accTitle: '', accTitle_en: '',
    accSubtitle: '', accSubtitle_en: '',

    // Social Proof
    socialTitle: '', socialTitle_en: '',
    socialSubtitle: '', socialSubtitle_en: '',
    socialImage: '',
    socialQuote: '', socialQuote_en: '',

    // FAQ
    faqTitle: '', faqTitle_en: '',
    faqSubtitle: '', faqSubtitle_en: '',

    sectionOrder: 'hero,why,destinations,testimonial,accordion,socialproof,faq'
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const [isScrolled, setIsScrolled] = useState(false)

  // Penjaga perubahan belum-disimpan (baseline saat data awal termuat & setelah simpan).
  const snapshot = JSON.stringify(data)
  const snapRef = useRef(snapshot)
  snapRef.current = snapshot
  const { setBaseline } = useUnsavedGuardSnapshot(snapshot)
  useEffect(() => { if (!fetching) setBaseline(snapRef.current) }, [fetching, setBaseline])
  const topHeaderRef = useRef<HTMLDivElement>(null)

  const { showConfirm } = useConfirm()

  useEffect(() => {
    const el = topHeaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(!entry.isIntersecting)
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetching])

  const SECTION_NAMES: Record<string, string> = {
    'hero': 'Beranda Utama (Hero)',
    'why': 'Mengapa Memilih Kami',
    'destinations': 'Destinasi Favorit',
    'testimonial': 'Sudut Pandang (Testimonial)',
    'accordion': 'Lihat, Hirup, Simpan (Accordion)',
    'socialproof': 'Kutipan Pelanggan (Social Proof)',
    'faq': 'Tanya Jawab (FAQ)'
  }

  useEffect(() => {
    fetch('/api/settings/home')
      .then(res => res.json())
      .then(res => {
        if (!res.error) {
          // Fix for legacy database data
          if (res.sectionOrder) {
            if (!res.sectionOrder.includes('hero')) {
              res.sectionOrder = 'hero,' + res.sectionOrder
            }
            if (res.sectionOrder.includes('packages')) {
              res.sectionOrder = res.sectionOrder.replace('packages,', '').replace(',packages', '').replace('packages', '')
            }
          }
          // Data lama menyimpan repeater sebagai DUA array penuh
          // (whyItems + whyItems_en). Teks EN-nya dilipat ke dalam satu array
          // dan array warisannya dibuang, jadi simpanan berikutnya sudah
          // memakai bentuk baru. Tanpa ini gambar/ikon tetap beku per bahasa.
          foldLegacyRepeaters(res, HOME_REPEATERS)
          fillHomeDefaults(res)
          setData((prev: any) => ({ ...prev, ...res }))
        }
        setFetching(false)
      })
      .catch(() => {
        setFetching(false)
        toast.error('Gagal memuat data')
      })
  }, [])

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const order = (data.sectionOrder || 'hero,why,destinations,testimonial,accordion,socialproof,faq').split(',')
    if (direction === 'up' && index > 0) {
      const temp = order[index - 1]
      order[index - 1] = order[index]
      order[index] = temp
    } else if (direction === 'down' && index < order.length - 1) {
      const temp = order[index + 1]
      order[index + 1] = order[index]
      order[index] = temp
    }
    setData((prev: any) => ({ ...prev, sectionOrder: order.join(',') }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        setBaseline(snapRef.current) // tandai bersih setelah simpan
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

  const renderImageInput = (label: string, fieldName: string, placeholder = '', resolutionHint = '') => {
    // Sharing the exact same field across both languages for images
    const activeFieldName = fieldName; 
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          {label}
        </Label>
        {resolutionHint && (
          <p className="text-[11px] text-muted-foreground mt-0 mb-2 font-medium italic">
            Resolusi yang disarankan: <span className="font-bold text-slate-700">{resolutionHint}</span>
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

  const renderSectionOrder = () => {
    const orderArray = (data.sectionOrder || 'hero,why,destinations,testimonial,accordion,socialproof,faq').split(',')
    
    const handleReorder = (newOrder: string[]) => {
      setData((prev: any) => ({ ...prev, sectionOrder: newOrder.join(',') }))
    }

    return (
      <Card className="mt-8 border shadow-sm">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-lg">Urutan Bagian Beranda</CardTitle>
          <CardDescription>Seret kotak atau gunakan tombol panah untuk mengatur urutan bagian di beranda.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Reorder.Group axis="y" values={orderArray} onReorder={handleReorder} className="flex flex-col gap-2 list-none p-0 m-0">
            {orderArray.map((key: string, idx: number) => (
              <Reorder.Item key={key} value={key} className="relative cursor-grab" whileDrag={{ scale: 1.02, zIndex: 10 }}>
                <div className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <GripVertical size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground font-bold w-5">{idx + 1}.</span>
                    <span className="font-medium text-foreground">{SECTION_NAMES[key] || key}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="h-8 w-8"
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveSection(idx, 'down')}
                      disabled={idx === orderArray.length - 1}
                      className="h-8 w-8"
                    >
                      <ArrowDown size={16} />
                    </Button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </CardContent>
      </Card>
    )
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

  const renderCompactField = (
    label: string, 
    fieldName: string, 
    options?: { 
      isTextarea?: boolean; 
      rows?: number; 
      placeholder?: string; 
      enableWeight?: boolean; 
      defaultWeight?: string; 
      showLivePreview?: boolean;
    }
  ) => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    const weightField = `${fieldName}Weight`;
    const sizeField = `${fieldName}Size`;
    const val = data[activeFieldName] || '';
    const fallbackVal = activeTab === 'en' ? data[fieldName] || '' : '';
    const isTitleWithHighlight = options?.showLivePreview || label.includes('*') || (val && String(val).includes('*'));

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">{label}</Label>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
            {activeTab}
          </span>
        </div>
        {options?.isTextarea ? (
          <Textarea
            name={activeFieldName}
            value={val}
            onChange={handleChange}
            placeholder={options?.placeholder ? (activeTab === 'en' ? fallbackVal || options.placeholder : options.placeholder) : (activeTab === 'en' ? fallbackVal : undefined)}
            rows={options?.rows || 2}
            className={options?.rows ? undefined : "min-h-[58px]"}
            style={{
              ...(options?.enableWeight && data[weightField] ? { fontWeight: Number(data[weightField]) } : {}),
              ...(options?.enableWeight && data[sizeField] ? { fontSize: `${data[sizeField]}px` } : {})
            }}
          />
        ) : (
          <Input
            type="text"
            name={activeFieldName}
            value={val}
            onChange={handleChange}
            placeholder={options?.placeholder ? (activeTab === 'en' ? fallbackVal || options.placeholder : options.placeholder) : (activeTab === 'en' ? fallbackVal : undefined)}
            style={options?.enableWeight && data[weightField] ? { fontWeight: Number(data[weightField]) } : undefined}
          />
        )}

        {/* Compact Live Preview */}
        {isTitleWithHighlight && (val || fallbackVal) && (
          <div className="relative mt-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800/90 shadow-inner flex items-center justify-between gap-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFC704] to-amber-600 rounded-l-lg opacity-80" />
            <div className="flex items-center gap-2 pl-1 min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FFC704]/10 text-[#FFC704] border border-[#FFC704]/20 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC704] animate-pulse" />
                Live Preview
              </span>
              <div
                className="text-xs font-bold text-slate-100 truncate tracking-tight"
                style={{
                  fontWeight: Number(data[weightField] || options?.defaultWeight || 800),
                  ...(data[sizeField] ? { fontSize: `${data[sizeField]}px` } : {})
                }}
              >
                {renderLivePreview(String(val || fallbackVal))}
              </div>
            </div>
            {!String(val || fallbackVal).includes('*') && (
              <span className="text-[10px] text-slate-400 italic shrink-0 hidden sm:inline">
                Apit <code className="text-[#FFC704]">*kata*</code> untuk kuning
              </span>
            )}
          </div>
        )}

        {options?.enableWeight && (
          <div className="pt-1">
            <FontControls
              weightValue={data[weightField]}
              onWeightChange={(w) => setData((prev: any) => ({ ...prev, [weightField]: w }))}
              sizeValue={data[sizeField]}
              onSizeChange={(s) => setData((prev: any) => ({ ...prev, [sizeField]: s }))}
              defaultWeight={options?.defaultWeight || "400"}
            />
          </div>
        )}
      </div>
    );
  };

  const renderTextInput = (label: string, fieldName: string, isTextarea = false, placeholder = '', enableWeight = false, defaultWeight = "400") => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    const weightField = `${fieldName}Weight`;
    const sizeField = `${fieldName}Size`;
    const selectedWeight = data[weightField] ? Number(data[weightField]) : undefined;
    const selectedSize = data[sizeField] ? Number(data[sizeField]) : undefined;
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
              style={enableWeight ? { ...(selectedWeight ? { fontWeight: selectedWeight } : {}), ...(selectedSize ? { fontSize: selectedSize } : {}) } : undefined}
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
                style={enableWeight ? { ...(selectedWeight ? { fontWeight: selectedWeight } : {}), ...(selectedSize ? { fontSize: selectedSize } : {}) } : undefined}
              >
                {renderLivePreview(String(data[activeFieldName]))}
              </div>
            </div>
          </div>
        )}

        {enableWeight && (
          <div className="pt-2 border-t border-border/40">
            <FontControls
              weightValue={data[weightField]}
              onWeightChange={(val) => setData((prev: any) => ({ ...prev, [weightField]: val }))}
              sizeValue={data[sizeField]}
              onSizeChange={(val) => setData((prev: any) => ({ ...prev, [sizeField]: val }))}
              defaultWeight={defaultWeight}
            />
          </div>
        )}
      </div>
    )
  }

  // Gaya teks satu kelompok item daftar (mis. semua pertanyaan FAQ). Disimpan
  // sebagai `${fieldName}Weight/Size` tanpa _en: berlaku di ID & EN, dibaca
  // section depan lewat fontStyle(gs, fieldName).
  const renderGroupFont = (label: string, hint: string, fieldName: string, defaultWeight: string) => (
    <div className="space-y-3 p-3.5 rounded-xl border border-border/60 bg-muted/10 shadow-xs">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <FontControls
        weightValue={data[`${fieldName}Weight`]}
        onWeightChange={(val) => setData((prev: Record<string, unknown>) => ({ ...prev, [`${fieldName}Weight`]: val }))}
        sizeValue={data[`${fieldName}Size`]}
        onSizeChange={(val) => setData((prev: Record<string, unknown>) => ({ ...prev, [`${fieldName}Size`]: val }))}
        defaultWeight={defaultWeight}
      />
    </div>
  )

  const renderArrayEditor = (
    label: string, 
    fieldName: string, 
    fields: { name: string; label: string; isTextarea?: boolean; isImage?: boolean; enableWeight?: boolean; resolutionHint?: string }[]
  ) => {
    // Satu array dipakai kedua bahasa. Hanya nilai TEKS yang ikut tab aktif
    // (`title` / `title_en`); gambar & bobot huruf memakai kunci polos supaya
    // sekali diubah langsung berlaku di ID maupun EN. Lihat lib/i18n/localize.ts.
    const items = data[fieldName] || [];
    const textKey = (name: string) => (activeTab === 'en' ? `${name}_en` : name);

    const handleItemChange = (index: number, field: string, value: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setData((prev: any) => ({ ...prev, [fieldName]: newItems }));
    };

    const handleAddItem = () => {
      const newItem = fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});
      setData((prev: any) => ({ ...prev, [fieldName]: [...items, newItem] }));
    };

    const handleRemoveItem = (index: number) => {
      const newItems = items.filter((_: any, i: number) => i !== index);
      setData((prev: any) => ({ ...prev, [fieldName]: newItems }));
    };

    return (
      <div className="space-y-4 pt-4 border-t mt-4">
        <div>
          <Label className="flex items-center gap-2 font-bold text-base">
            {label}
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">{activeTab}</span>
          </Label>
        </div>
        
        {activeTab === 'en' && (
          <p className="text-[11px] text-muted-foreground italic -mt-2">
            Gambar & bobot huruf dipakai bersama oleh kedua bahasa. Teks yang dibiarkan kosong otomatis memakai versi Indonesia.
          </p>
        )}

        {items.length === 0 && (
          <div className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-lg text-center border border-dashed">
            Belum ada data kustom. Sistem menggunakan data bawaan (Default).
          </div>
        )}

        {/* 2 item per baris (2 kolom) mirip Langkah Cara Booking di Private Trip */}
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded-xl bg-card relative shadow-xs space-y-3">
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute top-3 right-3 h-6 w-6 rounded-full cursor-pointer z-10"
                onClick={() => handleRemoveItem(index)}
              >
                <X size={13} />
              </Button>
              <h4 className="text-sm font-semibold pr-8 text-slate-800">Item #{index + 1}</h4>
              <div className="space-y-3">
                {fields.map((f) => (
                  <div key={f.name} className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">{f.label}</Label>
                    {f.resolutionHint && (
                      <p className="text-[10px] text-muted-foreground mt-0 mb-1 font-medium italic">
                        Rekomendasi: <span className="font-bold text-slate-700">{f.resolutionHint}</span>
                      </p>
                    )}
                    {f.isImage ? (
                      <div className="space-y-3 items-start flex flex-col">
                        <MediaPicker
                          value={item[f.name] || ''}
                          onChange={(url) => handleItemChange(index, f.name, url)}
                          label="Pilih Media"
                        />
                      </div>
                    ) : f.isTextarea ? (
                      <Textarea
                        value={item[textKey(f.name)] || ''}
                        onChange={(e) => handleItemChange(index, textKey(f.name), e.target.value)}
                        placeholder={activeTab === 'en' ? item[f.name] || '' : undefined}
                        rows={3}
                        style={f.enableWeight && item[`${f.name}Weight`] ? { fontWeight: Number(item[`${f.name}Weight`]) } : undefined}
                      />
                    ) : (
                      <Input
                        value={item[textKey(f.name)] || ''}
                        onChange={(e) => handleItemChange(index, textKey(f.name), e.target.value)}
                        placeholder={activeTab === 'en' ? item[f.name] || '' : undefined}
                        style={f.enableWeight && item[`${f.name}Weight`] ? { fontWeight: Number(item[`${f.name}Weight`]) } : undefined}
                      />
                    )}
                    {f.enableWeight && (
                      <div className="pt-1">
                        <FontControls
                          weightValue={item[`${f.name}Weight`]}
                          onWeightChange={(val) => handleItemChange(index, `${f.name}Weight`, val)}
                          sizeValue={item[`${f.name}Size`]}
                          onSizeChange={(val) => handleItemChange(index, `${f.name}Size`, val)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="rounded-full h-8 text-xs">
            + Tambah Item
          </Button>
        </div>
      </div>
    );
  }

  const renderSplitArrayEditor = (
    label: string,
    fieldName: string,
    imageField: { name: string; label: string; resolutionHint: string },
    textFields: { name: string; label: string; isTextarea?: boolean; enableWeight?: boolean; placeholder?: string }[]
  ) => {
    // Satu array untuk kedua bahasa — lihat catatan di renderArrayEditor.
    const items = data[fieldName] || [];
    const textKey = (name: string) => (activeTab === 'en' ? `${name}_en` : name);

    const handleAddItem = () => {
      const newItem: any = { [imageField.name]: '' };
      textFields.forEach(f => { newItem[f.name] = ''; });
      setData((prev: any) => ({
        ...prev,
        [fieldName]: [...items, newItem]
      }));
    };

    const handleRemoveItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setData((prev: any) => ({
        ...prev,
        [fieldName]: newItems
      }));
    };

    const handleItemChange = (index: number, field: string, val: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: val };
      setData((prev: any) => ({
        ...prev,
        [fieldName]: newItems
      }));
    };

    return (
      <div className="space-y-4 pt-6 border-t mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Label className="flex items-center gap-2 font-bold text-base">
            {label}
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">{activeTab}</span>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
            <Plus size={16} /> Tambah Item
          </Button>
        </div>
        {activeTab === 'en' && (
          <p className="text-[11px] text-muted-foreground italic -mt-2">
            Foto & bobot huruf dipakai bersama oleh kedua bahasa. Teks yang dibiarkan kosong otomatis memakai versi Indonesia.
          </p>
        )}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center border border-dashed">
            Belum ada data ditambahkan.
          </div>
        )}
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded-xl bg-card relative shadow-sm">
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute top-3 right-3 h-6 w-6 rounded-full z-10"
                onClick={() => handleRemoveItem(index)}
              >
                <X size={14} />
              </Button>
              <h4 className="text-sm font-semibold mb-4">Item #{index + 1}</h4>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-xs">{imageField.label}</Label>
                  {imageField.resolutionHint && (
                    <p className="text-[10px] text-muted-foreground mt-0 mb-1 font-medium italic">
                      Rekomendasi: <span className="font-bold text-slate-700">{imageField.resolutionHint}</span>
                    </p>
                  )}
                  <MediaPicker 
                    value={item[imageField.name] || ''}
                    onChange={(url) => handleItemChange(index, imageField.name, url)}
                    label="Pilih Foto/Gambar"
                  />
                </div>
                
                <div className="space-y-4 flex flex-col justify-start">
                  {textFields.map((tf) => (
                    <div key={tf.name} className="space-y-1.5">
                      <Label className="text-xs">{tf.label}</Label>
                      {tf.isTextarea ? (
                        <Textarea
                          value={item[textKey(tf.name)] || ''}
                          onChange={(e) => handleItemChange(index, textKey(tf.name), e.target.value)}
                          className="min-h-[100px]"
                          placeholder={activeTab === 'en' ? item[tf.name] || tf.placeholder : tf.placeholder}
                          style={tf.enableWeight && item[`${tf.name}Weight`] ? { fontWeight: Number(item[`${tf.name}Weight`]) } : undefined}
                        />
                      ) : (
                        <Input
                          value={item[textKey(tf.name)] || ''}
                          onChange={(e) => handleItemChange(index, textKey(tf.name), e.target.value)}
                          placeholder={activeTab === 'en' ? item[tf.name] || tf.placeholder : tf.placeholder}
                          style={tf.enableWeight && item[`${tf.name}Weight`] ? { fontWeight: Number(item[`${tf.name}Weight`]) } : undefined}
                        />
                      )}
                      {tf.enableWeight && (
                        <div className="pt-1">
                          <FontControls
                            weightValue={item[`${tf.name}Weight`]}
                            onWeightChange={(val) => handleItemChange(index, `${tf.name}Weight`, val)}
                            sizeValue={item[`${tf.name}Size`]}
                            onSizeChange={(val) => handleItemChange(index, `${tf.name}Size`, val)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <AirplaneLoader size={32} className="text-primary" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div ref={topHeaderRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">CMS Halaman Beranda</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola teks dan warna untuk elemen-elemen di halaman depan.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Hero (Beranda Utama)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Kolom Kiri: Gambar Background */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold">URL Gambar Background</Label>
                  <p className="text-[10px] text-muted-foreground mt-0 mb-1 font-medium italic">
                    Rekomendasi: <span className="font-bold text-slate-700">1920x1080 px (Landscape)</span>
                  </p>
                </div>
                <MediaPicker 
                  value={data.heroBgImage || ''}
                  onChange={(url) => setData((prev: any) => ({ ...prev, heroBgImage: url }))}
                  label="Pilih Foto/Gambar"
                  description="Disarankan seperti: /hero-coastal.webp"
                />
              </div>

              {/* Kolom Kanan: Judul & Subtitle */}
              <div className="space-y-4 flex flex-col justify-start">
                {renderCompactField('Judul Utama (Gunakan *teks* untuk warna kuning)', 'heroTitle', { enableWeight: true, defaultWeight: '800' })}
                {renderCompactField('Teks Sub-judul (Subtitle)', 'heroSubtitle', { isTextarea: true, rows: 2, enableWeight: true, defaultWeight: '500' })}
              </div>
            </div>

            {/* Tombol Aksi (CTA) */}
            <div className="pt-4 border-t space-y-2.5">
              <Label className="text-xs font-semibold">Tombol Aksi (CTA)</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderCompactField('Tombol WhatsApp', 'heroBtnWa', { placeholder: 'Hubungi Kami Gratis!' })}
                {renderCompactField('Tombol ke Halaman Open Trip', 'heroBtnPack', { placeholder: 'Agendain Sekarang' })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Mengapa Memilih Kami</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              {renderTextInput('Eyebrow (Teks Kecil Atas)', 'whyTitleMain', false, '', true, '800')}
              {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'whyTitleSub', false, '', true, '800')}
            </div>
            <p className="text-xs text-muted-foreground">Catatan tata letak: Di situs web, keempat kartu menampilkan nomor dan judul secara default, dan deskripsi akan muncul saat kartu di-hover.</p>
            {renderSplitArrayEditor(
              'Kartu Keunggulan (Data Mengapa Memilih Kami)', 
              'whyItems', 
              { name: 'image', label: 'URL Ikon/Gambar (Kiri)', resolutionHint: '512x512 px (Square)' },
              [
                { name: 'title', label: 'Judul', enableWeight: true },
                { name: 'desc', label: 'Deskripsi Singkat', isTextarea: true, enableWeight: true }
              ]
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Destinasi Favorit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderCompactField('Eyebrow (Teks Kecil Atas)', 'destEyebrow', { enableWeight: true, defaultWeight: '500' })}
              {renderCompactField('Judul Utama (Gunakan *teks* untuk warna kuning)', 'destTitle', { enableWeight: true, defaultWeight: '800' })}
            </div>
            <div className="pt-4 border-t">
              <div className="max-w-md">
                {renderCompactField('Teks Tombol (menuju halaman Open Trip)', 'destBtn', { placeholder: 'Lihat Semua Open Trip' })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Testimonial (Sudut Pandang)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderCompactField('Badge / Tagline', 'testiBadge', { enableWeight: true, defaultWeight: '500' })}
              {renderCompactField('Kutipan Judul (Gunakan *teks* untuk warna kuning)', 'testiTitle', { enableWeight: true, defaultWeight: '800' })}
            </div>

            <div className="space-y-4 pt-4 border-t">
              {renderCompactField(
                'Poin di Bawah Judul (Pisahkan dengan Enter)', 
                'testiHighlights', 
                {
                  isTextarea: true,
                  rows: 3,
                  placeholder: 'Jalan-jalan di kota tua yang penuh sejarah\nKulineran makanan otentik Italia yang bikin nagih\nFoto-foto di spot ikonik yang instagramable banget',
                  enableWeight: true,
                  defaultWeight: '400'
                }
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-xs font-semibold">Tombol Aksi</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderCompactField('Tombol di Foto Tengah (menuju halaman Open Trip)', 'testiBtnGallery', { placeholder: 'Eksplor Trip' })}
                {renderCompactField('Tombol WhatsApp (di bawah galeri)', 'testiBtnWa', { placeholder: 'Ada Pertanyaan?' })}
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div>
                <Label className="text-xs font-semibold">URL Gambar Galeri (3 Kolom Mozaik)</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tersusun dalam 3 kolom mozaik seperti tampilan di situs depan (Kiri, Tengah Besar, Kanan).
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Kolom 1: Kiri Atas & Bawah */}
                <div className="space-y-3 p-3 rounded-xl border bg-muted/10">
                  <span className="text-[11px] font-bold text-slate-700 block">Kolom Kiri</span>
                  {renderImageInput('Gambar 1 (Kiri Atas)', 'galleryImg1', '', '800x600 px (Landscape)')}
                  {renderImageInput('Gambar 2 (Kiri Bawah)', 'galleryImg2', '', '800x600 px (Landscape)')}
                </div>
                {/* Kolom 2: Tengah - Besar */}
                <div className="space-y-3 p-3 rounded-xl border bg-muted/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-3">Kolom Tengah (Besar)</span>
                    {renderImageInput('Gambar 3 (Tengah - Besar)', 'galleryImg3', '', '800x1200 px (Portrait)')}
                  </div>
                  <p className="text-[10px] text-muted-foreground italic mt-2">Foto utama di tengah galeri.</p>
                </div>
                {/* Kolom 3: Kanan Atas & Bawah */}
                <div className="space-y-3 p-3 rounded-xl border bg-muted/10">
                  <span className="text-[11px] font-bold text-slate-700 block">Kolom Kanan</span>
                  {renderImageInput('Gambar 4 (Kanan Atas)', 'galleryImg4', '', '800x600 px (Landscape)')}
                  {renderImageInput('Gambar 5 (Kanan Bawah)', 'galleryImg5', '', '800x600 px (Landscape)')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Accordion (Lihat, Hirup, Simpan)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Foto Full 1 Baris */}
            <div>
              {renderImageInput('Gambar di Samping Daftar Item Accordion', 'accImage', '/accordion-street.webp', '800x1200 px (Portrait)')}
            </div>

            {/* Bagian Teks di Bawah Foto (2 Kolom Seimbang) */}
            <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t">
              <div className="space-y-4">
                {renderCompactField('Label Kecil (di atas judul)', 'accBadge', { placeholder: 'Sudut Pandang' })}
                {renderCompactField('Judul Utama (Gunakan *teks* untuk warna kuning)', 'accTitle', { enableWeight: true, defaultWeight: '800' })}
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                {renderCompactField('Deskripsi Subtitle', 'accSubtitle', { isTextarea: true, rows: 2, enableWeight: true, defaultWeight: '500' })}
                {renderCompactField('Tombol Bawah (menuju halaman Open Trip)', 'accBtn', { placeholder: 'Lihat Semua Open Trip' })}
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t">
              {renderGroupFont('Gaya Teks Judul Item', 'Berlaku untuk semua judul item accordion.', 'accItemTitle', '500')}
              {renderGroupFont('Gaya Teks Deskripsi Item', 'Berlaku untuk semua isi item saat dibuka.', 'accItemBody', '400')}
            </div>

            {renderArrayEditor('Item Accordion', 'accItems', [
              { name: 'title', label: 'Judul Pertanyaan/Topik' },
              { name: 'body', label: 'Deskripsi Jawaban', isTextarea: true }
            ])}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Bukti Sosial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                {renderImageInput('Gambar Latar Section (tampil buram & gelap di belakang testimoni)', 'socialBgImg', '/dest-italy.webp', '1920x1080 px (Landscape)')}
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                {renderCompactField('Judul Sorotan Utama', 'socialTitle', { enableWeight: true, defaultWeight: '800' })}
                {renderCompactField('Deskripsi Subtitle', 'socialSubtitle', { isTextarea: true, rows: 2, enableWeight: true, defaultWeight: '500' })}
              </div>
            </div>

            {renderSplitArrayEditor(
              'Kutipan Testimoni Slider (Data Pelanggan)', 
              'testiItems', 
              { name: 'photo', label: 'Foto Pelanggan (opsional)', resolutionHint: '1080x1080 px (Square)' },
              [
                { name: 'name', label: 'Nama Pelanggan', placeholder: 'Nama asli traveler (mis. nama depan + inisial)' },
                { name: 'text', label: 'Teks Kutipan Testimoni', isTextarea: true, placeholder: 'Tulis ulasan/testimoni pelanggan di sini...' }
              ]
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Tanya Jawab (FAQ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Header FAQ */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                {renderCompactField('Label Kecil (di atas judul)', 'faqBadge', { placeholder: 'FAQ' })}
                {renderCompactField('Judul Utama (Gunakan *teks* untuk warna kuning)', 'faqTitle', { enableWeight: true, defaultWeight: '800' })}
              </div>
              <div className="space-y-4">
                {renderCompactField('Teks Pendek (Subtitle)', 'faqSubtitle', { isTextarea: true, rows: 3, enableWeight: true, defaultWeight: '500' })}
              </div>
            </div>

            {/* CTA Bawah FAQ */}
            <div className="pt-4 border-t space-y-2.5">
              <Label className="text-xs font-semibold">Ajakan & Kontak di Bawah FAQ (CTA)</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderCompactField('Teks Ajakan di Bawah Daftar FAQ', 'faqCtaText', { placeholder: 'Masih ada pertanyaan lain? Kawan Agendain siap menjawab!' })}
                {renderCompactField('Tombol WhatsApp (bawah FAQ)', 'faqBtnWa', { placeholder: 'Hubungi Kami' })}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t">
              {renderGroupFont('Gaya Teks Pertanyaan', 'Berlaku untuk semua pertanyaan FAQ.', 'faqQuestion', '600')}
              {renderGroupFont('Gaya Teks Jawaban', 'Berlaku untuk semua jawaban FAQ saat dibuka.', 'faqAnswer', '400')}
            </div>

            {renderArrayEditor('Daftar FAQ', 'faqItems', [
              { name: 'q', label: 'Pertanyaan (Q)' },
              { name: 'a', label: 'Jawaban (A)', isTextarea: true }
            ])}
          </CardContent>
        </Card>

        {renderSectionOrder()}

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
