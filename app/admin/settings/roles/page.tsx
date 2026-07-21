"use client"

import { useState, useEffect, useMemo, useDeferredValue } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Shield, Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AirplaneLoader from "@/components/ui/airplane-loader"

type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount?: number
}

const PERMISSIONS_GROUPS = [
  {
    category: 'PAKET WISATA',
    items: [
      { id: 'paket_view', label: 'View Paket Wisata' },
      { id: 'paket_create', label: 'Create Paket Wisata' },
      { id: 'paket_edit', label: 'Edit Paket Wisata' },
      { id: 'paket_delete', label: 'Delete Paket Wisata' },
    ]
  },
  {
    category: 'DESTINASI',
    items: [
      { id: 'destinasi_view', label: 'View Destinasi' },
      { id: 'destinasi_create', label: 'Create Destinasi' },
      { id: 'destinasi_edit', label: 'Edit Destinasi' },
      { id: 'destinasi_delete', label: 'Delete Destinasi' },
    ]
  },
  {
    category: 'PESANAN (BOOKING)',
    items: [
      { id: 'booking_view', label: 'View Pesanan' },
      { id: 'booking_create', label: 'Create Pesanan' },
      { id: 'booking_edit', label: 'Edit Pesanan' },
      { id: 'booking_delete', label: 'Delete Pesanan' },
    ]
  },
  {
    category: 'INQUIRIES',
    items: [
      { id: 'inquiry_view', label: 'View Inquiries' },
      { id: 'inquiry_edit', label: 'Edit Inquiries' },
      { id: 'inquiry_delete', label: 'Delete Inquiries' },
    ]
  },
  {
    category: 'SYSTEM & SETTINGS',
    items: [
      { id: 'users_manage', label: 'Kelola Users & Roles' },
      { id: 'settings_manage', label: 'Pengaturan Sistem' },
      { id: 'cms_manage', label: 'Kelola Konten & Desain' },
    ]
  }
]

const ALL_PERMISSION_IDS = PERMISSIONS_GROUPS.flatMap(g => g.items.map(i => i.id))

export default function RolesPermissionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Role>({ id: '', name: '', description: '', permissions: [] })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session && (session.user as any)?.role !== 'super_admin') {
      router.push('/admin')
      return
    }
    fetchRoles()
  }, [session, router])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/roles")
      if (res.ok) setRoles(await res.json())
    } catch (e) {
      toast.error("Gagal memuat roles")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingId(role.id)
      setFormData(role)
    } else {
      setEditingId(null)
      setFormData({ id: '', name: '', description: '', permissions: [] })
    }
    setIsDialogOpen(true)
  }

  const handleGlobalSelectAll = (checked: boolean) => {
    setFormData({ ...formData, permissions: checked ? ['all'] : [] })
  }

  const handleGroupSelectAll = (category: string, checked: boolean) => {
    const groupItemIds = PERMISSIONS_GROUPS.find(g => g.category === category)!.items.map(i => i.id)
    let newPerms = formData.permissions.filter(p => p !== 'all') // Drop 'all' if present
    
    if (checked) {
      // Add all group items that aren't already present
      groupItemIds.forEach(id => {
        if (!newPerms.includes(id)) newPerms.push(id)
      })
    } else {
      // Remove all group items
      newPerms = newPerms.filter(p => !groupItemIds.includes(p))
    }
    
    setFormData({ ...formData, permissions: newPerms })
  }

  const handlePermissionChange = (permId: string, checked: boolean) => {
    let newPerms = formData.permissions.filter(p => p !== 'all')
    if (checked) {
      newPerms.push(permId)
    } else {
      newPerms = newPerms.filter(p => p !== permId)
    }
    setFormData({ ...formData, permissions: newPerms })
  }

  const isGroupFullySelected = (category: string) => {
    if (formData.permissions.includes('all')) return true
    const groupItemIds = PERMISSIONS_GROUPS.find(g => g.category === category)!.items.map(i => i.id)
    return groupItemIds.every(id => formData.permissions.includes(id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let newRoles = [...roles]
      if (!formData.id) {
        formData.id = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      }
      
      if (editingId) {
        newRoles = newRoles.map(r => r.id === editingId ? formData : r)
      } else {
        if (newRoles.some(r => r.id === formData.id)) {
          toast.error("Role dengan nama ini sudah ada")
          setIsSaving(false)
          return
        }
        newRoles.push(formData)
      }

      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoles)
      })

      if (res.ok) {
        toast.success(editingId ? "Role diperbarui" : "Role ditambahkan")
        setIsDialogOpen(false)
        fetchRoles()
      } else {
        toast.error("Gagal menyimpan role")
      }
    } catch (e) {
      toast.error("Terjadi kesalahan jaringan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (['super_admin', 'admin', 'editor'].includes(id)) {
      toast.error("Role bawaan sistem tidak dapat dihapus")
      return
    }
    if (!confirm("Hapus role ini? User dengan role ini mungkin kehilangan akses.")) return
    
    try {
      const newRoles = roles.filter(r => r.id !== id)
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoles)
      })
      if (res.ok) {
        toast.success("Role dihapus")
        fetchRoles()
      }
    } catch (e) {
      toast.error("Terjadi kesalahan jaringan")
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><AirplaneLoader size={48} /></div>

  const isAllSelected = formData.permissions.includes('all')
  const isSuperAdmin = editingId === 'super_admin'

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Roles & Permissions</h2>
        </div>
        <Button onClick={() => handleOpenDialog()} className="font-semibold rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Role
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-lg">Daftar Role</h3>
          </div>
          
          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground">Nama Role</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Deskripsi</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">Permissions</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-center">User Count</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id} className="border-b-0">
                    <TableCell className="font-semibold">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.description}</TableCell>
                    <TableCell className="text-center font-medium">
                      {r.permissions.includes('all') ? 'All' : r.permissions.length} permissions
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-xs font-semibold">
                        {r.userCount || 0} users
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => handleOpenDialog(r)}>Edit Role</DropdownMenuItem>
                          {!['super_admin', 'admin', 'editor'].includes(r.id) && (
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(r.id)}>Hapus Role</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-2xl h-[85vh] flex flex-col overflow-hidden p-0">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b-2 border-border shrink-0">
              <DialogTitle className="text-xl">{editingId ? `Edit Role: ${formData.name}` : 'Tambah Role Baru'}</DialogTitle>
              <DialogDescription className="sr-only">Formulir untuk menambah atau mengedit role</DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase">Nama Role</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Admin 2" className="rounded-lg" disabled={isSuperAdmin} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc" className="text-xs font-bold text-muted-foreground uppercase">Deskripsi</Label>
                  <Input id="desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Penjelasan role" className="rounded-lg" disabled={isSuperAdmin} />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Permissions</Label>
                <div className="flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full border border-primary/20 dark:border-primary/30">
                  <Checkbox 
                    id="all-access" 
                    checked={isAllSelected}
                    disabled={isSuperAdmin}
                    onCheckedChange={(c) => handleGlobalSelectAll(c as boolean)}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <label htmlFor="all-access" className="text-xs font-bold text-primary dark:text-primary cursor-pointer uppercase">
                    FULL ACCESS (Pilih Semua)
                  </label>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {PERMISSIONS_GROUPS.map((group) => {
                  const isGroupSelected = isGroupFullySelected(group.category)
                  
                  return (
                    <div key={group.category} className="border rounded-xl bg-card overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b">
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{group.category}</span>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`group-${group.category}`} 
                            checked={isGroupSelected}
                            disabled={isAllSelected || isSuperAdmin}
                            onCheckedChange={(c) => handleGroupSelectAll(group.category, c as boolean)}
                          />
                          <label htmlFor={`group-${group.category}`} className="text-[10px] font-bold text-muted-foreground cursor-pointer uppercase">
                            Pilih Semua
                          </label>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {group.items.map(item => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <Checkbox 
                              id={`perm-${item.id}`} 
                              checked={isAllSelected || formData.permissions.includes(item.id)}
                              disabled={isAllSelected || isSuperAdmin}
                              onCheckedChange={(c) => handlePermissionChange(item.id, c as boolean)}
                              className="rounded-[4px] data-[state=checked]:bg-blue-600 border-zinc-300"
                            />
                            <label htmlFor={`perm-${item.id}`} className="text-sm font-medium leading-none cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button type="submit" disabled={isSaving || isSuperAdmin} className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold h-12 text-base" style={{ color: '#ffffff' }}>
                {isSaving ? <AirplaneLoader size={20} className="mr-2" /> : null}
                {isSuperAdmin ? 'Role System (Locked)' : 'Update Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
