import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeSettingsPayload, serverError } from '@/lib/security'
import { requirePermission } from '@/lib/rbac'

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/privacy', 'cms_manage')
    if (gate.denied) return gate.denied

    const parsed = sanitizeSettingsPayload(await req.json())
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const jsonValue = parsed.serialized

    await prisma.setting.upsert({
      where: { key: 'privacy_settings' },
      update: { value: jsonValue },
      create: { key: 'privacy_settings', value: jsonValue },
    })

    return NextResponse.json({ success: true, message: 'Kebijakan Privasi berhasil diperbarui' })
  } catch (error: any) {
    return serverError('settings/privacy', error)
  }
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'privacy_settings' }
    })
    
    if (!setting) {
      return NextResponse.json({})
    }
    
    return NextResponse.json(JSON.parse(setting.value))
  } catch (error: any) {
    return serverError('settings/privacy', error)
  }
}
