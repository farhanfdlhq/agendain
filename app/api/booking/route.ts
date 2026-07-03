import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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
        paket: { 
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
  try {
    const data = await req.json()
    const paket = await prisma.paket.findUnique({ where: { id: data.paketId } })
    if (!paket) return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 })

    const total = Number(paket.harga) * Number(data.jumlahPax)

    const booking = await prisma.booking.create({
      data: {
        nama: data.nama,
        email: data.email,
        noWa: data.noWa,
        paketId: data.paketId,
        tanggal: new Date(data.tanggal),
        jumlahPax: Number(data.jumlahPax),
        catatan: data.catatan,
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
