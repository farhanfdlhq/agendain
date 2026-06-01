'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, Loader2 } from 'lucide-react'
import styles from './BookingForm.module.css'

type BookingFormProps = {
  paketId: number
  paketNama: string
  hargaString: string
  whatsappNumber: string
}

export default function BookingForm({ paketId, paketNama, hargaString, whatsappNumber }: BookingFormProps) {
  const router = useRouter()
  
  // Step 0: Inline form, Step 1: Modal details, Step 2: Success
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form Data
  const [formData, setFormData] = useState({
    tanggal: '',
    jumlahPax: 2,
    nama: '',
    email: '',
    noWa: '',
    catatan: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.tanggal || formData.jumlahPax < 1) {
      alert("Mohon isi tanggal dan jumlah pax dengan benar.")
      return
    }
    setStep(1) // Open Modal
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          email: formData.email,
          noWa: formData.noWa,
          paketId: paketId,
          tanggal: formData.tanggal,
          jumlahPax: Number(formData.jumlahPax),
          catatan: formData.catatan
        })
      })

      if (!res.ok) throw new Error('Gagal memproses booking. Silakan coba lagi.')
      
      setStep(2) // Success
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const closeDialog = () => {
    setStep(0)
  }

  const formatWa = (phone: string) => phone.replace(/\D/g, '')

  return (
    <>
      {/* The inline form shown in the sidebar */}
      <form className={styles.inlineForm} onSubmit={handleInitialSubmit}>
        <div className={styles.inputGroup}>
          <label>Tanggal Keberangkatan</label>
          <input 
            type="date" 
            name="tanggal"
            className={styles.input} 
            value={formData.tanggal}
            onChange={handleChange}
            required 
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Jumlah Peserta (Pax)</label>
          <input 
            type="number" 
            name="jumlahPax"
            min="1" 
            className={styles.input} 
            value={formData.jumlahPax}
            onChange={handleChange}
            required 
          />
        </div>
        <button type="submit" className={styles.reserveBtn}>Pesan Sekarang</button>
      </form>

      {/* The Modal */}
      <AnimatePresence>
        {step > 0 && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.backdrop} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={step === 1 ? closeDialog : undefined}
            />
            
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            >
              <button className={styles.closeBtn} onClick={closeDialog} aria-label="Tutup">
                <X size={24} />
              </button>

              {step === 1 && (
                <div className={styles.modalBody}>
                  <h2>Lengkapi Data Pemesanan</h2>
                  <p className={styles.subtitle}>Paket: <strong>{paketNama}</strong> <br/> Keberangkatan: <strong>{formData.tanggal}</strong> untuk <strong>{formData.jumlahPax} Pax</strong></p>
                  
                  {error && <div className={styles.errorAlert}>{error}</div>}

                  <form onSubmit={handleFinalSubmit} className={styles.fullForm}>
                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label>Nama Lengkap</label>
                        <input type="text" name="nama" required value={formData.nama} onChange={handleChange} placeholder="Sesuai KTP/Paspor" />
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label>Alamat Email</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="email@contoh.com" />
                      </div>
                      <div className={styles.field}>
                        <label>No. WhatsApp</label>
                        <input type="tel" name="noWa" required value={formData.noWa} onChange={handleChange} placeholder="08123456789" />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label>Catatan Tambahan (Opsional)</label>
                        <textarea name="catatan" value={formData.catatan} onChange={handleChange} placeholder="Alergi makanan, permintaan khusus, dll" rows={3}></textarea>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="button" className={styles.btnCancel} onClick={closeDialog}>Batal</button>
                      <button type="submit" className={styles.btnSubmit} disabled={loading}>
                        {loading ? <Loader2 className={styles.spinner} size={20} /> : 'Konfirmasi Pesanan'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className={styles.successBody}>
                  <div className={styles.successIcon}>
                    <CheckCircle size={64} color="var(--color-success)" />
                  </div>
                  <h2>Pesanan Berhasil Dicatat!</h2>
                  <p>Terima kasih <strong>{formData.nama}</strong>. Kami telah menerima permintaan booking Anda untuk paket <strong>{paketNama}</strong>.</p>
                  <p>Tim kami akan segera menghubungi Anda melalui WhatsApp untuk proses pembayaran dan konfirmasi ketersediaan.</p>
                  
                  <div className={styles.successActions}>
                    <a 
                      href={`https://wa.me/${formatWa(whatsappNumber)}?text=${encodeURIComponent(`Halo Agendain, saya ${formData.nama} telah melakukan booking untuk paket ${paketNama} pada ${formData.tanggal} sebanyak ${formData.jumlahPax} Pax. Saya ingin melanjutkan proses pembayaran.`)}`}
                      target="_blank" 
                      rel="noreferrer" 
                      className={styles.btnSubmit}
                    >
                      Lanjut ke WhatsApp
                    </a>
                    <button onClick={() => router.push('/')} className={styles.btnSecondary}>Kembali ke Beranda</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
