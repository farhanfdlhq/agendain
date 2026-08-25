import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeSettingsPayload, serverError } from '@/lib/security'
import { sanitizeRichText } from '@/lib/sanitize-richtext'
import { requirePermission } from '@/lib/rbac'

// Tagline footer dirender dengan dangerouslySetInnerHTML (agar <strong> bisa
// dipakai), jadi dibersihkan DI SINI — saat tulis, di server. Sanitasi tidak
// dilakukan di komponen Footer karena Footer ada di SEMUA halaman; menarik
// DOMPurify ke sana berarti menambah ~20KB ke bundle client global.
const RICH_TEXT_FIELDS = ['tagline', 'tagline_en'] as const

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/footer', 'cms_manage')
    if (gate.denied) return gate.denied

    const parsed = sanitizeSettingsPayload(await req.json())
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data as Record<string, unknown>
    for (const field of RICH_TEXT_FIELDS) {
      if (typeof payload[field] === 'string') {
        payload[field] = sanitizeRichText(payload[field])
      }
    }
    const jsonValue = JSON.stringify(payload)

    await prisma.setting.upsert({
      where: { key: 'footer_settings' },
      update: { value: jsonValue },
      create: { key: 'footer_settings', value: jsonValue },
    })

    // Footer dibaca lewat getSettings() di app/layout.tsx yang ber-unstable_cache
    // tag 'settings' dengan revalidate 3600. Tanpa dua baris ini, editan footer
    // baru muncul satu jam kemudian.
    revalidateTag('settings', { expire: 0 })
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, message: 'Footer berhasil diperbarui' })
  } catch (error: any) {
    return serverError('settings/footer', error)
  }
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'footer_settings' }
    })

    if (!setting) {
      return NextResponse.json({})
    }

    return NextResponse.json(JSON.parse(setting.value))
  } catch (error: any) {
    return serverError('settings/footer', error)
  }
}
