import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Package, Users, MessageSquare, Plus, ArrowRight, Activity, Map, CalendarClock, CreditCard, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/reui/badge"

import { Suspense } from 'react'
import AirplaneLoader from '@/components/ui/airplane-loader'

async function AdminDashboardDataFetcher({ session }: { session: any }) {
  const [openTripCount, destinasiCount, privateTripNewCount, recentPrivateTrips, bookingPendingCount, paidBookings, recentBookings] = await Promise.all([
    prisma.openTrip.count(),
    prisma.destinasi.count(),
    // "Baru" = belum ditindaklanjuti. Nilai legacy "replied" tidak ikut
    // terhitung karena sudah berarti dihubungi.
    prisma.privateTrip.count({ where: { status: 'new' } }),
    prisma.privateTrip.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.booking.count({ where: { status: 'pending' } }),
    prisma.booking.aggregate({ where: { status: 'paid' }, _sum: { total: true } }),
    prisma.booking.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { openTrip: true }
    })
  ])

  const totalOmset = Number(paidBookings._sum?.total || 0)
  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

  // Combine and sort recent activities
  const recentActivity = [
    ...recentPrivateTrips.map((p: any) => ({ ...p, type: 'privatetrip' })),
    ...recentBookings.map((b: any) => ({ ...b, type: 'booking' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 5)

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Halo, {session?.user?.name?.split(' ')[0] || "Admin"}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base font-medium">Berikut adalah ringkasan performa dan aktivitas travel Anda hari ini.</p>
      </div>

      {/* Stats Bento Grid - Flat Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="relative overflow-hidden group hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 border-border bg-background rounded-xl shadow-none">
          <Link href="/admin/booking" className="absolute inset-0 z-10" />
          <CardHeader className="relative z-20 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Pesanan Menunggu
            </CardTitle>
            <CalendarClock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-4xl font-black tracking-tight text-foreground">{bookingPendingCount}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 border-border bg-background rounded-xl shadow-none">
          <Link href="/admin/booking" className="absolute inset-0 z-10" />
          <CardHeader className="relative z-20 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total Omset Bersih
            </CardTitle>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-3xl font-black tracking-tight text-foreground truncate">
              {formatCurrency(totalOmset)}
            </div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Pemasukan Sukses
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 border-border bg-background rounded-xl shadow-none">
          <Link href="/admin/open-trip" className="absolute inset-0 z-10" />
          <CardHeader className="relative z-20 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total Paket
            </CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-4xl font-black tracking-tight text-foreground">{openTripCount}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 border-border bg-background rounded-xl shadow-none">
          <Link href="/admin/inquiries" className="absolute inset-0 z-10" />
          <CardHeader className="relative z-20 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Permintaan Trip Baru
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-4xl font-black tracking-tight text-foreground">{privateTripNewCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-xl border-border shadow-none overflow-hidden bg-background">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            <CardDescription>Pintasan untuk mengelola data</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start h-12 text-sm font-medium rounded-lg border-border hover:bg-muted/50 hover:text-foreground transition-colors group shadow-none" asChild>
              <Link href="/admin/booking">
                <ShoppingCart className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Kelola Semua Pesanan
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-12 text-sm font-medium rounded-lg border-border hover:bg-muted/50 hover:text-foreground transition-colors group shadow-none" asChild>
              <Link href="/admin/open-trip/baru">
                <Plus className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Tambah Paket Wisata
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-12 text-sm font-medium rounded-lg border-border hover:bg-muted/50 hover:text-foreground transition-colors group shadow-none" asChild>
              <Link href="/admin/destinasi/baru">
                <Map className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Tambah Destinasi
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-xl border-border shadow-none overflow-hidden bg-background">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border bg-background">
            <div>
              <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
              <CardDescription className="mt-1">Permintaan Private Trip dan pesanan yang masuk akhir-akhir ini</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground hover:text-foreground font-medium shadow-none">
              <Link href="/admin/inquiries">
                Lihat Semua <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length > 0 ? (
              <div className="flex flex-col">
                {recentActivity.map((b: any, i: number) => (
                  <div key={`${b.type}-${b.id}`} className={`flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors ${i !== recentActivity.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-muted/50 text-muted-foreground`}>
                      {b.type === 'privatetrip' && <Map className="h-4 w-4" />}
                      {b.type === 'booking' && <ShoppingCart className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium leading-relaxed text-foreground">
                        <span className="font-semibold">{b.nama}</span>
                        {b.type === 'privatetrip' && <span className="text-muted-foreground"> mengajukan Private Trip ke <span className="font-medium text-foreground">{b.destinasi}</span></span>}
                        {b.type === 'booking' && <span className="text-muted-foreground"> membooking <span className="font-medium text-foreground">{b.openTrip?.nama || "Terhapus"}</span> <Badge variant="outline" className="ml-1 font-medium bg-muted/30 shadow-none border-border">{b.jumlahPax} pax</Badge></span>}
                      </p>
                      <div className="text-[11px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                        {new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Belum ada aktivitas</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">Data aktivitas terbaru akan muncul di sini setelah ada pelanggan yang berinteraksi di website.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  return (
    <Suspense fallback={
      <div className="flex flex-col h-[50vh] w-full items-center justify-center gap-4">
        <AirplaneLoader size={48} />
        <p className="text-sm text-muted-foreground animate-pulse">Memuat ringkasan performa...</p>
      </div>
    }>
      <AdminDashboardDataFetcher session={session} />
    </Suspense>
  )
}
