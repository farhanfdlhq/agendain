"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, Map, MessageSquare, Settings, LogOut, Loader2, CalendarDays, Palette, UserCog, ChevronDown, ChevronRight } from "lucide-react"
import styles from "./layout.module.css"
import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [siteLogo, setSiteLogo] = useState("/agendain.jpeg")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'PENGATURAN': false,
    'CMS & DESIGN': false
  })

  // Handle unauthenticated state manually just in case middleware is bypassed
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [status, router, pathname])

  // Fetch settings for logo
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
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }
    
    // Initial check
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [pathname])

  // Avoid wrapping the login page itself with the dashboard UI
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (status === "loading") {
    return (
      <div className={styles.loadingScreen}>
        <Loader2 className={styles.spinner} size={40} />
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const formatRole = (role: string) => {
    if (role === 'super_admin') return 'Super Admin'
    if (role === 'admin') return 'Administrator'
    return 'Editor'
  }

  return (
    <div className={styles.adminContainer}>
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--color-surface-card)', color: 'var(--color-ink)', border: '1px solid var(--color-border-strong)' } }} />
      <div className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.overlayOpen : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>Agendain</h2>
          <button onClick={toggleSidebar} className={styles.menuBtnSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        
        <nav className={styles.nav}>
          {menuGroups.map((group) => {
            const filteredItems = group.items.filter(
              item => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[item.minRole]
            )
            
            if (filteredItems.length === 0) return null

            const isExpanded = group.collapsible ? expandedGroups[group.heading] : true

            return (
              <div key={group.heading} className={styles.menuGroup}>
                <div 
                  className={`${styles.navHeading} ${group.collapsible ? styles.collapsibleHeading : ''}`}
                  onClick={() => group.collapsible && toggleGroup(group.heading)}
                >
                  <span>{group.heading}</span>
                  {group.collapsible && (
                    isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  )}
                </div>
                
                <div className={`${styles.groupItems} ${isExpanded ? '' : styles.groupItemsCollapsed}`}>
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href as string} 
                        className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{session.user?.name}</p>
              <p className={styles.userRole}>{formatRole(userRole)}</p>
            </div>
          </div>
          <button onClick={() => signOut()} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className={`${styles.mainContent} ${isSidebarOpen ? styles.mainShifted : ''}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button onClick={toggleSidebar} className={styles.mobileMenuBtn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className={styles.pageTitle}>
              {menuItems.find(m => m.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
          <div className={styles.topActions}>
            <Link href="/" target="_blank" className={styles.viewSiteBtn}>
              Lihat Website
            </Link>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}
