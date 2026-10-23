import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeSettingsPayload, serverError } from '@/lib/security'
import { requirePermission } from '@/lib/rbac'
import { z } from 'zod'

const PackagesSchema = z.array(z.object({
  title: z.string().max(191).default(''),
  subtitle: z.string().max(191).default(''),
  image: z.string().max(191).refine(
    v => v === '' || v.startsWith('/') || /^https?:\/\//i.test(v),
    'URL gambar tidak valid',
  ).default(''),
  locationTab: z.string().max(191).default(''),
  chips: z.array(z.string().max(2000)).max(200).default([]),
  features: z.array(z.string().max(2000)).max(200).default([])
    .transform(lines => lines.map(l => l.trim()).filter(Boolean)),
})).max(100).optional()

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/private-trip', 'cms_manage')
    if (gate.denied) return gate.denied

    const data = await req.json()
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 })
    }
    const { packages, ...settingsData } = data;
    const parsedPackages = PackagesSchema.safeParse(packages)
    if (!parsedPackages.success) {
      return NextResponse.json({ error: 'Data paket tidak valid.', details: parsedPackages.error.flatten() }, { status: 400 })
    }

    const parsed = sanitizeSettingsPayload(settingsData)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const jsonValue = parsed.serialized

    // Semua input sudah valid. Setting dan paket berhasil/gagal bersama.
    await prisma.$transaction(async (tx) => {
      await tx.setting.upsert({
        where: { key: 'privatetrip_settings' },
        update: { value: jsonValue },
        create: { key: 'privatetrip_settings', value: jsonValue },
      })
      if (parsedPackages.data !== undefined) {
        await tx.privateTripPackage.deleteMany()
        if (parsedPackages.data.length) {
          await tx.privateTripPackage.createMany({ data: parsedPackages.data })
        }
      }
    })

    // Tanpa ini, getSettings() di app/layout.tsx (unstable_cache tag 'settings',
    // TTL 1 jam) menyajikan konten lama sampai sejam. revalidatePath layout
    // menyegarkan halaman publik yang memakai setting ini.
    revalidateTag('settings', { expire: 0 })
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, message: 'Pengaturan Private Trip berhasil diperbarui' })
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 })
    }
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
