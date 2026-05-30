import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Package, Users, MessageSquare, Plus, ArrowRight, Activity } from "lucide-react"
import Link from "next/link"
import styles from "./page.module.css"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const [paketCount, bookingCount, inquiryCount, recentBookings] = await Promise.all([
    prisma.paket.count(),
    prisma.booking.count(),
    prisma.inquiry.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { paket: true }
    })
  ])

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h2>Halo, {session?.user?.name || "Admin"}! 👋</h2>
        <p>Berikut adalah ringkasan performa dan aktivitas travel Anda hari ini.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Package size={28} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Paket</h3>
            <p className={styles.statValue}>{paketCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Users size={28} className={styles.statIcon} style={{color: '#3b82f6'}} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Booking</h3>
            <p className={styles.statValue}>{bookingCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <MessageSquare size={28} className={styles.statIcon} style={{color: '#f59e0b'}} />
          </div>
          <div className={styles.statInfo}>
            <h3>Inquiries Baru</h3>
            <p className={styles.statValue}>{inquiryCount}</p>
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
              <Plus size={22} color="var(--color-primary)" />
              Tambah Paket Wisata Baru
            </Link>
            <Link href="/admin/destinasi/baru" className={styles.actionBtn}>
              <Plus size={22} color="var(--color-primary)" />
              Tambah Destinasi Baru
            </Link>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Aktivitas Terbaru</h3>
            <Link href="/admin/booking" className={styles.panelLink}>
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className={styles.recentList}>
              {recentBookings.map(b => (
                <div key={b.id} className={styles.recentItem}>
                  <div className={styles.recentIcon}><Activity size={18} /></div>
                  <div className={styles.recentText}>
                    <strong>{b.nama}</strong> membooking paket <em>{b.paket?.nama}</em>
                  </div>
                  <div className={styles.recentDate}>
                    {new Date(b.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Activity size={32} color="var(--color-muted)" opacity={0.5} />
              <p>Belum ada data aktivitas untuk ditampilkan saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
