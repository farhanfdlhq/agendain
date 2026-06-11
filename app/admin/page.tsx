import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Package, Users, MessageSquare, Plus, ArrowRight, Activity, Map, CalendarClock, CreditCard, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  const totalOmset = paidBookings.reduce((sum: number, b: any) => sum + Number(b.total), 0)
  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

  // Combine and sort recent activities
  const recentActivity = [
    ...recentInquiries.map((i: any) => ({ ...i, type: 'inquiry' })),
    ...recentPrivateTrips.map((p: any) => ({ ...p, type: 'privatetrip' })),
    ...recentBookings.map((b: any) => ({ ...b, type: 'booking' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 6)

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pt-2">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Halo, {session?.user?.name || "Admin"}! 👋</h2>
        <p className="text-muted-foreground text-lg">Berikut adalah ringkasan performa dan aktivitas travel Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/admin/booking">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pesanan Menunggu</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight">{bookingPendingCount}</div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/admin/booking">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Omset Bersih</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight truncate">{formatCurrency(totalOmset)}</div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/admin/paket">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Paket</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight">{paketCount}</div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/admin/inquiries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Inquiries Baru</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-rose-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight">{inquiryCount}</div>
            </CardContent>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Pintasan untuk mengelola data</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start h-14 text-base" asChild>
              <Link href="/admin/booking">
                <ShoppingCart className="mr-3 h-5 w-5 text-primary" />
                Kelola Semua Pesanan
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-14 text-base" asChild>
              <Link href="/admin/paket/baru">
                <Plus className="mr-3 h-5 w-5 text-primary" />
                Tambah Paket Wisata
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-14 text-base" asChild>
              <Link href="/admin/destinasi/baru">
                <Plus className="mr-3 h-5 w-5 text-primary" />
                Tambah Destinasi
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Pesan, pesanan, dan inquiry yang masuk akhir-akhir ini</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/admin/inquiries">
                Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((b: any) => (
                  <div key={`${b.type}-${b.id}`} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center shrink-0">
                      {b.type === 'inquiry' && <MessageSquare className="h-5 w-5 text-primary" />}
                      {b.type === 'privatetrip' && <Map className="h-5 w-5 text-primary" />}
                      {b.type === 'booking' && <ShoppingCart className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight text-foreground">
                        <span className="font-semibold">{b.nama}</span>
                        {b.type === 'inquiry' && (b.paket ? <span> bertanya tentang paket <em className="text-muted-foreground not-italic font-medium">{b.paket.nama}</em></span> : ' mengirim pesan baru')}
                        {b.type === 'privatetrip' && <span> mengajukan Private Trip ke <em className="text-muted-foreground not-italic font-medium">{b.destinasi}</em></span>}
                        {b.type === 'booking' && <span> membooking paket <em className="text-muted-foreground not-italic font-medium">{b.paket?.nama || "Terhapus"}</em> ({b.jumlahPax} pax)</span>}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg border-border/50 bg-muted/10">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Belum ada aktivitas</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">Data aktivitas terbaru akan muncul di sini setelah ada pelanggan yang berinteraksi.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
