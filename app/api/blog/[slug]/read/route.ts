import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { checkCSRF, getClientIp, rateLimit, serverError } from '@/lib/security'
import { READ_DEDUPE_MS, isBotUserAgent } from '@/lib/blog-reads'

// Catat satu "baca" artikel. Publik (tanpa login) tapi berlapis: same-origin
// saja, bot & admin login diabaikan. Dedupe utama = localStorage di klien (1x
// per browser per 24 jam). Batas per IP hanya rem penyalahgunaan — sengaja
// longgar karena banyak pembaca seluler berbagi satu IP (CGNAT). Tak menyimpan
// data pribadi. Selalu balas 204 agar tak bisa dipakai menebak slug draft.
export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const noContent = new NextResponse(null, { status: 204 })
  try {
    if (!checkCSRF(request)) return noContent
    if (isBotUserAgent(request.headers.get('user-agent'))) return noContent

    // Admin yang sedang login (mis. mengecek artikelnya) tidak dihitung.
    if (await getServerSession(authOptions)) return noContent

    const { slug } = await context.params
    const ip = getClientIp(request) || 'unknown'
    if (!rateLimit(`read-ip:${ip}`, 60, 60 * 60 * 1000).success) return noContent
    if (!rateLimit(`read:${ip}:${slug}`, 20, READ_DEDUPE_MS).success) return noContent

    // SQL berparameter, bukan prisma.update: `updatedAt` (@updatedAt) akan ikut
    // berubah tiap kali dibaca → tanggal "Diperbarui" & lastmod sitemap palsu.
    // Slug tak dikenal / draft = 0 baris, tanpa error.
    await prisma.$executeRaw`UPDATE BlogPost SET readCount = readCount + 1 WHERE slug = ${slug} AND status = 'published'`
    return noContent
  } catch (error) {
    serverError('POST /api/blog/[slug]/read', error)
    return noContent
  }
}
