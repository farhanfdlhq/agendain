import { z } from "zod";
import { isPublishedOpenTrip } from "./open-trip-card";

export const BookingSchema = z.object({
  nama: z.string().trim().min(1, "Nama harus diisi").max(100),
  email: z.string().email("Email tidak valid").max(190),
  noWa: z.string().min(8).max(20),
  openTripId: z.coerce.number().int().positive(),
  tanggal: z.union([z.iso.date(), z.iso.datetime({ offset: true })]).transform(v => new Date(v)),
  jumlahPax: z.coerce.number().int().positive().max(100),
  catatan: z.string().max(1000).optional().nullable(),
});

type TripCapacity = { kuota: number | null; kursiTerisi: number };
type BookableTrip = TripCapacity & { status: string; tanggalKeberangkatan: Date | null };

export class BookingError extends Error {
  constructor(message: string, readonly status = 409) { super(message); }
}

// Pending adalah permintaan, belum memesan kursi. Hanya pembayaran resmi
// dan kursi offline/manual yang dihitung, sama seperti halaman detail.
export function remainingTripSeats(trip: TripCapacity, paidPax: number): number | null {
  return trip.kuota === null ? null : Math.max(0, trip.kuota - trip.kursiTerisi - paidPax);
}

export function ensureBookingAvailable(
  trip: BookableTrip, date: Date, pax: number, paidPax: number, now = new Date(),
): void {
  if (!isPublishedOpenTrip(trip.status)) throw new BookingError("Paket tidak ditemukan", 404);
  const departure = trip.tanggalKeberangkatan ?? date;
  const day = (d: Date) => d.toISOString().slice(0, 10);
  if (day(departure) < day(now)) throw new BookingError("Tanggal keberangkatan sudah lewat.");
  if (trip.tanggalKeberangkatan && day(date) !== day(departure)) {
    throw new BookingError("Tanggal harus sesuai jadwal keberangkatan paket.", 400);
  }
  const remaining = remainingTripSeats(trip, paidPax);
  if (remaining !== null && pax > remaining) {
    throw new BookingError(`Sisa kursi tinggal ${remaining}. Kurangi jumlah peserta.`);
  }
}
