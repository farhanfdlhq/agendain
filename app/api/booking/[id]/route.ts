import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { BookingStatusSchema, getClientIp } from '@/lib/security'
import { BookingError, remainingTripSeats } from '@/lib/booking'
import { revalidateOpenTrips } from '@/lib/revalidate-open-trips'
import { logAudit } from '@/lib/audit'

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

    let previousStatus = ''
    let bookingCustomer = ''
    let tripTitle = ''

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: number }>>
        `SELECT t.id FROM OpenTrip t JOIN Booking b ON b.openTripId = t.id
         WHERE b.id = ${bookingId} FOR UPDATE`
      if (!locked.length) throw new BookingError('Booking tidak ditemukan', 404)
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { openTrip: true },
      })
      if (!booking) throw new BookingError('Booking tidak ditemukan', 404)

      previousStatus = booking.status
      bookingCustomer = booking.nama
      tripTitle = booking.openTrip?.nama ?? `Trip #${booking.openTripId}`

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

    if (previousStatus !== updatedBooking.status) {
      await logAudit({
        action: 'booking.status_change',
        actorId: gate.actor.userId,
        actorEmail: gate.actor.email,
        targetType: 'Booking',
        targetId: bookingId,
        detail: {
          pelanggan: bookingCustomer,
          paket: tripTitle,
          dari: previousStatus,
          ke: updatedBooking.status,
        },
        ip: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
      })
    }

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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { openTrip: { select: { nama: true } } },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    })

    await logAudit({
      action: 'booking.delete',
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: 'Booking',
      targetId: bookingId,
      detail: {
        pelanggan: booking.nama,
        paket: booking.openTrip?.nama,
        total: booking.total,
        status: booking.status,
      },
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    })

    revalidateOpenTrips()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
