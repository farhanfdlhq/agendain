"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2, User } from "lucide-react"
import { toast } from "react-hot-toast"
import styles from "./page.module.css"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(true)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  
  const [accountData, setAccountData] = useState({
    nama: "",
    email: ""
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
        email: data.email
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
        body: JSON.stringify(accountData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil")
      }
      
      await update({ name: data.nama })
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
        <p className={styles.subtitle}>Kelola informasi akun dan preferensi keamanan Anda.</p>
      </div>

      <form onSubmit={handleAccountSubmit} className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Informasi Akun</h2>
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
            />
          </div>
        </div>
        <div className={styles.cardFooter}>
          <button type="submit" className={styles.saveBtn} disabled={savingAccount}>
            {savingAccount ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
            Simpan Perubahan
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Keamanan</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Kata Sandi Saat Ini</label>
            <input
              id="currentPassword"
              type="password"
              className={styles.input}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
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
            />
          </div>
        </div>
        <div className={styles.cardFooter}>
          <button type="submit" className={styles.saveBtn} disabled={savingPassword}>
            {savingPassword ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
            Ubah Kata Sandi
          </button>
        </div>
      </form>
    </div>
  )
}
