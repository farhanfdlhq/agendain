"use client"

import { useState, useEffect, useRef } from 'react'
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
import { FontWeightPicker } from "@/components/ui/font-weight-picker"
import { foldLegacyRepeaters, HOME_REPEATERS } from "@/lib/i18n/localize"

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

    // Testimonial
    testiBadge: '', testiBadge_en: '',
    testiTitle: '', testiTitle_en: '',

    // Accordion
    accTitle: '', accTitle_en: '',
    accSubtitle: '', accSubtitle_en: '',

    // Social Proof
    socialTitle: '', socialTitle_en: '',
    socialSubtitle: '', socialSubtitle_en: '',

    // FAQ
    faqTitle: '', faqTitle_en: '',
    faqSubtitle: '', faqSubtitle_en: '',

    sectionOrder: 'hero,why,destinations,testimonial,accordion,socialproof,faq'
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const [isScrolled, setIsScrolled] = useState(false)
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

  const renderSectionOrder = () => {
    const orderArray = (data.sectionOrder || 'hero,why,destinations,testimonial,accordion,socialproof,faq').split(',')
    
    const handleReorder = (newOrder: string[]) => {
      setData((prev: any) => ({ ...prev, sectionOrder: newOrder.join(',') }))
    }

    return (
      <Card className="mt-8 border shadow-sm">
        <CardHeader className="p-4 border-b bg-muted/20">
          <CardTitle className="text-lg">Pengaturan Urutan Bagian (Section Order)</CardTitle>
          <CardDescription>Geser ke atas atau bawah untuk mengatur urutan tampilan bagian di halaman beranda. Anda juga bisa menarik kotak (drag and drop) untuk menyusunnya dengan cepat!</CardDescription>
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
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 font-bold text-base">
            {label}
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">{activeTab}</span>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="rounded-full h-8 text-xs">
            + Tambah Item
          </Button>
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

        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded-xl bg-card relative shadow-sm">
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute top-3 right-3 h-6 w-6 rounded-full"
                onClick={() => handleRemoveItem(index)}
              >
                &times;
              </Button>
              <h4 className="text-sm font-semibold mb-3">Item #{index + 1}</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.name} className={`space-y-1.5 ${f.isTextarea ? 'sm:col-span-2' : ''}`}>
                    <Label className="text-xs">{f.label}</Label>
                    {f.resolutionHint && (
                      <p className="text-[10px] text-muted-foreground mt-0 mb-1 font-medium italic">
                        💡 Rekomendasi: <span className="font-bold text-slate-700">{f.resolutionHint}</span>
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
                        className="min-h-[80px]"
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
                        <FontWeightPicker
                          value={item[`${f.name}Weight`]}
                          onChange={(val) => handleItemChange(index, `${f.name}Weight`, val)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
                      💡 Rekomendasi: <span className="font-bold text-slate-700">{imageField.resolutionHint}</span>
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
                          <FontWeightPicker
                            value={item[`${tf.name}Weight`]}
                            onChange={(val) => handleItemChange(index, `${tf.name}Weight`, val)}
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
          <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                {renderImageInput('URL Gambar Background', 'heroBgImage', '/hero-coastal.webp', '1920x1080 px (Landscape)')}
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'heroTitle', true, '', true, '800')}
                {renderTextInput('Teks Sub-judul (Subtitle)', 'heroSubtitle', true, '', true, '500')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Mengapa Memilih Kami (Why Choose Us)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Eyebrow (Teks Kecil Atas)', 'whyTitleMain', false, '', true, '800')}
              {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'whyTitleSub', false, '', true, '800')}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 pt-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">Warna Garis Tepi Kartu (Border)</Label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    name="whyBorderColor"
                    value={data.whyBorderColor || '#f1f5f9'} 
                    onChange={handleChange}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <span className="text-sm text-slate-500 font-mono">{data.whyBorderColor || '#f1f5f9'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2">Ketebalan Border (px)</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    name="whyBorderWidth"
                    value={data.whyBorderWidth ? data.whyBorderWidth.replace('px', '') : '1.5'} 
                    onChange={(e) => setData((prev: any) => ({ ...prev, whyBorderWidth: `${e.target.value}px` }))}
                    className="w-24"
                  />
                  <span className="text-sm text-slate-500 font-medium">px</span>
                </div>
              </div>
            </div>
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
          <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
            {renderTextInput('Eyebrow (Teks Kecil Atas)', 'destEyebrow', false, '', true, '500')}
            {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'destTitle', false, '', true, '800')}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Testimonial (Sudut Pandang)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Badge / Tagline', 'testiBadge', false, '', true, '500')}
              {renderTextInput('Kutipan Judul (Bisa pakai <span>Italia</span>)', 'testiTitle', false, '', true, '800')}
            </div>
            
            <div className="space-y-4 pt-4 border-t mt-4">
              <Label className="font-bold text-base">URL Gambar Galeri</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderImageInput('Gambar 1 (Kiri Atas)', 'galleryImg1', '', '800x600 px (Landscape)')}
                {renderImageInput('Gambar 2 (Kiri Bawah)', 'galleryImg2', '', '800x600 px (Landscape)')}
                {renderImageInput('Gambar 3 (Tengah - Besar)', 'galleryImg3', '', '800x1200 px (Portrait)')}
                {renderImageInput('Gambar 4 (Kanan Atas)', 'galleryImg4', '', '800x600 px (Landscape)')}
                {renderImageInput('Gambar 5 (Kanan Bawah)', 'galleryImg5', '', '800x600 px (Landscape)')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Accordion (Lihat, Hirup, Simpan)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                {renderImageInput('URL Gambar (Kiri/Kanan Tergantung Layar)', 'accImage', '/accordion-street.webp', '800x1200 px (Portrait)')}
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'accTitle', false, '', true, '800')}
                {renderTextInput('Deskripsi Subtitle', 'accSubtitle', true, '', true, '500')}
              </div>
            </div>
            
            {renderArrayEditor('Item Accordion', 'accItems', [
              { name: 'title', label: 'Judul Pertanyaan/Topik' },
              { name: 'body', label: 'Deskripsi Jawaban', isTextarea: true }
            ])}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Bukti Sosial (Social Proof)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                {renderImageInput('URL Gambar Background', 'socialBgImg', '/dest-italy.webp', '1920x1080 px (Landscape)')}
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                {renderTextInput('Judul Sorotan Utama', 'socialTitle', true, '', true, '800')}
                {renderTextInput('Deskripsi Subtitle', 'socialSubtitle', true, '', true, '500')}
              </div>
            </div>

            {renderSplitArrayEditor(
              'Kutipan Testimoni Slider (Data Pelanggan)', 
              'testiItems', 
              { name: 'photo', label: 'Foto Pelanggan (Wajib/Opsional)', resolutionHint: '1080x1080 px (Square)' },
              [
                { name: 'name', label: 'Nama Pelanggan', placeholder: 'Contoh: El Rumi' },
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
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'faqTitle', false, '', true, '800')}
              {renderTextInput('Teks Pendek', 'faqSubtitle', false, '', true, '500')}
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
