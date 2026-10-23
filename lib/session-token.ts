import { createHash } from "node:crypto";
import { decode, type JWTDecodeParams } from "next-auth/jwt";
import { prisma } from "./prisma";

// Hanya sidik satu arah di JWT terenkripsi, bukan hash bcrypt yang bisa
// dipakai untuk memverifikasi tebakan password. Tidak dikirim lewat Session.
export function passwordVersion(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex");
}

/** Semua pembacaan sesi NextAuth memeriksa password terkini, tanpa cache. */
export async function decodeSessionToken(params: JWTDecodeParams) {
  const token = await decode(params);
  const id = Number(token?.id);
  if (!token || !Number.isSafeInteger(id) || id <= 0 ||
      typeof token.passwordVersion !== "string") return null;

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id },
      select: { password: true, email: true, nama: true, role: true, avatar: true },
    });
    if (!user || passwordVersion(user.password) !== token.passwordVersion) return null;
    // Perubahan email/profil tidak meninggalkan identitas lama di sesi.
    return { ...token, email: user.email, name: user.nama, role: user.role, avatar: user.avatar ?? undefined };
  } catch (error) {
    console.error("Session validation failed", error);
    return null; // DB tidak tersedia: jangan meloloskan sesi yang tak bisa diperiksa.
  }
}
