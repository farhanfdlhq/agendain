import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeSettingsPayload, serverError } from '@/lib/security'
import { requirePermission } from '@/lib/rbac'

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, 'POST /api/settings/home', 'cms_manage')
    if (gate.denied) return gate.denied

    const parsed = sanitizeSettingsPayload(await req.json())
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const jsonValue = parsed.serialized

    await prisma.setting.upsert({
      where: { key: 'home_settings' },
      update: { value: jsonValue },
      create: { key: 'home_settings', value: jsonValue },
    })

    return NextResponse.json({ success: true, message: 'Konten beranda berhasil diperbarui' })
  } catch (error: any) {
    return serverError('settings/home', error)
  }
}

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'home_settings' }
    })
    
    if (!setting) {
      return NextResponse.json({
        heroTitle: 'Jelajahi Eropa Tanpa Beban',
        heroTitle_en: 'Explore Europe Burden-Free',
        heroTitleColor: '',
        heroSubtitle: 'Rencanakan perjalanan impian Anda bersama ahlinya. Transparan, terpercaya, dan berkesan.',
        heroSubtitle_en: 'Plan your dream journey with the experts. Transparent, trusted, and memorable.',
        heroSubtitleColor: '',
        featuresTitle: 'Kenapa Memilih Agendain?',
        featuresTitle_en: 'Why Choose Agendain?',
        featuresTitleColor: '',
        ctaTitle: 'Siap Memulai Perjalanan Anda?',
        ctaTitle_en: 'Ready to Start Your Journey?',
        ctaTitleColor: '',
        ctaText: 'Diskusikan rencana liburan impian Anda bersama tim kami secara gratis.',
        ctaText_en: 'Discuss your dream vacation plans with our team for free.',
        ctaTextColor: '',
        ctaBtn1Text: 'Rencanakan Private Trip',
        ctaBtn1Text_en: 'Plan Private Trip',
        ctaBtn1Link: '/private-trip',
        ctaBtn1Color: '',
        ctaBtn1HoverColor: '',
        ctaBtn1TextColor: '',
        ctaBtn2Text: 'Chat WhatsApp',
        ctaBtn2Text_en: 'Chat WhatsApp',
        ctaBtn2Link: 'https://wa.me/6281234567890',
        ctaBtn2Color: '',
        ctaBtn2HoverColor: '',
        ctaBtn2TextColor: '',
        sectionOrder: 'packages,destinations,features,cta',
      })
    }
    
    return NextResponse.json(JSON.parse(setting.value))
  } catch (error: any) {
    return serverError('settings/home', error)
  }
}
