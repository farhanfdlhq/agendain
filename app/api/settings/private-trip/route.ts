import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeSettingsPayload, serverError } from '@/lib/security'
import { requirePermission } from '@/lib/rbac'

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/private-trip', 'cms_manage')
    if (gate.denied) return gate.denied

    const data = await req.json()
    const { packages, ...settingsData } = data ?? {};

    const parsed = sanitizeSettingsPayload(settingsData)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const jsonValue = parsed.serialized

    await prisma.setting.upsert({
      where: { key: 'privatetrip_settings' },
      update: { value: jsonValue },
      create: { key: 'privatetrip_settings', value: jsonValue },
    })

    if (packages && Array.isArray(packages)) {
      await prisma.privateTripPackage.deleteMany();
      for (const pkg of packages) {
         await prisma.privateTripPackage.create({
            data: {
               title: pkg.title || '',
               subtitle: pkg.subtitle || '',
               image: pkg.image || '',
               locationTab: pkg.locationTab || '',
               chips: pkg.chips || [],
               features: pkg.features || []
            }
         });
      }
    }

    // Tanpa ini, getSettings() di app/layout.tsx (unstable_cache tag 'settings',
    // TTL 1 jam) menyajikan konten lama sampai sejam. revalidatePath layout
    // menyegarkan halaman publik yang memakai setting ini.
    revalidateTag('settings', { expire: 0 })
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, message: 'Pengaturan Private Trip berhasil diperbarui' })
  } catch (error: any) {
    return serverError('settings/private-trip', error)
  }
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'privatetrip_settings' }
    })
    const packages = await prisma.privateTripPackage.findMany({ orderBy: { id: 'asc' } });
    
    let result = setting ? JSON.parse(setting.value) : {};
    result.packages = packages;
    return NextResponse.json(result);
  } catch (error: any) {
    return serverError('settings/private-trip', error)
  }
}
