import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { rateLimit, checkCSRF } from '@/lib/security'

const BookingSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi").max(100),
  email: z.string().email("Email tidak valid"),
  noWa: z.string().min(8, "Nomor WA terlalu pendek").max(20, "Nomor WA terlalu panjang"),
  openTripId: z.coerce.number().positive(),
  tanggal: z.string().datetime().or(z.string().min(1)),
  jumlahPax: z.coerce.number().int().positive().max(100),
  catatan: z.string().max(1000).optional().nullable(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
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
    const openTrip = await prisma.openTrip.findUnique({ where: { id: data.openTripId } })
    if (!openTrip) return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 })

    const total = Number(openTrip.harga) * Number(data.jumlahPax)

    const booking = await prisma.booking.create({
      data: {
        nama: data.nama,
        email: data.email,
        noWa: data.noWa,
        openTripId: data.openTripId,
        tanggal: new Date(data.tanggal),
        jumlahPax: Number(data.jumlahPax),
        catatan: data.catatan || null,
        total: total,
        status: 'pending'
      }
    })
    
    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 })
  }
}

