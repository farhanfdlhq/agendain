"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, Map, MessageSquare, Settings, LogOut, Loader2 } from "lucide-react"
import styles from "./layout.module.css"
import { useState, useEffect } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Handle unauthenticated state manually just in case middleware is bypassed
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [status, router, pathname])

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

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Manajemen Paket", href: "/admin/paket", icon: <Package size={20} /> },
    { name: "Manajemen Destinasi", href: "/admin/destinasi", icon: <Map size={20} /> },
    { name: "Inquiries", href: "/admin/inquiries", icon: <MessageSquare size={20} /> },
    { name: "Pengaturan", href: "/admin/settings", icon: <Settings size={20} /> },
  ]

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className={styles.adminContainer}>
      <div className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.overlayOpen : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>Agendain</h2>
          <button onClick={toggleSidebar} className={styles.menuBtnSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
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
              <p className={styles.userRole}>Administrator</p>
            </div>
          </div>
          <button onClick={() => signOut()} className={styles.logoutBtn}>
            <LogOut size={18} />
            Keluar
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
