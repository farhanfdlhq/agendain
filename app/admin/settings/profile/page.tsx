"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2, Camera, UploadCloud } from "lucide-react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import styles from "./page.module.css"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(true)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [accountData, setAccountData] = useState({
    nama: "",
    email: "",
    avatar: ""
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile")
      if (!res.ok) throw new Error("Gagal mengambil data profil")
      const data = await res.json()
      setAccountData({
        nama: data.nama,
        email: data.email,
        avatar: data.avatar || ""
      })
    } catch (error) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAccount(true)
    
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: accountData.nama, email: accountData.email })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil")
      }
      
      await update({ name: data.nama })
      
      // Trigger a hard reload of the session data in other components if needed
      const event = new Event("visibilitychange")
      document.dispatchEvent(event)
      
      toast.success("Profil berhasil diperbarui")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSavingAccount(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok")
      return
    }
    
    setSavingPassword(true)
    
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui kata sandi")
      }
      
      toast.success("Kata sandi berhasil diperbarui")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB")
      return
    }

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const res = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto")
      
      setAccountData(prev => ({ ...prev, avatar: data.avatar }))
      await update({ avatar: data.avatar })
      
      const event = new Event("visibilitychange")
      document.dispatchEvent(event)

      toast.success("Foto profil berhasil diperbarui")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Profil</h1>
        <p className={styles.subtitle}>Atur informasi dasar akun dan pengaturan keamanan profil Anda.</p>
      </div>

      <div className={styles.grid}>
        {/* Kolom Kiri: Avatar */}
        <div className={styles.avatarCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Foto Profil</h2>
          </div>
          <div className={styles.avatarContent}>
            <div className={styles.avatarWrapper}>
              {accountData.avatar ? (
                <img src={accountData.avatar} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {accountData.nama ? accountData.nama.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              {uploadingAvatar && (
                <div className={styles.avatarOverlay}>
                  <Loader2 className={styles.spinner} size={24} />
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            
            <button 
              type="button"
              className={styles.uploadBtn} 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <UploadCloud size={18} />
              Ganti Foto
            </button>
            <p className={styles.avatarHint}>Format JPG, PNG, atau WEBP. Maks 2MB.</p>
          </div>
        </div>

        {/* Kolom Kanan: Form Data */}
        <div className={styles.formCol}>
          <form onSubmit={handleAccountSubmit} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Profil Pengguna</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label htmlFor="nama">Nama Lengkap</label>
                <input
                  id="nama"
                  type="text"
                  className={styles.input}
                  value={accountData.nama}
                  onChange={(e) => setAccountData({ ...accountData, nama: e.target.value })}
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Alamat Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  required
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button type="submit" className={styles.saveBtn} disabled={savingAccount}>
                {savingAccount ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
                Simpan Profil
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordSubmit} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Keamanan</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Kata Sandi Lama</label>
                <input
                  id="currentPassword"
                  type="password"
                  className={styles.input}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">Kata Sandi Baru</label>
                <input
                  id="newPassword"
                  type="password"
                  className={styles.input}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={styles.input}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  placeholder="Ulangi kata sandi baru"
                />
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button type="submit" className={styles.saveBtn} disabled={savingPassword}>
                {savingPassword ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
                Perbarui Sandi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
