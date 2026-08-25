import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRolesConfig, requirePermission } from "@/lib/rbac"
import bcrypt from 'bcryptjs'
import { AdminUserUpdateSchema, getClientIp, serverError } from "@/lib/security"
import { logAudit } from "@/lib/audit"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission(req, 'PUT /api/admin/users/[id]', 'users_manage')
  if (gate.denied) return gate.denied

  try {
    const { id } = await params
    const result = AdminUserUpdateSchema.safeParse(await req.json())
    if (!result.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: result.error.format() }, { status: 400 })
    }

    const data = result.data
    const targetId = Number(id)

    // Sama dengan POST: role custom boleh, id yang tidak ada di roles_config
    // tidak — user tanpa entri role akan kehilangan seluruh permission.
    const roles = await getRolesConfig()
    if (!roles.some(r => r.id === data.role)) {
      return NextResponse.json({ error: `Role "${data.role}" tidak terdaftar.` }, { status: 400 })
    }

    // Super Admin dikunci: role-nya tidak boleh diturunkan lewat API
    // (selaras dengan penguncian hardcode di UI — lihat project/review.md).
    const target = await prisma.adminUser.findUnique({
      where: { id: targetId },
      select: { role: true },
    })
    if (!target) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    if (target.role === 'super_admin' && data.role !== 'super_admin') {
      return NextResponse.json({ error: 'Role Super Admin tidak dapat diubah' }, { status: 403 })
    }

    const updateData: any = {
      nama: data.nama,
      email: data.email,
      role: data.role
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Check email uniqueness if changed
    if (data.email) {
      const existing = await prisma.adminUser.findFirst({
        where: { email: data.email, NOT: { id: targetId } }
      })
      if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const user = await prisma.adminUser.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, nama: true, email: true, role: true }
    })

    await logAudit({
      action: "user.update",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "AdminUser",
      targetId: targetId,
      detail: { roleFrom: target.role, roleTo: data.role, emailChanged: !!data.email },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    })

    return NextResponse.json(user)
  } catch (error) {
    return serverError('PUT /api/admin/users/[id]', error, { req })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission(req, 'DELETE /api/admin/users/[id]', 'users_manage')
  if (gate.denied) return gate.denied

  try {
    const { id } = await params

    // Cegah hapus diri sendiri. Dibandingkan sebagai angka: id dari params
    // selalu string, sedangkan id sesi bertipe angka — perbandingan `===`
    // sebelumnya tidak pernah bernilai true sehingga penjagaan ini mati.
    if (gate.actor.userId !== null && gate.actor.userId === Number(id)) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 })
    }

    // Super Admin dikunci: tidak dapat dihapus lewat API (selaras UI).
    const target = await prisma.adminUser.findUnique({
      where: { id: Number(id) },
      select: { role: true },
    })
    if (!target) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    if (target.role === 'super_admin') {
      return NextResponse.json({ error: 'Akun Super Admin tidak dapat dihapus' }, { status: 403 })
    }

    await prisma.adminUser.delete({
      where: { id: Number(id) }
    })

    await logAudit({
      action: "user.delete",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "AdminUser",
      targetId: id,
      detail: { role: target.role },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError('DELETE /api/admin/users/[id]', error, { req })
  }
}
