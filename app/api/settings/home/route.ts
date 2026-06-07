import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await req.json()
    const jsonValue = JSON.stringify(data)
    
    await prisma.setting.upsert({
      where: { key: 'home_settings' },
      update: { value: jsonValue },
      create: { key: 'home_settings', value: jsonValue },
    })

    return NextResponse.json({ success: true, message: 'Konten beranda berhasil diperbarui' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
        heroTitleColor: '',
        heroSubtitle: 'Rencanakan perjalanan impian Anda bersama ahlinya. Transparan, terpercaya, dan berkesan.',
        heroSubtitleColor: '',
        featuresTitle: 'Kenapa Memilih Agendain?',
        featuresTitleColor: '',
        ctaTitle: 'Siap Memulai Perjalanan Anda?',
        ctaTitleColor: '',
        ctaText: 'Diskusikan rencana liburan impian Anda bersama tim kami secara gratis.',
        ctaTextColor: '',
      })
    }
    
    return NextResponse.json(JSON.parse(setting.value))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
