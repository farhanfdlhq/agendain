"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MapPin, Clock, Users, ShieldCheck, CheckCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import styles from './page.module.css'

export default function PrivateTripPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890')

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number.replace(/\D/g, ''))
        }
      })
      .catch(console.error)
  }, [])

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noWa: '',
    destinasi: '',
    tanggal: '',
    pax: 2,
    budget: '< 20jt',
    catatan: ''
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/private-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setSuccess(true)
      } else {
        alert(t('pt.errSubmit'))
      }
    } catch (err) {
      alert(t('pt.errNetwork'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image 
          src="/placeholder.png" 
          alt="Private Trip Eropa" 
          fill 
          priority 
          className={styles.heroImage} 
        />
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('pt.title')}</h1>
          <p className={styles.subtitle}>{t('pt.subtitle')}</p>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('pt.whyTitle')}</h2>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <MapPin size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>{t('pt.custom')}</h3>
                    <p>{t('pt.customDesc')}</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <Clock size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>{t('pt.flex')}</h3>
                    <p>{t('pt.flexDesc')}</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <Users size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>{t('pt.exclusive')}</h3>
                    <p>{t('pt.exclusiveDesc')}</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <ShieldCheck size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>{t('pt.vip')}</h3>
                    <p>{t('pt.vipDesc')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          <div className={styles.sidebar}>
            <div className={styles.formCard}>
              {!success ? (
                <>
                  <h3 className={styles.formTitle}>{t('pt.formTitle')}</h3>
                  <p className={styles.formDesc}>{t('pt.formDesc')}</p>
                  
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="nama">{t('pt.name')}</label>
                      <input type="text" id="nama" name="nama" value={formData.nama} onChange={handleChange} className={styles.input} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="email">{t('pt.email')}</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="nowa">{t('pt.wa')}</label>
                      <input type="tel" id="nowa" name="noWa" value={formData.noWa} onChange={handleChange} className={styles.input} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="destinasi">{t('pt.dest')}</label>
                      <input type="text" id="destinasi" name="destinasi" value={formData.destinasi} onChange={handleChange} placeholder={t('pt.destPh')} className={styles.input} required />
                    </div>
                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="tanggal">{t('pt.date')}</label>
                        <input type="month" id="tanggal" name="tanggal" value={formData.tanggal} onChange={handleChange} className={styles.input} required />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pax">{t('pt.pax')}</label>
                        <input type="number" id="pax" name="pax" min="2" value={formData.pax} onChange={handleChange} className={styles.input} required />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="budget">{t('pt.budget')}</label>
                      <select id="budget" name="budget" value={formData.budget} onChange={handleChange} className={styles.input}>
                        <option value="< 20jt">&lt; Rp 20.000.000</option>
                        <option value="20jt-30jt">Rp 20.000.000 - Rp 30.000.000</option>
                        <option value="30jt-50jt">Rp 30.000.000 - Rp 50.000.000</option>
                        <option value="> 50jt">&gt; Rp 50.000.000</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="catatan">{t('pt.notes')}</label>
                      <textarea id="catatan" name="catatan" value={formData.catatan} onChange={handleChange} className={styles.textarea} rows={4} placeholder={t('pt.notesPh')}></textarea>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? t('pt.submitting') : t('pt.submit')}
                    </button>
                  </form>
                </>
              ) : (
                <div className={styles.successState}>
                  <div className={styles.successIcon}>
                    <CheckCircle size={64} color="var(--color-success)" />
                  </div>
                  <h3 className={styles.formTitle} style={{textAlign: 'center'}}>{t('pt.success')}</h3>
                  <p className={styles.formDesc} style={{textAlign: 'center', marginBottom: '32px'}}>
                    Terima kasih <strong>{formData.nama}</strong>. Tim kami akan segera menganalisa rute <strong>{formData.destinasi}</strong> Anda dan menghubungi Anda secepatnya.
                  </p>
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo Agendain, saya ${formData.nama} baru saja mengisi form Private Trip untuk ke ${formData.destinasi} pada ${formData.tanggal}. Mohon info selanjutnya.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.submitBtn}
                    style={{display: 'flex', justifyContent: 'center', textDecoration: 'none'}}
                  >
                    {t('pt.continueWa')}
                  </a>
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setFormData({ nama: '', email: '', noWa: '', destinasi: '', tanggal: '', pax: 2, budget: '< 20jt', catatan: '' });
                    }} 
                    className={styles.resetBtn}
                  >
                    {t('pt.another')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

