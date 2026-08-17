import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAllowedRole, sanitizeSettingsPayload, serverError } from '@/lib/security'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !isAllowedRole(role, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsed = sanitizeSettingsPayload(await req.json())
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const jsonValue = parsed.serialized

    await prisma.setting.upsert({
      where: { key: 'opentrip_settings' },
      update: { value: jsonValue },
      create: { key: 'opentrip_settings', value: jsonValue },
    })

    return NextResponse.json({ success: true, message: 'Pengaturan Open Trip berhasil diperbarui' })
  } catch (error: any) {
    return serverError('settings/open-trip', error)
  }
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'opentrip_settings' }
    })
    
    if (!setting) {
      return NextResponse.json({})
    }
    
    return NextResponse.json(JSON.parse(setting.value))
  } catch (error: any) {
    return serverError('settings/open-trip', error)
  }
}
