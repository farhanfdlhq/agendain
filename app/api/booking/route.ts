import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { rateLimit, checkCSRF, getClientIp } from '@/lib/security'
import { BookingSchema, BookingError, ensureBookingAvailable } from '@/lib/booking'

export async function GET() {
  try {
    const gate = await requirePermission(undefined, 'GET /api/booking', 'booking_view')
    if (gate.denied) return gate.denied

    const bookings = await prisma.booking.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { 
        openTrip: { 
          select: { nama: true } 
        } 
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Failed to fetch bookings", error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // 1. CSRF Protection
  if (!checkCSRF(req)) {
    return NextResponse.json({ error: 'CSRF Token Invalid' }, { status: 403 })
  }

  // 2. Rate Limiting (Max 5 requests per minute per IP)
  const ip = getClientIp(req)
  const rateLimitResult = rateLimit(ip, 5, 60000)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too Many Requests. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    
    const result = BookingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    
    const data = result.data
    const booking = await prisma.$transaction(async (tx) => {
      // Kunci yang sama dipakai saat konfirmasi Lunas dan saat admin mengubah
      // paket. Jangan memeriksa kuota dari snapshot di luar transaksi.
      const locked = await tx.$queryRaw<Array<{ id: number }>>
        `SELECT id FROM OpenTrip WHERE id = ${data.openTripId} FOR UPDATE`
      if (!locked.length) throw new BookingError('Paket tidak ditemukan', 404)
      const openTrip = await tx.openTrip.findUnique({ where: { id: data.openTripId } })
      if (!openTrip) throw new BookingError('Paket tidak ditemukan', 404)
      const paid = await tx.booking.aggregate({
        where: { openTripId: openTrip.id, status: 'paid' },
        _sum: { jumlahPax: true },
      })
      ensureBookingAvailable(openTrip, data.tanggal, data.jumlahPax, paid._sum.jumlahPax ?? 0)
      return tx.booking.create({
        data: {
          ...data,
          tanggal: openTrip.tanggalKeberangkatan ?? data.tanggal,
          catatan: data.catatan || null,
          total: Number(openTrip.harga) * data.jumlahPax,
          status: 'pending',
        },
      })
    })
    
    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 })
    }
    console.error("Booking error:", error)
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 })
  }
}
