"use client"

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowUp, ArrowDown, GripVertical, Save, Globe, Type } from 'lucide-react'
import { Reorder } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import AirplaneLoader from "@/components/ui/airplane-loader"

export default function HomeCMSPage() {
  const [data, setData] = useState<any>({
    heroTitle: '',
    heroTitle_en: '',
    heroTitleColor: '',
    heroSubtitle: '',
    heroSubtitle_en: '',
    heroSubtitleColor: '',
    featuresTitle: '',
    featuresTitle_en: '',
    featuresTitleColor: '',
    ctaTitle: '',
    ctaTitle_en: '',
    ctaTitleColor: '',
    ctaText: '',
    ctaText_en: '',
    ctaTextColor: '',
    ctaBtn1Text: '',
    ctaBtn1Text_en: '',
    ctaBtn1Link: '',
    ctaBtn1Color: '',
    ctaBtn1HoverColor: '',
    ctaBtn1TextColor: '',
    ctaBtn2Text: '',
    ctaBtn2Text_en: '',
    ctaBtn2Link: '',
    ctaBtn2Color: '',
    ctaBtn2HoverColor: '',
    ctaBtn2TextColor: '',
    sectionOrder: 'packages,destinations,features,cta'
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')

  const SECTION_NAMES: Record<string, string> = {
    'packages': 'Paket Unggulan',
    'destinations': 'Destinasi Favorit',
    'features': 'Fitur Keunggulan',
    'cta': 'Ajakan Bertindak (CTA)'
  }

  useEffect(() => {
    fetch('/api/settings/home')
      .then(res => res.json())
      .then(res => {
        if (!res.error) setData((prev: any) => ({ ...prev, ...res }))
        setFetching(false)
      })
      .catch(() => {
        setFetching(false)
        toast.error('Gagal memuat data')
      })
  }, [])

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const order = (data.sectionOrder || 'packages,destinations,features,cta').split(',')
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

  const renderSectionOrder = () => {
    const orderArray = (data.sectionOrder || 'packages,destinations,features,cta').split(',')
    
    const handleReorder = (newOrder: string[]) => {
      setData((prev: any) => ({ ...prev, sectionOrder: newOrder.join(',') }))
    }

    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Pengaturan Urutan Bagian (Section Order)</CardTitle>
          <CardDescription>Geser ke atas atau bawah untuk mengatur urutan tampilan bagian di halaman beranda. Anda juga bisa menarik kotak (drag and drop) untuk menyusunnya dengan cepat!</CardDescription>
        </CardHeader>
        <CardContent>
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

  const renderColorSelect = (label: string, fieldName: string) => {
    const value = data[fieldName] as string || '';
    
    let activeType = 'custom';
    if (value === '' || value === 'var(--color-primary)') activeType = 'primary';
    else if (value === 'var(--color-dominant)') activeType = 'secondary';
    
    const customValue = activeType === 'custom' ? value : '#000000';
    
    return (
      <div className="space-y-3 pt-2">
        <Label>{label}</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            type="button"
            variant={activeType === 'primary' ? 'default' : 'outline'}
            className={`h-9 px-3 rounded-full ${activeType === 'primary' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            onClick={() => handleChange({ target: { name: fieldName, value: 'var(--color-primary)' } } as any)}
          >
            <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] mr-2 border border-black/10 dark:border-white/10"></span>
            Primer
          </Button>
          
          <Button 
            type="button"
            variant={activeType === 'secondary' ? 'default' : 'outline'}
            className={`h-9 px-3 rounded-full ${activeType === 'secondary' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            onClick={() => handleChange({ target: { name: fieldName, value: 'var(--color-dominant)' } } as any)}
          >
            <span className="w-4 h-4 rounded-full bg-[var(--color-dominant)] mr-2 border border-black/10 dark:border-white/10"></span>
            Sekunder
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant={activeType === 'custom' ? 'default' : 'outline'}
              className={`h-9 px-3 rounded-full ${activeType === 'custom' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              onClick={() => {
                if (activeType !== 'custom') {
                  handleChange({ target: { name: fieldName, value: '#000000' } } as any)
                }
              }}
            >
              <span className="w-4 h-4 rounded-full mr-2" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}></span>
              Kustom
            </Button>
            
            {activeType === 'custom' && (
              <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                <input 
                  type="color" 
                  name={fieldName}
                  value={customValue}
                  onChange={handleChange}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                />
                <Input 
                  type="text" 
                  name={fieldName}
                  value={customValue}
                  onChange={handleChange}
                  className="h-7 w-24 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderTextInput = (label: string, fieldName: string, isTextarea = false) => {
    const activeFieldName = activeTab === 'en' ? `${fieldName}_en` : fieldName;
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {label}
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
            {activeTab}
          </span>
        </Label>
        {isTextarea ? (
          <Textarea 
            name={activeFieldName} 
            value={data[activeFieldName] || ''} 
            onChange={handleChange} 
            required={activeTab === 'id'}
            rows={3}
          />
        ) : (
          <Input 
            type="text" 
            name={activeFieldName} 
            value={data[activeFieldName] || ''} 
            onChange={handleChange} 
            required={activeTab === 'id'} 
          />
        )}
      </div>
    )
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <AirplaneLoader size={32} className="text-primary" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">CMS Halaman Beranda</h2>
          <p className="text-muted-foreground text-sm">Kelola teks dan warna untuk elemen-elemen di halaman depan.</p>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          Simpan Perubahan
        </Button>
      </div>
      
      <div className="flex gap-2 border-b pb-4">
        <Button 
          variant={activeTab === 'id' ? 'default' : 'outline'}
          onClick={() => setActiveTab('id')}
          className="gap-2 rounded-full"
        >
          <img src="https://flagcdn.com/w20/id.png" alt="ID" width={20} height={15} className="rounded-sm object-cover" /> 
          Indonesia
        </Button>
        <Button 
          variant={activeTab === 'en' ? 'default' : 'outline'}
          onClick={() => setActiveTab('en')}
          className="gap-2 rounded-full"
        >
          <img src="https://flagcdn.com/w20/gb.png" alt="EN" width={20} height={15} className="rounded-sm object-cover" /> 
          English
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Bagian Hero (Beranda Utama)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Judul Utama (Hero)', 'heroTitle')}
              {renderColorSelect('Warna Teks Judul Utama', 'heroTitleColor')}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Teks Sub-judul (Subtitle)', 'heroSubtitle', true)}
              {renderColorSelect('Warna Teks Sub-judul', 'heroSubtitleColor')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bagian Fitur Keunggulan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {renderTextInput('Judul Keunggulan (Features)', 'featuresTitle')}
            {renderColorSelect('Warna Teks Judul Fitur', 'featuresTitleColor')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bagian Ajakan Bertindak (CTA)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Judul Ajakan Bertindak (CTA)', 'ctaTitle')}
              {renderColorSelect('Warna Teks Judul CTA', 'ctaTitleColor')}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {renderTextInput('Deskripsi Singkat CTA', 'ctaText', true)}
              {renderColorSelect('Warna Teks Deskripsi CTA', 'ctaTextColor')}
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-4 pt-4 border-t">
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                <h4 className="font-semibold text-foreground">Pengaturan Tombol 1 (Primary)</h4>
                {renderTextInput('Label Tombol', 'ctaBtn1Text')}
                <div className="space-y-4 pt-2">
                  {renderColorSelect('Warna Background', 'ctaBtn1Color')}
                  {renderColorSelect('Warna Hover', 'ctaBtn1HoverColor')}
                  {renderColorSelect('Warna Label (Teks)', 'ctaBtn1TextColor')}
                </div>
              </div>
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                <h4 className="font-semibold text-foreground">Pengaturan Tombol 2 (Secondary)</h4>
                {renderTextInput('Label Tombol', 'ctaBtn2Text')}
                <div className="space-y-4 pt-2">
                  {renderColorSelect('Warna Background', 'ctaBtn2Color')}
                  {renderColorSelect('Warna Hover', 'ctaBtn2HoverColor')}
                  {renderColorSelect('Warna Label (Teks)', 'ctaBtn2TextColor')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {renderSectionOrder()}

      </form>
    </div>
  )
}
