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
