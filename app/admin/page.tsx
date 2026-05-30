"use client"

import { useSession } from "next-auth/react"
import { Package, Users, MessageSquare, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import styles from "./page.module.css"

export default function AdminDashboard() {
  const { data: session } = useSession()

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h2>Halo, {session?.user?.name}! 👋</h2>
        <p>Berikut adalah ringkasan aktivitas travel Anda hari ini.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Package size={24} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Paket</h3>
            <p className={styles.statValue}>12</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Users size={24} className={styles.statIcon} style={{color: '#3b82f6'}} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Booking</h3>
            <p className={styles.statValue}>48</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <MessageSquare size={24} className={styles.statIcon} style={{color: '#f59e0b'}} />
          </div>
          <div className={styles.statInfo}>
            <h3>Inquiries Baru</h3>
            <p className={styles.statValue}>5</p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Aksi Cepat</h3>
          </div>
          <div className={styles.actionGrid}>
            <Link href="/admin/paket/baru" className={styles.actionBtn}>
              <Plus size={20} />
              Tambah Paket Baru
            </Link>
            <Link href="/admin/destinasi/baru" className={styles.actionBtn}>
              <Plus size={20} />
              Tambah Destinasi
            </Link>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Booking Terbaru</h3>
            <Link href="/admin/booking" className={styles.panelLink}>Lihat Semua</Link>
          </div>
          <div className={styles.emptyState}>
            <p>Belum ada data booking untuk ditampilkan.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
