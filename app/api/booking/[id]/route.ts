import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { BookingStatusSchema } from '@/lib/security'
import { BookingError, remainingTripSeats } from '@/lib/booking'
import { revalidateOpenTrips } from '@/lib/revalidate-open-trips'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requirePermission(request, 'PATCH /api/booking/[id]', 'booking_edit')
    if (gate.denied) return gate.denied

    const { id } = await params
    const result = BookingStatusSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }
    const data = result.data
    const bookingId = Number(id)

    if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: number }>>
        `SELECT t.id FROM OpenTrip t JOIN Booking b ON b.openTripId = t.id
         WHERE b.id = ${bookingId} FOR UPDATE`
      if (!locked.length) throw new BookingError('Booking tidak ditemukan', 404)
      const booking = await tx.booking.findUnique({
        where: { id: bookingId }, include: { openTrip: true },
      })
      if (!booking) throw new BookingError('Booking tidak ditemukan', 404)
      if (data.status === 'paid' && booking.status !== 'paid') {
        const paid = await tx.booking.aggregate({
          where: { openTripId: booking.openTripId, status: 'paid', id: { not: bookingId } },
          _sum: { jumlahPax: true },
        })
        const remaining = remainingTripSeats(booking.openTrip, paid._sum.jumlahPax ?? 0)
        if (remaining !== null && booking.jumlahPax > remaining) {
          throw new BookingError('Kuota tidak cukup untuk mengonfirmasi pembayaran booking ini.')
        }
      }
      return tx.booking.update({ where: { id: bookingId }, data: { status: data.status } })
    })

    revalidateOpenTrips()
    return NextResponse.json(updatedBooking)
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error(error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requirePermission(request, 'DELETE /api/booking/[id]', 'booking_delete')
    if (gate.denied) return gate.denied

    const { id } = await params
    const bookingId = parseInt(id)

    if (isNaN(bookingId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    })

    revalidateOpenTrips()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
