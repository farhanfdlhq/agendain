'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowUp, ArrowDown, GripVertical, Save } from 'lucide-react'
import { Reorder } from 'framer-motion'
import { Button } from "@/components/ui/button"
import styles from './page.module.css'

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

  const renderSectionOrder = () => {
    const orderArray = (data.sectionOrder || 'packages,destinations,features,cta').split(',')
    
    const handleReorder = (newOrder: string[]) => {
      setData((prev: any) => ({ ...prev, sectionOrder: newOrder.join(',') }))
    }

    return (
      <div style={{ background: 'var(--color-surface-soft)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '2.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-ink)', fontWeight: '600' }}>Pengaturan Urutan Bagian (Section Order)</h3>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Geser ke atas atau bawah untuk mengatur urutan tampilan bagian di halaman beranda. Anda juga bisa menarik kotak (drag and drop) untuk menyusunnya dengan cepat!</p>
        <Reorder.Group axis="y" values={orderArray} onReorder={handleReorder} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
          {orderArray.map((key: string, idx: number) => (
            <Reorder.Item key={key} value={key} style={{ cursor: 'grab', position: 'relative' }} whileDrag={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <GripVertical size={18} style={{ color: '#cbd5e1' }} />
                  <span style={{ color: 'var(--color-muted)', fontWeight: 'bold', width: '20px' }}>{idx + 1}.</span>
                  <span style={{ fontWeight: '500', color: 'var(--color-ink)' }}>{SECTION_NAMES[key] || key}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => handleMoveSection(idx, 'up')}
                    disabled={idx === 0}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', padding: '0', borderRadius: '6px', border: '1px solid #e2e8f0', background: idx === 0 ? '#f8fafc' : 'white', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#cbd5e1' : 'var(--color-ink)', transition: 'all 0.2s' }}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleMoveSection(idx, 'down')}
                    disabled={idx === orderArray.length - 1}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', padding: '0', borderRadius: '6px', border: '1px solid #e2e8f0', background: idx === orderArray.length - 1 ? '#f8fafc' : 'white', cursor: idx === orderArray.length - 1 ? 'not-allowed' : 'pointer', color: idx === orderArray.length - 1 ? '#cbd5e1' : 'var(--color-ink)', transition: 'all 0.2s' }}
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    )
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

  const renderColorSelect = (label: string, fieldName: string) => {
    const value = data[fieldName] as string || '';
    
    // Determine active type
    let activeType = 'custom';
    if (value === '' || value === 'var(--color-primary)') activeType = 'primary';
    else if (value === 'var(--color-dominant)') activeType = 'secondary';
    
    // Fallback for custom color picker value (must be hex)
    const customValue = activeType === 'custom' ? value : '#000000';
    
    return (
      <div className={styles.field} style={{ marginTop: '-0.5rem', marginBottom: '2rem' }}>
        <label>{label}</label>
        <div className={styles.colorPickerGroup}>
          <button 
            type="button"
            className={`${styles.colorPill} ${activeType === 'primary' ? styles.colorPillActive : ''}`}
            onClick={() => handleChange({ target: { name: fieldName, value: 'var(--color-primary)' } } as any)}
          >
            <span className={styles.colorCircle} style={{ background: 'var(--color-primary)' }}></span>
            Primer
          </button>
          
          <button 
            type="button"
            className={`${styles.colorPill} ${activeType === 'secondary' ? styles.colorPillActive : ''}`}
            onClick={() => handleChange({ target: { name: fieldName, value: 'var(--color-dominant)' } } as any)}
          >
            <span className={styles.colorCircle} style={{ background: 'var(--color-dominant)' }}></span>
            Sekunder
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className={`${styles.colorPill} ${activeType === 'custom' ? styles.colorPillActive : ''}`}
              onClick={() => {
                if (activeType !== 'custom') {
                  handleChange({ target: { name: fieldName, value: '#000000' } } as any)
                }
              }}
            >
              <span className={styles.colorCircle} style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}></span>
              Kustom
            </button>
            {activeType === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input 
                  type="color" 
                  name={fieldName}
                  value={customValue}
                  onChange={handleChange}
                  className={styles.customColorInput}
                />
                <input 
                  type="text" 
                  name={fieldName}
                  value={customValue}
                  onChange={handleChange}
                  className={styles.customColorText}
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
      <div className={styles.field}>
        <label>{label} ({activeTab.toUpperCase()})</label>
        {isTextarea ? (
          <textarea 
            name={activeFieldName} 
            value={data[activeFieldName] || ''} 
            onChange={handleChange} 
            className={styles.textarea} 
            required={activeTab === 'id'}
          />
        ) : (
          <input 
            type="text" 
            name={activeFieldName} 
            value={data[activeFieldName] || ''} 
            onChange={handleChange} 
            className={styles.input} 
            required={activeTab === 'id'} 
          />
        )}
      </div>
    )
  }

  if (fetching) return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)' }}>
        <Loader2 className="animate-spin" size={20} />
        <span>Memuat data CMS...</span>
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>CMS Halaman Beranda</h1>
      </div>
      
      <div className={styles.tabs} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={activeTab === 'id' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('id')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: activeTab === 'id' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'id' ? 'white' : 'inherit', cursor: 'pointer' }}
        >
          <img src="https://flagcdn.com/w20/id.png" alt="ID" width={20} height={15} style={{ borderRadius: '2px', objectFit: 'cover' }} /> Indonesia
        </button>
        <button 
          className={activeTab === 'en' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('en')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: activeTab === 'en' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'en' ? 'white' : 'inherit', cursor: 'pointer' }}
        >
          <img src="https://flagcdn.com/w20/gb.png" alt="EN" width={20} height={15} style={{ borderRadius: '2px', objectFit: 'cover' }} /> English
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h3 className={styles.sectionTitle}>Bagian Hero (Beranda Utama)</h3>
        {renderTextInput('Judul Utama (Hero)', 'heroTitle')}
        {renderColorSelect('Warna Teks Judul Utama', 'heroTitleColor')}
        
        {renderTextInput('Teks Sub-judul (Subtitle)', 'heroSubtitle', true)}
        {renderColorSelect('Warna Teks Sub-judul', 'heroSubtitleColor')}

        <h3 className={styles.sectionTitle}>Bagian Fitur Keunggulan</h3>
        {renderTextInput('Judul Keunggulan (Features)', 'featuresTitle')}
        {renderColorSelect('Warna Teks Judul Fitur', 'featuresTitleColor')}

        <h3 className={styles.sectionTitle}>Bagian Ajakan Bertindak (CTA)</h3>
        {renderTextInput('Judul Ajakan Bertindak (CTA)', 'ctaTitle')}
        {renderColorSelect('Warna Teks Judul CTA', 'ctaTitleColor')}

        {renderTextInput('Deskripsi Singkat CTA', 'ctaText', true)}
        {renderColorSelect('Warna Teks Deskripsi CTA', 'ctaTextColor')}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ background: 'var(--color-surface-soft)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--color-ink)', fontWeight: '600' }}>Pengaturan Tombol 1 (Primary)</h4>
            {renderTextInput('Label Tombol', 'ctaBtn1Text')}
            <div style={{ marginTop: '1rem' }}>
              {renderColorSelect('Warna Background', 'ctaBtn1Color')}
              {renderColorSelect('Warna Hover', 'ctaBtn1HoverColor')}
              {renderColorSelect('Warna Label (Teks)', 'ctaBtn1TextColor')}
            </div>
          </div>
          <div style={{ background: 'var(--color-surface-soft)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--color-ink)', fontWeight: '600' }}>Pengaturan Tombol 2 (Secondary)</h4>
            {renderTextInput('Label Tombol', 'ctaBtn2Text')}
            <div style={{ marginTop: '1rem' }}>
              {renderColorSelect('Warna Background', 'ctaBtn2Color')}
              {renderColorSelect('Warna Hover', 'ctaBtn2HoverColor')}
              {renderColorSelect('Warna Label (Teks)', 'ctaBtn2TextColor')}
            </div>
          </div>
        </div>

        {renderSectionOrder()}

        <div className={styles.footer}>
          <Button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm rounded-md h-10 px-6 font-semibold w-full sm:w-auto">
            {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
