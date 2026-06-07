'use client'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import styles from './page.module.css'

export default function HomeCMSPage() {
  const [data, setData] = useState<any>({
    heroTitle: '',
    heroTitleColor: '',
    heroSubtitle: '',
    heroSubtitleColor: '',
    featuresTitle: '',
    featuresTitleColor: '',
    ctaTitle: '',
    ctaTitleColor: '',
    ctaText: '',
    ctaTextColor: ''
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

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
            Primary
          </button>
          
          <button 
            type="button"
            className={`${styles.colorPill} ${activeType === 'secondary' ? styles.colorPillActive : ''}`}
            onClick={() => handleChange({ target: { name: fieldName, value: 'var(--color-dominant)' } } as any)}
          >
            <span className={styles.colorCircle} style={{ background: 'var(--color-dominant)' }}></span>
            Secondary
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              type="button"
              className={`${styles.colorPill} ${activeType === 'custom' ? styles.colorPillActive : ''}`}
              onClick={() => {
                if (activeType !== 'custom') {
                  handleChange({ target: { name: fieldName, value: '#000000' } } as any)
                }
              }}
            >
              Custom
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
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <h3 className={styles.sectionTitle}>Hero Section</h3>
        <div className={styles.field}>
          <label>Judul Utama (Hero Title)</label>
          <input type="text" name="heroTitle" value={data.heroTitle} onChange={handleChange} className={styles.input} required />
        </div>
        {renderColorSelect('Warna Judul Utama', 'heroTitleColor')}
        
        <div className={styles.field}>
          <label>Sub-judul (Hero Subtitle)</label>
          <textarea name="heroSubtitle" value={data.heroSubtitle} onChange={handleChange} className={styles.textarea} required />
        </div>
        {renderColorSelect('Warna Sub-judul', 'heroSubtitleColor')}

        <h3 className={styles.sectionTitle}>Fitur Section</h3>
        <div className={styles.field}>
          <label>Judul Bagian Fitur</label>
          <input type="text" name="featuresTitle" value={data.featuresTitle} onChange={handleChange} className={styles.input} required />
        </div>
        {renderColorSelect('Warna Judul Fitur', 'featuresTitleColor')}

        <h3 className={styles.sectionTitle}>Call to Action (CTA) Section</h3>
        <div className={styles.field}>
          <label>Judul CTA</label>
          <input type="text" name="ctaTitle" value={data.ctaTitle} onChange={handleChange} className={styles.input} required />
        </div>
        {renderColorSelect('Warna Judul CTA', 'ctaTitleColor')}

        <div className={styles.field}>
          <label>Teks Deskripsi CTA</label>
          <textarea name="ctaText" value={data.ctaText} onChange={handleChange} className={styles.textarea} required />
        </div>
        {renderColorSelect('Warna Teks CTA', 'ctaTextColor')}

        <div className={styles.footer}>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
