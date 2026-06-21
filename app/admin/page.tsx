import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Package, Users, MessageSquare, Plus, ArrowRight, Activity, Map, CalendarClock, CreditCard, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/reui/badge"

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
      take: 4,
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
   .slice(0, 5)

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Halo, {session?.user?.name?.split(' ')[0] || "Admin"}! 👋
        </h2>
        <p className="text-muted-foreground text-sm md:text-base font-medium">Berikut adalah ringkasan performa dan aktivitas travel Anda hari ini.</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border-border/50 bg-gradient-to-b from-background to-background/50 backdrop-blur-xl rounded-2xl">
          <Link href="/admin/booking" className="absolute inset-0 z-10" />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 transform translate-x-4 -translate-y-4">
            <CalendarClock className="w-24 h-24 text-blue-500" />
          </div>
          <CardHeader className="relative z-20 pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Pesanan Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-foreground">{bookingPendingCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border-border/50 bg-gradient-to-b from-background to-background/50 backdrop-blur-xl rounded-2xl">
          <Link href="/admin/booking" className="absolute inset-0 z-10" />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 transform translate-x-4 -translate-y-4">
            <CreditCard className="w-24 h-24 text-emerald-500" />
          </div>
          <CardHeader className="relative z-20 pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Total Omset Bersih
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-3xl font-black tracking-tight truncate text-foreground flex items-center gap-2">
              {formatCurrency(totalOmset)}
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> Pemasukan Sukses
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border-border/50 bg-gradient-to-b from-background to-background/50 backdrop-blur-xl rounded-2xl">
          <Link href="/admin/paket" className="absolute inset-0 z-10" />
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-110 transform translate-x-4 -translate-y-4">
            <Package className="w-24 h-24 text-primary" />
          </div>
          <CardHeader className="relative z-20 pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Total Paket
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-5xl font-black tracking-tighter text-foreground">{paketCount}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 border-border/50 bg-gradient-to-b from-background to-background/50 backdrop-blur-xl rounded-2xl">
          <Link href="/admin/inquiries" className="absolute inset-0 z-10" />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 transform translate-x-4 -translate-y-4">
            <MessageSquare className="w-24 h-24 text-rose-500" />
          </div>
          <CardHeader className="relative z-20 pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Inquiries Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-5xl font-black tracking-tighter text-foreground">{inquiryCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-3xl border-border/40 shadow-sm overflow-hidden bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            <CardDescription>Pintasan untuk mengelola data</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start h-14 text-sm font-semibold rounded-2xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group shadow-sm" asChild>
              <Link href="/admin/booking">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </div>
                Kelola Semua Pesanan
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-14 text-sm font-semibold rounded-2xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group shadow-sm" asChild>
              <Link href="/admin/paket/baru">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                Tambah Paket Wisata
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-14 text-sm font-semibold rounded-2xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group shadow-sm" asChild>
              <Link href="/admin/destinasi/baru">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <Map className="h-4 w-4 text-primary" />
                </div>
                Tambah Destinasi
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-3xl border-border/40 shadow-sm overflow-hidden bg-background">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 bg-muted/10">
            <div>
              <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
              <CardDescription className="mt-1">Pesan, pesanan, dan inquiry yang masuk akhir-akhir ini</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-primary hover:text-primary hover:bg-primary/10 rounded-full font-semibold">
              <Link href="/admin/inquiries">
                Lihat Semua <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length > 0 ? (
              <div className="flex flex-col">
                {recentActivity.map((b: any, i: number) => (
                  <div key={`${b.type}-${b.id}`} className={`flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors ${i !== recentActivity.length - 1 ? 'border-b border-border/40' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                      b.type === 'inquiry' ? 'bg-rose-50 border-rose-100 text-rose-500' : 
                      b.type === 'privatetrip' ? 'bg-amber-50 border-amber-100 text-amber-500' : 
                      'bg-emerald-50 border-emerald-100 text-emerald-500'
                    }`}>
                      {b.type === 'inquiry' && <MessageSquare className="h-4 w-4" />}
                      {b.type === 'privatetrip' && <Map className="h-4 w-4" />}
                      {b.type === 'booking' && <ShoppingCart className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium leading-relaxed text-foreground">
                        <span className="font-bold">{b.nama}</span>
                        {b.type === 'inquiry' && (b.paket ? <span> bertanya tentang paket <span className="font-semibold text-primary">{b.paket.nama}</span></span> : ' mengirim pesan baru')}
                        {b.type === 'privatetrip' && <span> mengajukan Private Trip ke <span className="font-semibold text-primary">{b.destinasi}</span></span>}
                        {b.type === 'booking' && <span> membooking paket <span className="font-semibold text-primary">{b.paket?.nama || "Terhapus"}</span> <Badge variant="outline" className="ml-1 font-bold bg-background">{b.jumlahPax} pax</Badge></span>}
                      </p>
                      <div className="text-xs font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        {new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/5">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Belum ada aktivitas</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">Data aktivitas terbaru akan muncul di sini setelah ada pelanggan yang berinteraksi di website.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
