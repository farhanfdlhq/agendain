import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { serverError } from '@/lib/security'
import { requirePermission } from '@/lib/rbac'
import { purgeCloudflareCache } from '@/lib/cloudflare'
import { FONT_CHOICES, DEFAULT_HEADING_FONT, DEFAULT_BODY_FONT } from '@/lib/fonts'

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/theme', 'settings_manage')
    if (gate.denied) return gate.denied

    const data = await req.json()
    
    // Default values if missing
    const theme = {
      colorPrimary: data.colorPrimary || '#054569',
      colorSecondary: data.colorSecondary || '#FFC704',
      colorAccent: data.colorAccent || '#056da2',
      colorSuccess: data.colorSuccess || '#22c55e',
      colorWarning: data.colorWarning || '#f59e0b',
      colorError: data.colorError || '#ef4444',
      colorInfo: data.colorInfo || '#3b82f6',
      colorBackground: data.colorBackground || '#ffffff',
      colorText: data.colorText || '#1c1c1c',
      navbarBackground: data.navbarBackground || '#054569',
      navbarText: data.navbarText || '#ffffff',
      navbarHover: data.navbarHover || '#FFC704',
      footerBackground: data.footerBackground || '#054569',
      footerText: data.footerText || '#ffffff',
      headingFont: data.headingFont || DEFAULT_HEADING_FONT,
      bodyFont: data.bodyFont || DEFAULT_BODY_FONT,
      borderRadius: data.borderRadius || '0.5rem',
    }

    // Validate Hex Colors
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const colorsToValidate = [
      theme.colorPrimary, theme.colorSecondary, theme.colorAccent,
      theme.colorSuccess, theme.colorWarning, theme.colorError,
      theme.colorInfo, theme.colorBackground, theme.colorText,
      theme.navbarBackground, theme.navbarText, theme.navbarHover,
      theme.footerBackground, theme.footerText
    ]
    
    for (const color of colorsToValidate) {
      if (!hexRegex.test(color)) {
        return NextResponse.json({ error: `Format warna tidak valid: ${color}` }, { status: 400 })
      }
    }

    // Font hanya boleh salah satu yang benar-benar dimuat app/layout.tsx.
    // Selain mencegah XSS lewat tag <style>, ini juga menolak nama font yang
    // tidak akan pernah tampil karena tidak ada loader-nya.
    if (!FONT_CHOICES.includes(theme.headingFont) || !FONT_CHOICES.includes(theme.bodyFont)) {
      return NextResponse.json(
        { error: `Font tidak dikenal. Pilihan yang tersedia: ${FONT_CHOICES.join(', ')}` },
        { status: 400 },
      )
    }

    // Upsert to Setting table
    const jsonValue = JSON.stringify(theme)
    await prisma.setting.upsert({
      where: { key: 'theme_settings' },
      update: { value: jsonValue },
      create: { key: 'theme_settings', value: jsonValue },
    })

    // WAJIB: tanpa ini, getSettings() di app/layout.tsx (unstable_cache tag
    // 'settings', TTL 1 jam) tetap menyajikan tema LAMA sampai sejam, dan
    // Cloudflare menyajikan HTML lama — sebab perubahan font/warna tak muncul.
    revalidateTag('settings', { expire: 0 })
    revalidatePath('/', 'layout')
    await purgeCloudflareCache()

    return NextResponse.json({ success: true, message: 'Tema berhasil diperbarui' })
  } catch (error: any) {
    return serverError('settings/theme', error)
  }
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'theme_settings' }
    })
    
    if (!setting) {
      // Default brand colors
      return NextResponse.json({
        colorPrimary: '#054569',
        colorSecondary: '#FFC704',
        colorAccent: '#056da2',
        colorSuccess: '#22c55e',
        colorWarning: '#f59e0b',
        colorError: '#ef4444',
        colorInfo: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1c1c1c',
        navbarBackground: '#054569',
        navbarText: '#ffffff',
        navbarHover: '#FFC704',
        footerBackground: '#054569',
        footerText: '#ffffff',
        headingFont: DEFAULT_HEADING_FONT,
        bodyFont: DEFAULT_BODY_FONT,
        borderRadius: '0.5rem',
      })
    }
    return NextResponse.json(JSON.parse(setting.value))
  } catch (error: any) {
    return serverError('settings/theme', error)
  }
}
