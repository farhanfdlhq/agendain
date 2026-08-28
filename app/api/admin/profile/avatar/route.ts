import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateUploadedFile, matchesFileSignature, getClientIp, csrfBlocked } from '@/lib/security'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  if (csrfBlocked(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 })
    }

    const validation = validateUploadedFile(file)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Verifikasi konten nyata cocok dengan tipe yang diklaim (anti-spoof).
    if (!matchesFileSignature(new Uint8Array(bytes.slice(0, 16)), file.type)) {
      return NextResponse.json({ error: 'Isi file tidak cocok dengan formatnya.' }, { status: 400 })
    }

    const user = await prisma.adminUser.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const fileName = `avatar-${user.id}-${Date.now()}.${validation.extension}`
    
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    await writeFile(join(uploadDir, fileName), buffer)
    
    const avatarUrl = `/uploads/avatars/${fileName}`
    
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { avatar: avatarUrl }
    })

    await logAudit({
      action: "profile.avatar_change",
      actorId: user.id,
      actorEmail: user.email,
      targetType: "AdminUser",
      targetId: user.id,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    })

    return NextResponse.json({ avatar: avatarUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Gagal mengunggah avatar' }, { status: 500 })
  }
}
