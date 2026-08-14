"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, Map, MessageSquare, Settings, LogOut, CalendarDays, Palette, UserCog, Menu, ExternalLink, ChevronDown, ChevronRight, ChevronLeft, MoreHorizontal, Users, Info, Image as ImageIcon, Shield } from "lucide-react"
import "./admin.css"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/reui/badge"
import PlugConnectedIcon from "@/components/ui/plug-connected-icon"
import AirplaneLoader from "@/components/ui/airplane-loader"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [siteLogo, setSiteLogo] = useState("/agendain.jpeg")
  const [siteName, setSiteName] = useState("Agendain")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'PENGATURAN': false,
    'KONTEN & DESAIN': false
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
        if (data.site_name) {
          setSiteName(data.site_name)
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
      <div className="flex flex-col h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-muted-foreground gap-4">
        <AirplaneLoader size={48} />
        <p className="font-medium animate-pulse mt-2">Menyiapkan Workspace...</p>
      </div>
    )
  }

  if (!session) return null

  const userRole = (session.user as any)?.role || 'editor'

  const ROLE_HIERARCHY: Record<string, number> = {
    super_admin: 3,
    admin: 2,
    editor: 1,
  }

  type MenuItem = { name: string; href: string; icon: React.ReactNode; minRole: string; badge?: string }
  type MenuGroup = { heading: string; collapsible?: boolean; items: MenuItem[] }

  const menuGroups: MenuGroup[] = [
    {
      heading: 'MAIN MENU',
      items: [
        { name: 'Overview', href: '/admin', icon: <LayoutDashboard size={18} />, minRole: 'editor' },
        { name: 'Paket Wisata', href: '/admin/open-trip', icon: <Package size={18} />, minRole: 'editor' },
        { name: 'Destinasi', href: '/admin/destinasi', icon: <Map size={18} />, minRole: 'editor' },
        { name: 'Pesanan', href: '/admin/booking', icon: <CalendarDays size={18} />, minRole: 'admin' },
        { name: 'Inquiries', href: '/admin/inquiries', icon: <MessageSquare size={18} />, minRole: 'admin', badge: 'Baru' },
      ]
    },
    {
      heading: 'PENGATURAN',
      collapsible: true,
      items: [
        { name: 'Pengaturan Sistem', href: '/admin/settings', icon: <Settings size={18} />, minRole: 'super_admin' },
        { name: 'Kelola User', href: '/admin/settings/users', icon: <Users size={18} />, minRole: 'super_admin' },
        { name: 'Roles & Permissions', href: '/admin/settings/roles', icon: <PlugConnectedIcon size={18} />, minRole: 'super_admin' },
        { name: 'Akun & Profil', href: '/admin/settings/profile', icon: <UserCog size={18} />, minRole: 'editor' },
      ]
    },
    {
      heading: 'KONTEN & DESAIN',
      collapsible: true,
      items: [
        { name: 'Halaman Beranda', href: '/admin/cms/home', icon: <LayoutDashboard size={18} />, minRole: 'admin' },
        { name: 'Tentang Kami', href: '/admin/cms/about', icon: <Info size={18} />, minRole: 'admin' },
        { name: 'Header Open Trip', href: '/admin/cms/open-trip', icon: <ImageIcon size={18} />, minRole: 'admin' },
        { name: 'Header Private Trip', href: '/admin/cms/private-trip', icon: <ImageIcon size={18} />, minRole: 'admin' },
        { name: 'Kebijakan Privasi', href: '/admin/cms/privacy', icon: <Shield size={18} />, minRole: 'admin' },
        { name: 'Tema & Tampilan', href: '/admin/settings/design', icon: <Palette size={18} />, minRole: 'super_admin' },
      ]
    }
  ]

  const toggleGroup = (heading: string) => {
    setExpandedGroups(prev => ({ ...prev, [heading]: !prev[heading] }))
  }

  const formatRole = (role: string) => {
    if (role === 'super_admin') return 'Super Admin'
    if (role === 'admin') return 'Administrator'
    return 'Editor'
  }

  const allItems = menuGroups.flatMap(g => g.items)
  const activeItem = allItems.reduce((bestMatch, item) => {
    if (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))) {
      if (!bestMatch || item.href.length > bestMatch.href.length) return item
    }
    return bestMatch
  }, null as any)

  const pageTitle = activeItem ? activeItem.name : "Dashboard"

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-sidebar/95 backdrop-blur-xl border-r border-border/60 text-sidebar-foreground shadow-sm overflow-hidden">
      <div className={`p-6 pb-2 flex items-center ${collapsed ? 'justify-center p-4' : 'gap-3'}`}>
        <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shrink-0">
          <Map className="text-primary w-6 h-6" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent truncate w-32">{siteName}</h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Workspace</p>
          </div>
        )}
      </div>
      
      <nav className={`flex-1 overflow-y-auto py-6 space-y-8 scrollbar-thin ${collapsed ? 'px-2' : 'px-4'}`}>
        {menuGroups.map((group) => {
          const filteredItems = group.items.filter(item => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[item.minRole])
          if (filteredItems.length === 0) return null
          const isExpanded = group.collapsible ? expandedGroups[group.heading] : true

          return (
            <div key={group.heading} className="space-y-3">
              <div 
                className={`text-[11px] font-bold text-muted-foreground/80 tracking-widest flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-3'} ${group.collapsible && !collapsed ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
                onClick={() => !collapsed && group.collapsible && toggleGroup(group.heading)}
                title={collapsed ? group.heading : undefined}
              >
                {collapsed ? <MoreHorizontal size={14} className="opacity-50" /> : <span>{group.heading}</span>}
                {!collapsed && group.collapsible && (
                  isExpanded ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />
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
                        title={collapsed ? item.name : undefined}
                        className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl transition-all duration-300 text-sm font-medium relative overflow-hidden ${
                          isActive 
                            ? "text-white shadow-lg shadow-primary/20 ring-1 ring-primary/20" 
                            : "text-sidebar-foreground/70 hover:bg-black/5 hover:text-sidebar-foreground dark:hover:bg-white/5"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 z-0" />
                        )}
                        <div className={`flex items-center relative z-10 ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                          <span className={`transition-transform duration-300 ${isActive ? "scale-110 text-white" : "group-hover:scale-110 text-sidebar-foreground/50 group-hover:text-primary"}`}>
                            {item.icon}
                          </span>
                          {!collapsed && <span className={isActive ? "text-white drop-shadow-sm font-bold truncate" : "truncate"}>{item.name}</span>}
                        </div>
                        {!collapsed && item.badge && (
                          <Badge variant={isActive ? "secondary" : "default"} className={`relative z-10 text-[10px] h-5 px-1.5 font-bold shrink-0 ${isActive ? "bg-white/20 text-white hover:bg-white/30 border-transparent" : "bg-primary text-primary-foreground border-transparent"}`}>
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/40 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`w-full h-auto p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-border/50 hover:shadow-sm group flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                <AvatarImage src={(session.user as any)?.avatar || ""} alt={session.user?.name || "Avatar"} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {session.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start ml-3 overflow-hidden text-left flex-1">
                  <span className="text-sm font-bold truncate w-full text-foreground group-hover:text-primary transition-colors">{session.user?.name}</span>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{formatRole(userRole)}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={12} className="w-64 rounded-2xl shadow-2xl p-2 border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="p-2 pb-3 mb-2 border-b border-border/50 flex items-center gap-3">
               <Avatar className="h-10 w-10 border border-border/80">
                <AvatarImage src={(session.user as any)?.avatar || ""} alt={session.user?.name || "Avatar"} />
                <AvatarFallback className="bg-primary/10 text-primary">{session.user?.name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-none mb-1">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </div>
            </div>
            <DropdownMenuItem asChild className="rounded-lg py-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
              <Link href="/admin/settings/profile">
                <UserCog className="mr-2 h-4 w-4" />
                <span>Pengaturan Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors mt-1" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar dari Sesi</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex text-foreground font-sans selection:bg-primary/20">
      
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out relative ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
        <SidebarContent collapsed={isSidebarCollapsed} />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border shadow-sm bg-background z-40 hover:bg-muted"
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-[72px] shrink-0 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-all">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-lg hover:bg-muted/80">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-r-0 shadow-2xl">
                <SheetTitle className="sr-only">Navigasi Admin</SheetTitle>
                <SidebarContent collapsed={false} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="rounded-full shadow-none transition-all px-4 hidden sm:flex border-border/50 bg-transparent hover:bg-muted text-foreground">
              <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span className="font-medium">Lihat Website</span>
              </Link>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
