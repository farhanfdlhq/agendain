import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAllowedRole, serverError } from '@/lib/security'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session || !isAllowedRole(role, ['super_admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
      headingFont: data.headingFont || 'Montserrat',
      bodyFont: data.bodyFont || 'Montserrat',
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

    // Validate Font Name (XSS Prevention)
    const fontRegex = /^[a-zA-Z0-9\s]+$/
    if (!fontRegex.test(theme.headingFont) || !fontRegex.test(theme.bodyFont)) {
      return NextResponse.json({ error: 'Nama font tidak valid' }, { status: 400 })
    }

    // Upsert to Setting table
    const jsonValue = JSON.stringify(theme)
    await prisma.setting.upsert({
      where: { key: 'theme_settings' },
      update: { value: jsonValue },
      create: { key: 'theme_settings', value: jsonValue },
    })

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
        headingFont: 'Montserrat',
        bodyFont: 'Montserrat',
        borderRadius: '0.5rem',
      })
    }
    return NextResponse.json(JSON.parse(setting.value))
  } catch (error: any) {
    return serverError('settings/theme', error)
  }
}
