import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { BookingStatusSchema, isAllowedRole } from '@/lib/security'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !isAllowedRole(role, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const result = BookingStatusSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    const data = result.data
    const bookingId = parseInt(id)

    if (isNaN(bookingId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(data.status && { status: data.status }),
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !isAllowedRole(role, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const bookingId = parseInt(id)

    if (isNaN(bookingId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
