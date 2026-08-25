import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIp, serverError } from "@/lib/security"
import { logAudit } from "@/lib/audit"
import {
  DEFAULT_ROLES,
  PERMISSION_IDS,
  SUPER_ADMIN_ROLE,
  getRolesConfig,
  invalidateRolesCache,
  requirePermission,
  type RoleDef,
} from "@/lib/rbac"

export async function GET() {
  const gate = await requirePermission(undefined, "GET /api/admin/roles", "users_manage")
  if (gate.denied) return gate.denied

  const roles = await getRolesConfig()
  const users = await prisma.adminUser.findMany({ select: { role: true } })

  const rolesWithCount = roles.map(r => ({
    ...r,
    userCount: users.filter((u: { role: string }) => u.role === r.id).length
  }))

  return NextResponse.json(rolesWithCount)
}

const ALLOWED_PERMISSIONS = new Set<string>(PERMISSION_IDS)

/**
 * Bersihkan payload sebelum disimpan: buang permission yang tidak dikenal
 * (mencegah roles_config terisi id yang tidak pernah dicek gerbang mana pun),
 * dan pastikan Super Admin tetap 'all' agar tidak bisa dikunci dari sistemnya
 * sendiri lewat payload buatan tangan.
 */
function sanitizeRoles(input: unknown): { ok: true; roles: RoleDef[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: 'Payload harus berupa array role.' }
  if (input.length > 50) return { ok: false, error: 'Terlalu banyak role.' }

  const seen = new Set<string>()
  const roles: RoleDef[] = []

  for (const raw of input) {
    const id = typeof raw?.id === 'string' ? raw.id.trim() : ''
    const name = typeof raw?.name === 'string' ? raw.name.trim() : ''
    if (!id || !name) return { ok: false, error: 'Setiap role wajib punya id dan nama.' }
    if (!/^[a-z0-9_]+$/.test(id)) {
      return { ok: false, error: `Id role "${id}" hanya boleh huruf kecil, angka, dan underscore.` }
    }
    if (seen.has(id)) return { ok: false, error: `Id role "${id}" duplikat.` }
    seen.add(id)

    const permissions =
      id === SUPER_ADMIN_ROLE
        ? ['all']
        : (Array.isArray(raw?.permissions) ? raw.permissions : []).filter(
            (p: unknown): p is string => typeof p === 'string' && ALLOWED_PERMISSIONS.has(p),
          )

    roles.push({
      id,
      name: name.slice(0, 100),
      description: typeof raw?.description === 'string' ? raw.description.slice(0, 300) : '',
      permissions,
    })
  }

  // Super Admin tidak boleh hilang dari konfigurasi.
  if (!seen.has(SUPER_ADMIN_ROLE)) {
    const fallback = DEFAULT_ROLES.find(r => r.id === SUPER_ADMIN_ROLE)!
    roles.unshift(fallback)
  }

  return { ok: true, roles }
}

export async function POST(req: Request) {
  const gate = await requirePermission(req, "POST /api/admin/roles", "users_manage")
  if (gate.denied) return gate.denied

  try {
    const parsed = sanitizeRoles(await req.json())
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const value = JSON.stringify(parsed.roles)

    await prisma.setting.upsert({
      where: { key: 'roles_config' },
      update: { value },
      create: { key: 'roles_config', value },
    })

    // Wajib: tanpa ini gerbang API masih memakai roles_config lama s/d 30 detik.
    invalidateRolesCache()

    await logAudit({
      action: "role.update",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "Setting",
      targetId: "roles_config",
      detail: { roleNames: parsed.roles.map(r => r.name) },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError('POST /api/admin/roles', error, { req })
  }
}
