"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, Map, MessageSquare, Settings, LogOut, Loader2, CalendarDays, Palette, UserCog, ChevronDown, ChevronRight, Menu, ExternalLink } from "lucide-react"
import "./admin.css"
import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [siteLogo, setSiteLogo] = useState("/agendain.jpeg")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'PENGATURAN': false,
    'CMS & DESIGN': false
  })

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [status, router, pathname])

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_logo && data.site_logo !== "/logo.png") {
          setSiteLogo(data.site_logo)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background text-muted-foreground gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Memuat Dashboard...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = (session.user as any)?.role || 'editor'

  const ROLE_HIERARCHY: Record<string, number> = {
    super_admin: 3,
    admin: 2,
    editor: 1,
  }

  const menuGroups = [
    {
      heading: 'MAIN MENU',
      items: [
        { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} />, minRole: 'editor' },
        { name: 'Manajemen Paket', href: '/admin/paket', icon: <Package size={20} />, minRole: 'editor' },
        { name: 'Manajemen Destinasi', href: '/admin/destinasi', icon: <Map size={20} />, minRole: 'editor' },
        { name: 'Manajemen Pesanan', href: '/admin/booking', icon: <CalendarDays size={20} />, minRole: 'admin' },
        { name: 'Inquiries', href: '/admin/inquiries', icon: <MessageSquare size={20} />, minRole: 'admin' },
      ]
    },
    {
      heading: 'PENGATURAN',
      collapsible: true,
      items: [
        { name: 'Pengaturan Utama', href: '/admin/settings', icon: <Settings size={20} />, minRole: 'super_admin' },
        { name: 'Edit Profil', href: '/admin/settings/profile', icon: <UserCog size={20} />, minRole: 'editor' },
      ]
    },
    {
      heading: 'CMS & DESIGN',
      collapsible: true,
      items: [
        { name: 'Halaman Beranda', href: '/admin/cms/home', icon: <LayoutDashboard size={20} />, minRole: 'admin' },
        { name: 'Design System', href: '/admin/settings/design', icon: <Palette size={20} />, minRole: 'super_admin' },
      ]
    }
  ]

  const toggleGroup = (heading: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [heading]: !prev[heading]
    }))
  }

  const formatRole = (role: string) => {
    if (role === 'super_admin') return 'Super Admin'
    if (role === 'admin') return 'Administrator'
    return 'Editor'
  }

  const allItems = menuGroups.flatMap(g => g.items)
  const activeItem = allItems.reduce((bestMatch, item) => {
    if (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))) {
      if (!bestMatch || item.href.length > bestMatch.href.length) {
        return item
      }
    }
    return bestMatch
  }, null as any)

  const pageTitle = activeItem ? activeItem.name : "Dashboard"

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-border">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Agendain</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        {menuGroups.map((group) => {
          const filteredItems = group.items.filter(
            item => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[item.minRole]
          )
          
          if (filteredItems.length === 0) return null

          const isExpanded = group.collapsible ? expandedGroups[group.heading] : true

          return (
            <div key={group.heading} className="space-y-2">
              <div 
                className={`text-xs font-semibold text-muted-foreground tracking-wider flex items-center justify-between px-2 ${group.collapsible ? 'cursor-pointer hover:text-foreground' : ''}`}
                onClick={() => group.collapsible && toggleGroup(group.heading)}
              >
                <span>{group.heading}</span>
                {group.collapsible && (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                )}
              </div>
              
              {isExpanded && (
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = activeItem?.href === item.href
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className={isActive ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-2 hover:bg-muted">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={(session.user as any)?.avatar || ""} alt={session.user?.name || "Avatar"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {session.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start ml-3 overflow-hidden">
                <span className="text-sm font-semibold truncate max-w-[140px] text-foreground">{session.user?.name}</span>
                <span className="text-xs text-muted-foreground">{formatRole(userRole)}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings/profile" className="cursor-pointer">
                <UserCog className="mr-2 h-4 w-4" />
                <span>Edit Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' } }} />
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 shrink-0 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r-0">
                <SheetTitle className="sr-only">Navigasi Admin</SheetTitle>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
          </div>

          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Lihat Website
            </Link>
          </Button>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-background">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
