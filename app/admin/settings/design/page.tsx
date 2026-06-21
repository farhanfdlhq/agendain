'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle2, AlertCircle, Loader2, Palette, Type, AlertTriangle, Box, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import styles from './page.module.css'

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
    headingFont: 'Montserrat',
    bodyFont: 'Montserrat',
    borderRadius: '0.5rem',
  })
  
  const [activeTab, setActiveTab] = useState('brand')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const fonts = [
    'Montserrat', 'Inter', 'Outfit', 'Poppins', 'Playfair Display',
    'Plus Jakarta Sans', 'Roboto', 'DM Sans', 'Lora'
  ]

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
    <div className={styles.field}>
      <label>{label}</label>
      <div className={styles.inputGroup}>
        <input 
          type="color" 
          className={styles.colorInput} 
          value={theme[key]} 
          onChange={e => handleChange(key, e.target.value)} 
        />
        <input 
          type="text" 
          className={styles.textInput} 
          value={theme[key]} 
          onChange={e => handleChange(key, e.target.value)} 
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" 
          required 
        />
      </div>
    </div>
  )

  if (fetching) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)' }}>
          <Loader2 className="animate-spin" size={20} />
          <span>Memuat pengaturan design system...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Global Design System</h1>
        <p className={styles.subtitle}>Atur palet warna, tipografi, dan gaya antarmuka (UI) secara terpusat untuk seluruh platform. Sistem akan otomatis mem-build skala gradasi warna (50-900).</p>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${activeTab === 'brand' ? styles.activeTab : ''}`} onClick={() => setActiveTab('brand')}>
          <Palette size={18} /> Brand Colors
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'semantic' ? styles.activeTab : ''}`} onClick={() => setActiveTab('semantic')}>
          <AlertTriangle size={18} /> Semantic
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'typography' ? styles.activeTab : ''}`} onClick={() => setActiveTab('typography')}>
          <Type size={18} /> Typography
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'surface' ? styles.activeTab : ''}`} onClick={() => setActiveTab('surface')}>
          <Box size={18} /> Surfaces & Shapes
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'layout' ? styles.activeTab : ''}`} onClick={() => setActiveTab('layout')}>
          <Box size={18} /> Header & Footer
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {activeTab === 'brand' && (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Brand Colors</h3>
            {renderColorField('Primary (Brand Main)', 'colorPrimary')}
            {renderColorField('Secondary (Dominant)', 'colorSecondary')}
            {renderColorField('Accent (Interactive)', 'colorAccent')}
          </div>
        )}

        {activeTab === 'semantic' && (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Semantic / Status Colors</h3>
            {renderColorField('Success (Valid/Positive)', 'colorSuccess')}
            {renderColorField('Warning (Alert/Notice)', 'colorWarning')}
            {renderColorField('Error (Danger/Negative)', 'colorError')}
            {renderColorField('Info (Neutral/Help)', 'colorInfo')}
          </div>
        )}

        {activeTab === 'typography' && (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Global Typography</h3>
            <div className={styles.field}>
              <label>Heading Font (H1 - H6)</label>
              <select className={styles.select} value={theme.headingFont} onChange={e => handleChange('headingFont', e.target.value)}>
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Body Font (Paragraphs, Links, Text)</label>
              <select className={styles.select} value={theme.bodyFont} onChange={e => handleChange('bodyFont', e.target.value)}>
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'surface' && (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Surfaces & Shapes</h3>
            {renderColorField('Background / Canvas', 'colorBackground')}
            {renderColorField('Main Text / Ink', 'colorText')}
            
            <div className={styles.field} style={{ marginTop: '1rem' }}>
              <label>Global Border Radius</label>
              <select className={styles.select} value={theme.borderRadius} onChange={e => handleChange('borderRadius', e.target.value)}>
                {radii.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Navbar (Header)</h3>
            {renderColorField('Navbar Background', 'navbarBackground')}
            {renderColorField('Navbar Text & Icons', 'navbarText')}
            {renderColorField('Navbar Link Hover', 'navbarHover')}
            
            <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Footer</h3>
            {renderColorField('Footer Background', 'footerBackground')}
            {renderColorField('Footer Text', 'footerText')}
          </div>
        )}

        <div className={styles.footer}>
          <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm rounded-md h-10 px-6 font-semibold w-full sm:w-auto">
            {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
            {loading ? 'Building Design System...' : 'Update Global Design System'}
          </Button>
        </div>
      </form>
    </div>
  )
}
