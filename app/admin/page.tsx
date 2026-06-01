import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Package, Users, MessageSquare, Plus, ArrowRight, Activity, Map, CalendarClock, CreditCard, ShoppingCart } from "lucide-react"
import Link from "next/link"
import styles from "./page.module.css"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  const [paketCount, destinasiCount, inquiryCount, recentInquiries, recentPrivateTrips, bookingPendingCount, paidBookings, recentBookings] = await Promise.all([
    prisma.paket.count(),
    prisma.destinasi.count(),
    prisma.inquiry.count({ where: { sudahDibalas: false } }),
    prisma.inquiry.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { paket: true }
    }),
    prisma.privateTrip.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.booking.count({ where: { status: 'pending' } }),
    prisma.booking.findMany({ where: { status: 'paid' }, select: { total: true } }),
    prisma.booking.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { paket: true }
    })
  ])

  const totalOmset = paidBookings.reduce((sum, b) => sum + Number(b.total), 0)
  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

  // Combine and sort recent activities
  const recentActivity = [
    ...recentInquiries.map((i: any) => ({ ...i, type: 'inquiry' })),
    ...recentPrivateTrips.map((p: any) => ({ ...p, type: 'privatetrip' })),
    ...recentBookings.map((b: any) => ({ ...b, type: 'booking' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 6)

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h2>Halo, {session?.user?.name || "Admin"}! 👋</h2>
        <p>Berikut adalah ringkasan performa dan aktivitas travel Anda hari ini.</p>
      </div>

      <div className={styles.statsGrid}>
        <Link href="/admin/booking" className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <CalendarClock size={24} className={styles.statIcon} style={{color: 'var(--color-accent-blue)'}} />
          </div>
          <div className={styles.statInfo}>
            <h3>Pesanan Menunggu</h3>
            <p className={styles.statValue}>{bookingPendingCount}</p>
          </div>
        </Link>

        <Link href="/admin/booking" className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <CreditCard size={24} className={styles.statIcon} style={{color: 'var(--color-success)'}} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Omset Bersih</h3>
            <p className={styles.statValue} style={{ fontSize: '1.5rem' }}>{formatCurrency(totalOmset)}</p>
          </div>
        </Link>

        <Link href="/admin/paket" className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Package size={24} className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Paket</h3>
            <p className={styles.statValue}>{paketCount}</p>
          </div>
        </Link>

        <Link href="/admin/inquiries" className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <MessageSquare size={24} className={styles.statIcon} style={{color: 'var(--color-accent-rose)'}} />
          </div>
          <div className={styles.statInfo}>
            <h3>Inquiries Baru</h3>
            <p className={styles.statValue}>{inquiryCount}</p>
          </div>
        </Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Aksi Cepat</h3>
          </div>
          <div className={styles.actionGrid}>
            <Link href="/admin/booking" className={styles.actionBtn}>
              <ShoppingCart size={22} color="var(--color-primary)" />
              Kelola Semua Pesanan
            </Link>
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
            <Link href="/admin/inquiries" className={styles.panelLink}>
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>
          {recentActivity.length > 0 ? (
            <div className={styles.recentList}>
              {recentActivity.map((b: any) => (
                <div key={`${b.type}-${b.id}`} className={styles.recentItem}>
                  <div className={styles.recentIcon}>
                    {b.type === 'inquiry' && <MessageSquare size={18} />}
                    {b.type === 'privatetrip' && <Map size={18} />}
                    {b.type === 'booking' && <ShoppingCart size={18} />}
                  </div>
                  <div className={styles.recentText}>
                    <strong>{b.nama}</strong> 
                    {b.type === 'inquiry' && (b.paket ? <span> bertanya tentang paket <em>{b.paket.nama}</em></span> : ' mengirim pesan baru')}
                    {b.type === 'privatetrip' && <span> mengajukan Private Trip ke <em>{b.destinasi}</em></span>}
                    {b.type === 'booking' && <span> membooking paket <em>{b.paket?.nama || "Terhapus"}</em> ({b.jumlahPax} pax)</span>}
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
