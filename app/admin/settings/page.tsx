"use client"

import { useState, useEffect } from "react"
import { Settings, Save, Loader2, Link as LinkIcon, MessageSquare, CreditCard, LayoutTemplate } from "lucide-react"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    site_name: "Agendain",
    whatsapp_number: "6281234567890",
    whatsapp_message: "Halo Agendain, saya ingin bertanya tentang paket wisata.",
    payment_instructions: "Silakan transfer ke rekening BCA 1234567890 a.n PT Agendain.",
    site_logo: "/logo.png"
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })
      const data = await res.json()
      if (res.ok) {
        setFormData(prev => ({ ...prev, site_logo: data.url }))
        toast.success("Logo berhasil diunggah!")
      } else {
        toast.error("Upload gagal: " + data.error)
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat upload gambar.")
    } finally {
      setUploadingLogo(false)
    }
  }

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && Object.keys(data).length > 0) {
          setFormData(prev => ({ ...prev, ...data }))
        }
      })
      .catch(err => console.error(err))
      .finally(() => setFetching(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success("Pengaturan berhasil disimpan!")
      } else {
        toast.error("Gagal menyimpan pengaturan.")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--color-primary)" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-ink)", marginBottom: "8px" }}>
            Pengaturan Sistem
          </h2>
          <p style={{ color: "var(--color-muted)" }}>Konfigurasi parameter dan identitas utama website Agendain.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            backgroundColor: "var(--color-primary)", color: "white",
            border: "none", padding: "10px 20px", borderRadius: "var(--radius-md)",
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, transition: "background-color 0.2s"
          }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Simpan Perubahan
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-hairline)", overflow: "hidden" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          
          {/* Section: Identitas Website */}
          <div style={{ padding: "24px", borderBottom: "1px solid var(--color-hairline)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "var(--color-ink)" }}>
              <LayoutTemplate size={20} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Identitas Website</h3>
            </div>
            
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-ink)", marginBottom: "8px" }}>
                  Nama Website
                </label>
                <input
                  type="text"
                  name="site_name"
                  value={formData.site_name}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-ink)", marginBottom: "8px" }}>
                  Logo Website
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {formData.site_logo && formData.site_logo !== "/logo.png" ? (
                    <img src={formData.site_logo} alt="Logo" style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--color-hairline)" }} />
                  ) : (
                    <div style={{ width: "64px", height: "64px", borderRadius: "8px", background: "var(--color-surface-soft)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--color-border)" }}>
                      <LayoutTemplate size={24} color="var(--color-muted)" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: "none" }}
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      padding: "8px 16px", background: "white", border: "1px solid var(--color-border-strong)",
                      borderRadius: "var(--radius-md)", fontSize: "0.875rem", fontWeight: 500,
                      color: "var(--color-ink)", cursor: "pointer", transition: "all 0.2s"
                    }}>
                      {uploadingLogo ? <Loader2 size={16} className="animate-spin" /> : "Pilih Gambar Logo"}
                    </label>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "8px" }}>
                      Disarankan menggunakan gambar PNG dengan latar belakang transparan (rasio 1:1 atau 3:1).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Kontak & Komunikasi */}
          <div style={{ padding: "24px", borderBottom: "1px solid var(--color-hairline)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "var(--color-ink)" }}>
              <MessageSquare size={20} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Kontak & Pesan</h3>
            </div>
            
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-ink)", marginBottom: "8px" }}>
                  Nomor WhatsApp Utama (Gunakan format 62xxx)
                </label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  placeholder="6281234567890"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-ink)", marginBottom: "8px" }}>
                  Teks Pesan WhatsApp Default
                </label>
                <textarea
                  name="whatsapp_message"
                  value={formData.whatsapp_message}
                  onChange={handleChange}
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", outline: "none", transition: "border-color 0.2s", resize: "vertical" }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "4px" }}>Pesan ini akan otomatis terisi saat kustomer menekan tombol chat WhatsApp di frontend.</p>
              </div>
            </div>
          </div>

          {/* Section: Pembayaran */}
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "var(--color-ink)" }}>
              <CreditCard size={20} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Instruksi Pembayaran</h3>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-ink)", marginBottom: "8px" }}>
                Informasi Rekening / Metode Pembayaran
              </label>
              <textarea
                name="payment_instructions"
                value={formData.payment_instructions}
                onChange={handleChange}
                rows={4}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", outline: "none", transition: "border-color 0.2s", resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "4px" }}>Instruksi ini akan ditampilkan kepada kustomer setelah mereka melakukan booking.</p>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
