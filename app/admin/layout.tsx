"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, Settings, LogOut, CalendarDays, Palette, UserCog, Menu, ExternalLink, ChevronDown, ChevronRight, ChevronLeft, Users, UsersRound, Gem, Info, Home, Newspaper, Shield, ScrollText, History, PanelBottom, Receipt, SlidersHorizontal, Route } from "lucide-react"
import "./admin.css"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/reui/badge"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { hasPermission, type PermissionSubject } from "@/lib/permissions"
import { APP_VERSION } from "@/lib/changelog"
import { adminPreviewUrl } from "@/lib/admin-preview-url"
import { LOGO_WHITE } from "@/lib/site-logo"
import { AdminAccessContext } from "@/components/admin/admin-access"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [siteLogo, setSiteLogo] = useState(LOGO_WHITE)
  const [siteName, setSiteName] = useState("Agendain")
  // Dipakai saat sidebar menyempit — logo penuh terlalu lebar di lebar kolaps.
  const [siteFavicon, setSiteFavicon] = useState("/favicon.ico")
  const userId = session?.user && "id" in session.user && typeof session.user.id === "string"
    ? session.user.id : undefined
  type AdminSubject = PermissionSubject & { roleName: string }
  const [access, setAccess] = useState<{ userId: string; subject: AdminSubject | null } | null>(null)
  const [accessAttempt, setAccessAttempt] = useState(0)
  const meLoaded = !!userId && access?.userId === userId
  const me = meLoaded ? access?.subject : null
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  // Kosong = tiap grup ikut aturan default (terbuka bila memuat halaman aktif);
  // terisi setelah pengguna membuka/menutup grup secara manual.
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.replace("/admin/login")
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
        if (data.site_favicon) {
          setSiteFavicon(data.site_favicon)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (status !== "authenticated" || !userId) return
    const controller = new AbortController()
    fetch('/api/admin/me', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error("Izin tidak dapat dimuat")
        return res.json()
      })
      .then(data => {
        if (typeof data?.role !== "string" || !Array.isArray(data.permissions)) throw new Error("Izin tidak valid")
        if (!controller.signal.aborted) setAccess({
          userId, subject: { role: data.role, roleName: data.roleName || data.role, permissions: data.permissions },
        })
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccess({ userId, subject: null })
      })
    return () => controller.abort()
  }, [status, userId, accessAttempt])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (status === "loading" || (status === "authenticated" && !meLoaded)) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-muted-foreground gap-4">
        <AirplaneLoader size={48} />
        <p className="font-medium animate-pulse mt-2">Menyiapkan dashboard...</p>
      </div>
    )
  }

  if (!session) return null

  if (!me) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert">Hak akses belum bisa dimuat. Coba lagi untuk membuka admin.</p>
        <div className="flex gap-2">
          <Button onClick={() => { setAccess(null); setAccessAttempt(value => value + 1) }}>Coba lagi</Button>
          <Button variant="outline" onClick={() => signOut()}>Keluar</Button>
        </div>
      </div>
    )
  }
  const subject = me

  // Permission yang dibutuhkan tiap menu; array kosong = cukup login sebagai
  // admin (mis. Overview & Akun/Profil). Semantiknya OR — lihat lib/permissions.
  const BLOG_ANY = ['blog_view', 'blog_create', 'blog_edit', 'blog_delete']

  // `routes`: halaman anggota menu (tampil sebagai TAB di atas konten, bukan
  // menu sidebar terpisah). Tiap rute tetap punya URL & permission sendiri, jadi
  // bookmark lama dan gerbang akses per halaman tidak berubah.
  type MenuRoute = { name: string; href: string; perm: string[] }
  type MenuItem = { name: string; href: string; icon: React.ReactNode; perm: string[]; badge?: string; tabName?: string; routes?: MenuRoute[] }
  type MenuGroup = { heading: string; collapsible?: boolean; hidden?: boolean; items: MenuItem[] }

  const menuGroups: MenuGroup[] = [
    {
      heading: 'UTAMA',
      items: [
        { name: 'Ringkasan', href: '/admin', icon: <LayoutDashboard size={18} />, perm: [] },
        { name: 'Artikel Blog', href: '/admin/blog', icon: <ScrollText size={18} />, perm: BLOG_ANY },
        { name: 'Paket Wisata', href: '/admin/open-trip', icon: <Package size={18} />, perm: ['paket_view'] },
        // Booking open trip & permintaan private trip = sama-sama pesanan masuk.
        {
          name: 'Pesanan', tabName: 'Booking Open Trip', href: '/admin/booking', icon: <CalendarDays size={18} />, perm: ['booking_view'],
          routes: [{ name: 'Permintaan Private Trip', href: '/admin/inquiries', perm: ['inquiry_view'] }],
        },
      ]
    },
    {
      // Invoice & Itinerary = dokumen klien ber-kop sama. Digabung dalam satu
      // grup DOKUMEN; kop/identitas perusahaan dipakai bersama dari Pengaturan Dokumen.
      heading: 'DOKUMEN',
      collapsible: true,
      items: [
        { name: 'Invoice', href: '/admin/invoice', icon: <Receipt size={18} />, perm: ['invoice_view'] },
        { name: 'Itinerary', href: '/admin/itinerary', icon: <Route size={18} />, perm: ['itinerary_view'] },
        // Digerbangi `settings_manage`, BUKAN `invoice_edit`: mengganti nomor
        // rekening adalah vektor penipuan (nomor ditukar, uang klien mengalir ke penipu).
        {
          name: 'Pengaturan Dokumen', tabName: 'Identitas & Kop', href: '/admin/invoice/pengaturan', icon: <SlidersHorizontal size={18} />, perm: ['settings_manage'],
          routes: [{ name: 'Akun Pembayaran', href: '/admin/invoice/akun-pembayaran', perm: ['settings_manage'] }],
        },
      ]
    },
    {
      // Isi & tampilan situs publik. "Artikel Blog" = DATA blog; "Halaman Blog"
      // = tampilan halaman daftar blog (hero dsb.).
      heading: 'HALAMAN SITUS',
      collapsible: true,
      items: [
        { name: 'Beranda', href: '/admin/cms/home', icon: <Home size={18} />, perm: ['cms_manage'] },
        { name: 'Tentang Kami', href: '/admin/cms/about', icon: <Info size={18} />, perm: ['cms_manage'] },
        // Ikon dibedakan per halaman: rombongan (open trip) vs eksklusif (private trip).
        { name: 'Open Trip', href: '/admin/cms/open-trip', icon: <UsersRound size={18} />, perm: ['cms_manage'] },
        { name: 'Private Trip', href: '/admin/cms/private-trip', icon: <Gem size={18} />, perm: ['cms_manage'] },
        { name: 'Halaman Blog', href: '/admin/cms/blog', icon: <Newspaper size={18} />, perm: ['cms_manage'] },
        { name: 'Kebijakan Privasi', href: '/admin/cms/privacy', icon: <Shield size={18} />, perm: ['cms_manage'] },
        { name: 'Footer', href: '/admin/cms/footer', icon: <PanelBottom size={18} />, perm: ['cms_manage'] },
      ]
    },
    {
      // PENGATURAN diletakkan PALING BAWAH: sistem, user, keamanan —
      // urusan konfigurasi yang jarang disentuh, tidak menyela menu harian.
      heading: 'PENGATURAN',
      collapsible: true,
      items: [
        { name: 'Pengaturan Sistem', href: '/admin/settings', icon: <Settings size={18} />, perm: ['settings_manage'] },
        { name: 'Tema & Tampilan', href: '/admin/settings/design', icon: <Palette size={18} />, perm: ['settings_manage'] },
        {
          name: 'Pengguna & Akses', tabName: 'Pengguna', href: '/admin/settings/users', icon: <Users size={18} />, perm: ['users_manage'],
          routes: [{ name: 'Peran & Izin', href: '/admin/settings/roles', perm: ['roles_manage'] }],
        },
        { name: 'Audit Log', href: '/admin/settings/audit-log', icon: <History size={18} />, perm: ['audit_view'] },
      ]
    },
    {
      // Tidak tampil di sidebar — dibuka dari menu avatar (pojok kiri bawah),
      // tapi tetap terdaftar untuk judul halaman & gerbang izin.
      heading: 'AKUN',
      hidden: true,
      items: [
        { name: 'Akun & Profil', href: '/admin/settings/profile', icon: <UserCog size={18} />, perm: ['profile_manage'] },
      ]
    },
  ]

  // Setiap halaman yang dikenal: menu itu sendiri + rute anggotanya (tab).
  type MenuEntry = { item: MenuItem; name: string; href: string; perm: string[] }
  const entriesOf = (item: MenuItem): MenuEntry[] => [
    { item, name: item.tabName ?? item.name, href: item.href, perm: item.perm },
    ...(item.routes ?? []).map((r) => ({ item, ...r })),
  ]
  const allEntries = menuGroups.flatMap(g => g.items.flatMap(entriesOf))
  const activeEntry = allEntries.reduce<MenuEntry | null>((best, e) => {
    if (pathname === e.href || (e.href !== '/admin' && pathname.startsWith(e.href + '/'))) {
      if (!best || e.href.length > best.href.length) return e
    }
    return best
  }, null)
  const activeItem = activeEntry?.item ?? null
  const canOpen = (perm: string[]) => hasPermission(subject, ...perm)
  // Menu tampil bila salah satu tab-nya boleh dibuka; tautannya ke tab pertama yang boleh.
  const menuHref = (item: MenuItem) => entriesOf(item).find(e => canOpen(e.perm))?.href ?? null

  // Grup yang memuat halaman aktif terbuka otomatis; buka/tutup manual menang.
  const isGroupExpanded = (heading: string) => {
    if (heading in expandedGroups) return expandedGroups[heading]
    return menuGroups.some(g => g.heading === heading && g.items.some(i => i === activeItem))
  }
  const toggleGroup = (heading: string) => {
    setExpandedGroups(prev => ({ ...prev, [heading]: !isGroupExpanded(heading) }))
  }

  // Tab hanya di halaman tab itu sendiri (bukan halaman turunan seperti editor
  // artikel) dan bila minimal 2 tab boleh dibuka.
  const sectionTabs = activeItem?.routes && allEntries.some(e => e.href === pathname)
    ? entriesOf(activeItem).filter(e => canOpen(e.perm))
    : []

  const pageTitle = activeEntry
    ? (activeEntry.href === activeItem?.href ? activeItem.name : activeEntry.name)
    : "Dashboard"

  // Form artikel memerlukan izin aksinya, bukan sekadar izin membuka daftar.
  const pagePermission = pathname === '/admin/blog/baru' ? ['blog_create']
    : /^\/admin\/blog\/[^/]+\/edit$/.test(pathname) ? ['blog_edit']
    : activeEntry?.perm
  const pageAllowed = !pagePermission || canOpen(pagePermission)

  // Render sebagai fungsi: state grup tidak me-mount ulang tombol dan membuang fokus.
  const renderSidebarContent = (collapsed = false, prefix = 'desktop') => (
    <div className="flex flex-col h-full bg-sidebar/95 backdrop-blur-xl border-r border-border/60 text-sidebar-foreground shadow-sm overflow-hidden">
      {/* Branding: logo situs saat sidebar terbuka, favicon saat menyempit.
          Tanpa teks — logo sudah memuat wordmark, dan "Workspace" hanya
          menambah bising. `alt` tetap diisi nama situs untuk pembaca layar. */}
      <div className={`p-6 pb-2 flex items-center ${collapsed ? 'justify-center p-4' : ''}`}>
        <Link href="/admin" className="block overflow-hidden" aria-label={siteName}>
          {collapsed ? (
            <img src={siteFavicon} alt={siteName} className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            // `site_logo` adalah logo versi PUTIH — dipakai footer & navbar
            // publik yang berlatar navy. Sidebar admin berlatar terang, jadi
            // logo diberi alas warna brand agar tetap terbaca.
            <span className="flex items-center rounded-xl bg-primary px-3 py-2">
              <img src={siteLogo} alt={siteName} className="h-7 w-auto max-w-[148px] object-contain" />
            </span>
          )}
        </Link>
      </div>
      
      <nav aria-label="Menu admin" className={`flex-1 overflow-y-auto py-5 space-y-6 scrollbar-thin ${collapsed ? 'px-2' : 'px-4'}`}>
        {menuGroups.map((group, groupIndex) => {
          if (group.hidden) return null
          const filteredItems = group.items.filter(item => menuHref(item) !== null)
          if (filteredItems.length === 0) return null
          const isExpanded = collapsed || !group.collapsible || isGroupExpanded(group.heading)
          const groupId = `${prefix}-menu-group-${groupIndex}`

          return (
            <div key={group.heading} className="space-y-3">
              {collapsed ? (
                <div className="px-3" title={group.heading}><Separator /><span className="sr-only">{group.heading}</span></div>
              ) : group.collapsible ? (
                <button type="button" aria-expanded={isExpanded} aria-controls={groupId}
                  className="flex min-h-9 w-full cursor-pointer items-center justify-between rounded-md px-3 text-[11px] font-bold tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  onClick={() => toggleGroup(group.heading)}>
                  <span>{group.heading}</span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <p className="px-3 text-[11px] font-bold tracking-widest text-muted-foreground">{group.heading}</p>
              )}
              
              {isExpanded && (
                <div id={groupId} className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = activeItem?.href === item.href
                    return (
                      <Link 
                        key={item.href} 
                        href={menuHref(item)!}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label={item.name}
                        aria-current={isActive ? 'page' : undefined}
                        title={collapsed ? item.name : undefined}
                        className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'} rounded-xl transition-colors motion-reduce:transition-none text-sm font-medium relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          isActive 
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-sidebar-foreground/70 hover:bg-black/5 hover:text-sidebar-foreground dark:hover:bg-white/5"
                        }`}
                      >
                        <div className={`flex items-center relative z-10 ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                          <span className={isActive ? "text-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-primary"}>
                            {item.icon}
                          </span>
                          {!collapsed && <span className="truncate">{item.name}</span>}
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

      <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-border/40 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 mt-auto`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Menu akun" variant="ghost" className={`w-full h-auto p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-border/50 hover:shadow-sm group flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                <AvatarImage src={session.user?.avatar || ""} alt={session.user?.name || "Avatar"} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {session.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start ml-3 overflow-hidden text-left flex-1">
                  <span className="text-sm font-bold truncate w-full text-foreground group-hover:text-primary transition-colors">{session.user?.name}</span>
                  {/* Versi web sebaris dengan role → tinggi kartu profil tidak bertambah. */}
                  <span className="text-[11px] text-muted-foreground font-semibold mt-0.5 truncate w-full">
                    <span className="uppercase tracking-wider">{subject.roleName}</span>
                    <span className="font-medium tabular-nums opacity-80"> · v{APP_VERSION}</span>
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={12} className="w-64 rounded-2xl shadow-2xl p-2 border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="p-2 pb-3 mb-2 border-b border-border/50 flex items-center gap-3">
               <Avatar className="h-10 w-10 border border-border/80">
                <AvatarImage src={session.user?.avatar || ""} alt={session.user?.name || "Avatar"} />
                <AvatarFallback className="bg-primary/10 text-primary">{session.user?.name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-none mb-1">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </div>
            </div>
            {canOpen(['profile_manage']) && <DropdownMenuItem asChild className="rounded-lg py-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
              <Link href="/admin/settings/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Pengaturan Profil</span>
              </Link>
            </DropdownMenuItem>}
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
    <AdminAccessContext.Provider value={subject}>
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 flex text-foreground font-sans selection:bg-primary/20">
      
      {/* Desktop Sidebar */}
      <aside aria-label="Sidebar admin" className={`hidden lg:block shrink-0 h-dvh sticky top-0 z-30 transition-[width] duration-200 motion-reduce:transition-none relative ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
        {renderSidebarContent(isSidebarCollapsed)}
        <Button 
          variant="outline" 
          size="icon" 
          aria-label={isSidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          aria-expanded={!isSidebarCollapsed}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border shadow-sm bg-background z-40 hover:bg-muted"
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden relative">
        <header className="h-[72px] shrink-0 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-all">
          <div className="flex min-w-0 items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-lg hover:bg-muted/80">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] max-w-[calc(100vw-2rem)] border-r-0 shadow-2xl">
                <SheetTitle className="sr-only">Navigasi Admin</SheetTitle>
                {renderSidebarContent(false, 'mobile')}
              </SheetContent>
            </Sheet>
            
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-lg md:text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="rounded-full shadow-none transition-all px-4 hidden sm:flex border-border/50 bg-transparent hover:bg-muted text-foreground">
              {/* Membuka halaman publik yang sesuai dengan halaman admin yang sedang dibuka. */}
              <Link href={adminPreviewUrl(pathname)} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span className="font-medium">Lihat Website</span>
              </Link>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="mx-auto max-w-7xl">
            {sectionTabs.length > 1 && (
              <nav aria-label={activeItem?.name} className="mb-6 inline-flex w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground">
                {sectionTabs.map((tab) => {
                  const isActive = pathname === tab.href
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-4 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-ring",
                        isActive
                          ? "bg-background text-foreground shadow-sm font-semibold"
                          : "text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                      )}
                    >
                      {tab.name}
                    </Link>
                  )
                })}
              </nav>
            )}
            {pageAllowed ? children : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-background p-10 text-center">
                <Shield className="h-10 w-10 text-muted-foreground/40" />
                <h2 className="text-lg font-bold">Akses ditolak</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  Role <strong>{subject.roleName}</strong> tidak memiliki izin untuk membuka halaman ini.
                  Hubungi Super Admin bila Anda seharusnya punya akses.
                </p>
                <Button variant="outline" asChild className="mt-2 rounded-full">
                  <Link href="/admin">Kembali ke Ringkasan</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </AdminAccessContext.Provider>
  )
}
