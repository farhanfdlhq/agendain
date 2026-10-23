import { describe, expect, it } from "vitest";
import { BookingSchema, ensureBookingAvailable } from "./booking";
import { BookingStatusSchema } from "./security";

const now = new Date("2026-10-23T12:00:00Z");
const trip = { status: "published", tanggalKeberangkatan: new Date("2026-11-01"), kuota: 10, kursiTerisi: 2 };
const payload = { nama: "Traveler", email: "t@example.invalid", noWa: "081234567890", openTripId: 1, tanggal: "2026-11-01", jumlahPax: 2 };

describe("tanggal dan kapasitas booking", () => {
  it.each(["not-a-date", "2026-02-30", "2026-13-01"])("menolak tanggal tidak sah: %s", tanggal => {
    expect(BookingSchema.safeParse({ ...payload, tanggal }).success).toBe(false);
  });
  it("menerima tanggal formulir dan ISO; menolak id pecahan", () => {
    expect(BookingSchema.parse(payload).tanggal).toEqual(new Date("2026-11-01"));
    expect(BookingSchema.safeParse({ ...payload, tanggal: "2026-11-01T00:00:00Z" }).success).toBe(true);
    expect(BookingSchema.safeParse({ ...payload, openTripId: 1.5 }).success).toBe(false);
  });
  it("legacy publish, kuota kosong, dan keberangkatan hari ini tetap didukung", () => {
    expect(() => ensureBookingAvailable({ ...trip, status: "publish", kuota: null }, trip.tanggalKeberangkatan, 100, 20, now)).not.toThrow();
    expect(() => ensureBookingAvailable({ ...trip, tanggalKeberangkatan: null }, now, 1, 0, now)).not.toThrow();
  });
  it("menghitung kursi manual dan Lunas bersama", () => {
    expect(() => ensureBookingAvailable(trip, trip.tanggalKeberangkatan, 2, 6, now)).not.toThrow();
    expect(() => ensureBookingAvailable(trip, trip.tanggalKeberangkatan, 3, 6, now)).toThrow("Sisa kursi");
  });
  it("status Lunas dari admin dan status lama sama-sama valid", () => {
    for (const status of ["pending", "paid", "cancelled", "confirmed", "completed"]) {
      expect(BookingStatusSchema.safeParse({ status }).success).toBe(true);
    }
    expect(BookingStatusSchema.safeParse({ status: "arbitrary" }).success).toBe(false);
  });
});
