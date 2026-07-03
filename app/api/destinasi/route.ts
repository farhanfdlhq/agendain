import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const destinations = await prisma.destinasi.findMany({
      take: 100,
      orderBy: { nama: 'asc' },
      include: { _count: { select: { pakets: true } } }
    })
    return NextResponse.json(destinations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    if (!data.slug && data.nama) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const newDest = await prisma.destinasi.create({
      data: {
        nama: data.nama,
        slug: data.slug,
        negara: data.negara,
        deskripsi: data.deskripsi,
        foto: data.foto,
        bahasa: data.bahasa,
        matauang: data.matauang,
        waktuTerbaik: data.waktuTerbaik,
        infoVisa: data.infoVisa,
      }
    })

    return NextResponse.json(newDest, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 })
  }
}
