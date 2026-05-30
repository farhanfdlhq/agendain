import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const newRequest = await prisma.privateTrip.create({
      data: {
        nama: data.nama,
        email: data.email,
        noWa: data.noWa,
        destinasi: data.destinasi,
        tanggal: new Date(data.tanggal),
        jumlahPax: Number(data.pax),
        budget: data.budget,
        catatan: data.catatan || null,
        status: 'new'
      }
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
