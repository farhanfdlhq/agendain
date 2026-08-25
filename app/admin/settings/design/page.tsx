"use client"

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle2, AlertCircle, Palette, Type, AlertTriangle, Box, Save, LayoutTemplate } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, FONT_CHOICES } from "@/lib/fonts"

export default function DesignSystemPage() {
  const [theme, setTheme] = useState({
    colorPrimary: '#054569',
    colorSecondary: '#FFC704',
    colorAccent: '#056da2',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    colorBackground: '#ffffff',
    colorText: '#1c1c1c',
    navbarBackground: '#054569',
    navbarText: '#ffffff',
    navbarHover: '#FFC704',
    footerBackground: '#054569',
    footerText: '#ffffff',
    headingFont: DEFAULT_HEADING_FONT as string,
    bodyFont: DEFAULT_BODY_FONT as string,
    borderRadius: '0.5rem',
  })

  const [activeTab, setActiveTab] = useState('brand')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Satu sumber daftar font: lib/fonts.ts. Loader next/font di app/layout.tsx
  // dan validasi di POST /api/settings/theme memakai daftar yang sama, jadi
  // pilihan di sini tidak bisa lagi menyimpan nama yang tidak ter-load.
  const fonts = FONT_CHOICES

  const radii = [
    { label: 'None (0px)', value: '0px' },
    { label: 'Small (0.25rem)', value: '0.25rem' },
    { label: 'Medium (0.5rem)', value: '0.5rem' },
    { label: 'Large (1rem)', value: '1rem' },
    { label: 'Pill (9999px)', value: '9999px' },
  ]

  useEffect(() => {
    fetch('/api/settings/theme')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTheme(prev => ({ ...prev, ...data }))
        }
        setFetching(false)
      })
      .catch(() => {
        setFetching(false)
        toast.error('Gagal memuat pengaturan.')
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Design System berhasil diperbarui! Skala otomatis dibuat.')
      } else {
        toast.error(data.error || 'Terjadi kesalahan saat menyimpan.')
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }))
  }

  const renderColorField = (label: string, key: keyof typeof theme) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-10 rounded-md overflow-hidden border shrink-0">
          <input 
            type="color" 
            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" 
            value={theme[key]} 
            onChange={e => handleChange(key, e.target.value)} 
          />
        </div>
        <Input 
          type="text" 
          value={theme[key]} 
          onChange={e => handleChange(key, e.target.value)} 
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" 
          required 
          className="font-mono uppercase"
        />
      </div>
    </div>
  )

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <AirplaneLoader size={32} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Global Design System</h2>
          <p className="text-muted-foreground text-sm">Atur palet warna, tipografi, dan gaya antarmuka secara terpusat.</p>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          {loading ? 'Building...' : 'Update Design System'}
        </Button>
      </div>

      <div className="flex overflow-x-auto pb-2 border-b gap-2 scrollbar-hide">
        <Button 
          variant={activeTab === 'brand' ? 'secondary' : 'ghost'} 
          onClick={() => setActiveTab('brand')}
          className="rounded-full"
        >
          <Palette className="mr-2 h-4 w-4" /> Brand Colors
        </Button>
        <Button 
          variant={activeTab === 'semantic' ? 'secondary' : 'ghost'} 
          onClick={() => setActiveTab('semantic')}
          className="rounded-full"
        >
          <AlertTriangle className="mr-2 h-4 w-4" /> Semantic
        </Button>
        <Button 
          variant={activeTab === 'typography' ? 'secondary' : 'ghost'} 
          onClick={() => setActiveTab('typography')}
          className="rounded-full"
        >
          <Type className="mr-2 h-4 w-4" /> Typography
        </Button>
        <Button 
          variant={activeTab === 'surface' ? 'secondary' : 'ghost'} 
          onClick={() => setActiveTab('surface')}
          className="rounded-full"
        >
          <Box className="mr-2 h-4 w-4" /> Surfaces & Shapes
        </Button>
        <Button 
          variant={activeTab === 'layout' ? 'secondary' : 'ghost'} 
          onClick={() => setActiveTab('layout')}
          className="rounded-full"
        >
          <LayoutTemplate className="mr-2 h-4 w-4" /> Header & Footer
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {activeTab === 'brand' && (
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Warna utama yang mewakili identitas brand Agendain.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {renderColorField('Primary (Brand Main)', 'colorPrimary')}
              {renderColorField('Secondary (Dominant)', 'colorSecondary')}
              {renderColorField('Accent (Interactive)', 'colorAccent')}
            </CardContent>
          </Card>
        )}

        {activeTab === 'semantic' && (
          <Card>
            <CardHeader>
              <CardTitle>Semantic / Status Colors</CardTitle>
              <CardDescription>Warna untuk mengkomunikasikan status dan pesan sistem.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {renderColorField('Success (Valid/Positive)', 'colorSuccess')}
              {renderColorField('Warning (Alert/Notice)', 'colorWarning')}
              {renderColorField('Error (Danger/Negative)', 'colorError')}
              {renderColorField('Info (Neutral/Help)', 'colorInfo')}
            </CardContent>
          </Card>
        )}

        {activeTab === 'typography' && (
          <Card>
            <CardHeader>
              <CardTitle>Global Typography</CardTitle>
              <CardDescription>Pilih jenis huruf yang digunakan di seluruh platform.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Heading Font (H1 - H6)</Label>
                <Select value={theme.headingFont} onValueChange={v => handleChange('headingFont', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body Font (Paragraphs, Text)</Label>
                <Select value={theme.bodyFont} onValueChange={v => handleChange('bodyFont', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'surface' && (
          <Card>
            <CardHeader>
              <CardTitle>Surfaces & Shapes</CardTitle>
              <CardDescription>Warna latar belakang, teks utama, dan radius sudut elemen.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {renderColorField('Background / Canvas', 'colorBackground')}
              {renderColorField('Main Text / Ink', 'colorText')}
              
              <div className="space-y-2 sm:col-span-2">
                <Label>Global Border Radius</Label>
                <Select value={theme.borderRadius} onValueChange={v => handleChange('borderRadius', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {radii.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navbar (Header)</CardTitle>
                <CardDescription>Warna untuk bilah navigasi utama website publik.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {renderColorField('Navbar Background', 'navbarBackground')}
                {renderColorField('Navbar Text & Icons', 'navbarText')}
                {renderColorField('Navbar Link Hover', 'navbarHover')}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>Warna untuk bagian bawah website publik.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                {renderColorField('Footer Background', 'footerBackground')}
                {renderColorField('Footer Text', 'footerText')}
              </CardContent>
            </Card>
          </div>
        )}
      </form>
    </div>
  )
}
