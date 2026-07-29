"use client"

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowUp, ArrowDown, GripVertical, Save, Globe, Type, FolderOpen, Trash2, X } from 'lucide-react'
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

export default function HomeCMSPage() {
  const [data, setData] = useState<any>({
    // Hero
    heroTitle: '', heroTitle_en: '',
    heroSubtitle: '', heroSubtitle_en: '',
    
    // Why
    whyTitleMain: '', whyTitleMain_en: '',
    whyTitleSub: '', whyTitleSub_en: '',

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
    socialName: '', socialName_en: '',
    socialQuote: '', socialQuote_en: '',
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

  const { showConfirm } = useConfirm()

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

  const renderImageInput = (label: string, fieldName: string, placeholder = '') => {
    // Sharing the exact same field across both languages for images
    const activeFieldName = fieldName; 
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          {label}
        </Label>
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



  const renderTextInput = (label: string, fieldName: string, isTextarea = false, placeholder = '', enableWeight = false, defaultWeight = "400") => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    const weightField = `${fieldName}Weight`;
    const selectedWeight = data[weightField] ? Number(data[weightField]) : undefined;

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
    fields: { name: string; label: string; isTextarea?: boolean; isImage?: boolean; enableWeight?: boolean }[]
  ) => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    const items = data[activeFieldName] || [];

    const handleItemChange = (index: number, field: string, value: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setData((prev: any) => ({ ...prev, [activeFieldName]: newItems }));
    };

    const handleAddItem = () => {
      const newItem = fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});
      setData((prev: any) => ({ ...prev, [activeFieldName]: [...items, newItem] }));
    };

    const handleRemoveItem = (index: number) => {
      const newItems = items.filter((_: any, i: number) => i !== index);
      setData((prev: any) => ({ ...prev, [activeFieldName]: newItems }));
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
                        value={item[f.name] || ''} 
                        onChange={(e) => handleItemChange(index, f.name, e.target.value)}
                        className="min-h-[80px]"
                        style={f.enableWeight && item[`${f.name}Weight`] ? { fontWeight: Number(item[`${f.name}Weight`]) } : undefined}
                      />
                    ) : (
                      <Input 
                        value={item[f.name] || ''} 
                        onChange={(e) => handleItemChange(index, f.name, e.target.value)}
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

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <AirplaneLoader size={32} className="text-primary" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">CMS Halaman Beranda</h2>
          <p className="text-muted-foreground text-sm mt-1">Kelola teks dan warna untuk elemen-elemen di halaman depan.</p>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold rounded-full px-6"
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
          className="gap-2 rounded-full font-medium"
        >
          <img src="https://flagcdn.com/w20/id.png" alt="ID" width={20} height={15} className="rounded-sm object-cover" /> 
          Indonesia
        </Button>
        <Button 
          type="button"
          variant={activeTab === 'en' ? 'default' : 'outline'}
          onClick={() => setActiveTab('en')}
          className="gap-2 rounded-full font-medium"
        >
          <img src="https://flagcdn.com/w20/gb.png" alt="EN" width={20} height={15} className="rounded-sm object-cover" /> 
          English
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Hero (Beranda Utama)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'heroTitle', true, '', true, '800')}
              {renderTextInput('Teks Sub-judul (Subtitle)', 'heroSubtitle', true, '', true, '500')}
            </div>
            {renderImageInput('URL Gambar Background', 'heroBgImage', '/hero-coastal.webp')}
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
            {renderArrayEditor('Kartu Keunggulan', 'whyItems', [
              { name: 'number', label: 'Angka/Nomor (Contoh: 01, 02)' },
              { name: 'image', label: 'URL Ikon/Gambar', isImage: true },
              { name: 'title', label: 'Judul', enableWeight: true },
              { name: 'desc', label: 'Deskripsi Singkat', isTextarea: true, enableWeight: true }
            ])}
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
                {renderImageInput('Gambar 1 (Kiri Atas)', 'galleryImg1')}
                {renderImageInput('Gambar 2 (Kiri Bawah)', 'galleryImg2')}
                {renderImageInput('Gambar 3 (Tengah - Besar)', 'galleryImg3')}
                {renderImageInput('Gambar 4 (Kanan Atas)', 'galleryImg4')}
                {renderImageInput('Gambar 5 (Kanan Bawah)', 'galleryImg5')}
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
              {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'accTitle', false, '', true, '800')}
              {renderTextInput('Deskripsi Subtitle', 'accSubtitle', true, '', true, '500')}
            </div>
            {renderImageInput('URL Gambar (Kanan)', 'accImage', '/accordion-street.webp')}
            
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
              {renderTextInput('Nama Tokoh/Pelanggan', 'socialName')}
              {renderTextInput('Judul Sorotan Utama', 'socialTitle', true, '', true, '800')}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Kutipan Lengkap', 'socialQuote', true)}
              {renderTextInput('Deskripsi Subtitle', 'socialSubtitle', true, '', true, '500')}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {renderImageInput('URL Gambar Tokoh (Kiri)', 'socialImage', '/el-rumi-syifa.webp')}
              {renderImageInput('URL Gambar Background (Kanan)', 'socialBgImg', '/dest-italy.webp')}
            </div>

            {renderArrayEditor('Kutipan Testimoni Slider', 'testiItems', [
              { name: 'name', label: 'Nama Pelanggan' },
              { name: 'text', label: 'Teks Kutipan Testimoni', isTextarea: true }
            ])}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 border-b bg-muted/20">
            <CardTitle className="text-lg">Bagian Tanya Jawab (FAQ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Judul Utama (Gunakan *teks* untuk warna kuning)', 'faqTitle', false, '', true, '800')}
              {renderTextInput('Teks Pendek (CTA WhatsApp)', 'faqSubtitle', false, '', true, '500')}
            </div>

            {renderArrayEditor('Daftar FAQ', 'faqItems', [
              { name: 'q', label: 'Pertanyaan (Q)' },
              { name: 'a', label: 'Jawaban (A)', isTextarea: true }
            ])}
          </CardContent>
        </Card>

        {renderSectionOrder()}

      </form>
    </div>
  )
}
