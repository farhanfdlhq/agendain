import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Simpan di global juga di production: proxy.ts dibundel terpisah dari
// halaman, tanpa ini tiap bundel membuka pool koneksi MySQL sendiri.
globalForPrisma.prisma = prisma
