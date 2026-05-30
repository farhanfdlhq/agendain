"use client"

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, Clock, Users, ShieldCheck } from 'lucide-react'
import styles from './page.module.css'

export default function PrivateTripPage() {
  const [loading, setLoading] = useState(false)
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
        alert('Permintaan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.')
        setFormData({ nama: '', email: '', noWa: '', destinasi: '', tanggal: '', pax: 2, budget: '< 20jt', catatan: '' })
      } else {
        alert('Gagal mengirim permintaan. Silakan coba lagi nanti.')
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image 
          src="https://images.unsplash.com/photo-1516483638261-f40889c28a5d?q=80&w=2070&auto=format&fit=crop" 
          alt="Private Trip Eropa" 
          fill 
          priority 
          className={styles.heroImage} 
        />
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Private Trip Eropa</h1>
          <p className={styles.subtitle}>Eksplorasi Eropa dengan itinerary yang dirancang khusus untuk Anda dan orang-orang terdekat.</p>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Mengapa Memilih Private Trip?</h2>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <MapPin size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>Itinerary Custom</h3>
                    <p>Bebas menentukan negara, kota, dan durasi sesuai keinginan Anda tanpa terikat jadwal grup.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <Clock size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>Waktu Fleksibel</h3>
                    <p>Tidak perlu terburu-buru. Anda bebas menentukan kapan ingin berangkat dan bersantai.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <Users size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>Eksklusif & Privat</h3>
                    <p>Nikmati perjalanan hanya bersama keluarga atau kerabat terdekat Anda dengan privasi penuh.</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.icon}>
                    <ShieldCheck size={28} strokeWidth={1.5} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3>Fasilitas VIP</h3>
                    <p>Dari mobil pribadi hingga rekomendasi restoran Michelin Star, kami atur semuanya.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          <div className={styles.sidebar}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Ajukan Private Trip</h3>
              <p className={styles.formDesc}>Ceritakan rencana perjalanan Anda, Travel Consultant kami akan merancang penawaran terbaik.</p>
              
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="nama">Nama Lengkap</label>
                  <input type="text" id="nama" name="nama" value={formData.nama} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="nowa">No. WhatsApp</label>
                  <input type="tel" id="nowa" name="noWa" value={formData.noWa} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="destinasi">Destinasi yang Diinginkan</label>
                  <input type="text" id="destinasi" name="destinasi" value={formData.destinasi} onChange={handleChange} placeholder="Misal: Swiss, Paris, Amsterdam" className={styles.input} required />
                </div>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="tanggal">Rencana Tanggal</label>
                    <input type="month" id="tanggal" name="tanggal" value={formData.tanggal} onChange={handleChange} className={styles.input} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="pax">Jumlah Pax</label>
                    <input type="number" id="pax" name="pax" min="2" value={formData.pax} onChange={handleChange} className={styles.input} required />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="budget">Estimasi Budget per Orang</label>
                  <select id="budget" name="budget" value={formData.budget} onChange={handleChange} className={styles.input}>
                    <option value="< 20jt">&lt; Rp 20.000.000</option>
                    <option value="20jt-30jt">Rp 20.000.000 - Rp 30.000.000</option>
                    <option value="30jt-50jt">Rp 30.000.000 - Rp 50.000.000</option>
                    <option value="> 50jt">&gt; Rp 50.000.000</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="catatan">Catatan Tambahan</label>
                  <textarea id="catatan" name="catatan" value={formData.catatan} onChange={handleChange} className={styles.textarea} rows={4} placeholder="Hotel bintang 5, butuh fotografer, dsb."></textarea>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Mengirim...' : 'Kirim Permintaan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
