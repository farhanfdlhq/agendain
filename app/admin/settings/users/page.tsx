"use client"

import { useState, useEffect, useMemo, useDeferredValue } from "react"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { Plus, Users, Shield, MoreVertical, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AirplaneLoader from "@/components/ui/airplane-loader"

type RoleConfig = {
  id: string
  name: string
  permissions: string[]
}

type AdminUser = {
  id: number
  nama: string
  email: string
  role: string
  createdAt: string
}

export default function UserManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<RoleConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  
  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nama: '', email: '', password: '', role: 'editor' })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session && (session.user as any)?.role !== 'super_admin') {
      router.push('/admin')
      return
    }
    fetchData()
  }, [session, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles")
      ])
      if (usersRes.ok) setUsers(await usersRes.json())
      if (rolesRes.ok) setRoles(await rolesRes.json())
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: AdminUser) => {
    if (user) {
      setEditingId(user.id)
      setFormData({ nama: user.nama, email: user.email, password: '', role: user.role })
    } else {
      setEditingId(null)
      setFormData({ nama: '', email: '', password: '', role: roles.length > 0 ? roles[0].id : 'editor' })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users'
      const method = editingId ? 'PUT' : 'POST'
      
      const payload = { ...formData }
      if (editingId && !payload.password) delete (payload as any).password

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success(editingId ? "Pengguna diperbarui" : "Pengguna berhasil ditambahkan")
        setIsDialogOpen(false)
        fetchData()
      } else {
        toast.error(data.error || "Terjadi kesalahan")
      }
    } catch (err) {
      toast.error("Kesalahan jaringan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json()
      if (res.ok) {
        toast.success("Pengguna dihapus");
        fetchData();
      } else {
        toast.error(data.error || "Gagal menghapus pengguna");
      }
    } catch (e) {
      toast.error("Kesalahan jaringan");
    }
  }

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId
  }

  const getPermissionsCount = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return 0
    if (role.permissions.includes('all')) return 'All'
    return role.permissions.length
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const filteredUsers = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase()
    return users.filter(u => 
      u.nama.toLowerCase().includes(searchLower) || 
      u.email.toLowerCase().includes(searchLower)
    )
  }, [users, deferredSearch])

  if (loading) return <div className="flex h-64 items-center justify-center"><AirplaneLoader size={48} /></div>

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Kelola User</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari user..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-white dark:bg-zinc-900 border-zinc-200" 
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="font-semibold rounded-full px-6 whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-lg">Daftar Pengguna</h3>
          </div>
          
          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold text-muted-foreground py-4">Nama</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">Role</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">Permissions</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">Tanggal Dibuat</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const isYou = (session?.user as any)?.id == u.id
                  return (
                    <TableRow key={u.id} className={`border-b-0 ${isYou ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-semibold">
                            {u.nama}
                            {isYou && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-muted">You</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`font-medium rounded-full ${isYou ? 'bg-primary text-primary-foreground border-transparent' : 'bg-transparent'}`}>
                          <Shield size={12} className="mr-1" />
                          {getRoleName(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {getPermissionsCount(u.role)} permissions
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={() => handleOpenDialog(u)}>Edit User</DropdownMenuItem>
                            {!isYou && (
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(u.id)}>Hapus User</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Tidak ada pengguna ditemukan.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b-2 border-border pb-5 mb-5">
              <DialogTitle className="text-xl">{editingId ? 'Edit User' : 'Tambah User'}</DialogTitle>
              <DialogDescription className="sr-only">Formulir untuk menambah atau mengedit user</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input id="nama" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} required placeholder="Budi Santoso" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="budi@agendain.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingId} placeholder={editingId ? '(Kosongkan jika tidak ingin diubah)' : 'Minimal 6 karakter'} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Peran Akses (Role)</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full">Batal</Button>
              <Button type="submit" disabled={isSaving} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSaving ? <AirplaneLoader size={20} className="mr-2" /> : null}
                {editingId ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
