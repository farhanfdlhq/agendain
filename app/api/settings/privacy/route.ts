import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeSettingsPayload, serverError } from '@/lib/security'
import { requirePermission } from '@/lib/rbac'
import { keepPolicyDate, policyContentChanged, stampPolicyDate } from '@/lib/policy-updated'

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/privacy', 'cms_manage')
    if (gate.denied) return gate.denied

    const parsed = sanitizeSettingsPayload(await req.json())
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    // Baris "Terakhir Diperbarui" diisi otomatis: bila isi dokumen (ID/EN)
    // berbeda dari yang tersimpan, bulan-tahunnya ditulis ulang ke bulan ini.
    // Simpan ulang tanpa mengubah isi (atau hanya mengganti hero) tidak
    // menggeser tanggal. Lihat lib/policy-updated.ts.
    const next = parsed.data as Record<string, unknown>
    let stored: Record<string, unknown> | null = null
    try {
      const row = await prisma.setting.findUnique({ where: { key: 'privacy_settings' } })
      if (row) stored = JSON.parse(row.value)
    } catch {}
    if (policyContentChanged(stored, next)) {
      const now = new Date()
      next.privacyContent = stampPolicyDate(next.privacyContent as string, now, 'id')
      next.privacyContent_en = stampPolicyDate(next.privacyContent_en as string, now, 'en')
    } else if (stored) {
      next.privacyContent = keepPolicyDate(next.privacyContent as string, stored.privacyContent as string)
      next.privacyContent_en = keepPolicyDate(next.privacyContent_en as string, stored.privacyContent_en as string)
    }
    const jsonValue = JSON.stringify(next)

    await prisma.setting.upsert({
      where: { key: 'privacy_settings' },
      update: { value: jsonValue },
      create: { key: 'privacy_settings', value: jsonValue },
    })

    // Tanpa ini, getSettings() di app/layout.tsx (unstable_cache tag 'settings',
    // TTL 1 jam) menyajikan konten lama sampai sejam. revalidatePath layout
    // menyegarkan halaman publik yang memakai setting ini.
    revalidateTag('settings', { expire: 0 })
    revalidatePath('/', 'layout')

    // Isi dikembalikan supaya editor CMS langsung menampilkan tanggal baru.
    return NextResponse.json({
      success: true,
      message: 'Kebijakan Privasi berhasil diperbarui',
      privacyContent: next.privacyContent ?? '',
      privacyContent_en: next.privacyContent_en ?? '',
    })
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
