import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { z } from "zod";
import { rateLimit, checkCSRF, getClientIp } from "@/lib/security";

const PrivateTripSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi").max(100),
  email: z.string().email("Email tidak valid"),
  noWa: z
    .string()
    .min(8, "Nomor WA terlalu pendek")
    .max(20, "Nomor WA terlalu panjang"),
  destinasi: z.string().min(2, "Destinasi harus diisi"),
  tanggal: z.string().datetime().or(z.string().min(1)),
  pax: z.coerce.number().int().positive().max(500),
  budget: z.string().min(2, "Budget harus diisi"),
  catatan: z.string().max(1000).optional().nullable(),
});

export async function POST(req: Request) {
  // 1. CSRF Protection
  if (!checkCSRF(req)) {
    return NextResponse.json({ error: "CSRF Token Invalid" }, { status: 403 });
  }

  // 2. Rate Limiting (Max 5 requests per minute per IP)
  const ip = getClientIp(req);
  const rateLimitResult = rateLimit(ip, 5, 60000);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too Many Requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const rawData = await req.json();

    // Zod validation
    const result = PrivateTripSchema.safeParse(rawData);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.format() },
        { status: 400 },
      );
    }

    const data = result.data;

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
        status: "new",
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 },
    );
  }
}
