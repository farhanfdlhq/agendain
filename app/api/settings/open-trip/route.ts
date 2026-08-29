import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeSettingsPayload, serverError } from '@/lib/security'
import { requirePermission } from '@/lib/rbac'

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/open-trip', 'cms_manage')
    if (gate.denied) return gate.denied

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

    // Tanpa ini, getSettings() di app/layout.tsx (unstable_cache tag 'settings',
    // TTL 1 jam) menyajikan konten lama sampai sejam. revalidatePath layout
    // menyegarkan halaman publik yang memakai setting ini.
    revalidateTag('settings', { expire: 0 })
    revalidatePath('/', 'layout')

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
