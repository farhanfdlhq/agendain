"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2, UploadCloud, Eye, EyeOff } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default function ProfilePage() {
  const { update } = useSession()
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

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
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
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Profil</h2>
          <p className="text-muted-foreground text-sm">Atur informasi dasar akun dan pengaturan keamanan profil Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted/50 bg-muted flex items-center justify-center shadow-sm">
                {accountData.avatar ? (
                  <img src={accountData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-semibold text-muted-foreground">
                    {accountData.nama ? accountData.nama.charAt(0).toUpperCase() : "A"}
                  </span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Ganti Foto
              </Button>
              <p className="text-xs text-muted-foreground text-center">Format JPG, PNG, atau WEBP. Maks 2MB.</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleAccountSubmit}>
              <CardHeader>
                <CardTitle>Profil Pengguna</CardTitle>
                <CardDescription>Informasi ini akan ditampilkan publik dan digunakan untuk notifikasi sistem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    type="text"
                    value={accountData.nama}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountData({ ...accountData, nama: e.target.value })}
                    required
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountData({ ...accountData, email: e.target.value })}
                    required
                    placeholder="admin@example.com"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
                <Button type="submit" disabled={savingAccount} className="bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm">
                  {savingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Profil
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <form onSubmit={handlePasswordSubmit}>
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>Pastikan akun Anda menggunakan kata sandi yang kuat.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Kata Sandi Lama</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      className="pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Ulangi kata sandi baru"
                      className="pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
                <Button type="submit" disabled={savingPassword} className="bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm">
                  {savingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Perbarui Sandi
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
