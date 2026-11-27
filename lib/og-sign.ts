import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Tanda tangan parameter endpoint /og.
 *
 * Tanpa ini siapa pun bisa membuat gambar berlogo Agendain dengan teks bebas
 * (`/og?src=...&title=PROMO PALSU`) dan memaksa server merender ulang untuk
 * setiap variasi teks. Halaman situs membuat URL lewat lib/og.ts yang menandatangani
 * src+title+subtitle; endpoint hanya merender bila tanda tangannya cocok.
 */
function secret(): string {
  return process.env.NEXTAUTH_SECRET || "agendain-og-dev";
}

function payload(src: string, title: string, subtitle: string): string {
  return [src, title, subtitle].join("\n");
}

export function signOg(src: string, title = "", subtitle = ""): string {
  return createHmac("sha256", secret())
    .update(payload(src, title, subtitle))
    .digest("base64url")
    .slice(0, 22);
}

export function verifyOg(sig: string | null, src: string, title = "", subtitle = ""): boolean {
  if (!sig) return false;
  const expected = Buffer.from(signOg(src, title, subtitle));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
