import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { reportAuthDenied, reportServerError } from "@/lib/error-log";
import {
  DEFAULT_ROLES,
  SUPER_ADMIN_ROLE,
  hasPermission,
  type PermissionSubject,
  type RoleDef,
} from "@/lib/permissions";

// ---------------------------------------------------------------------------
// Mesin otorisasi berbasis permission (sisi server).
//
// Sebelum modul ini, gerbang API mencocokkan *id role* yang di-hardcode
// (`isAllowedRole(role, ['super_admin','admin'])` dsb) sehingga matriks
// permissions[] pada halaman Roles & Permissions tidak pernah dibaca: role
// custom apa pun otomatis ditolak. Semua route sekarang bertanya ke sini.
//
// Vokabuler & predikatnya ada di lib/permissions.ts (murni data, aman untuk
// komponen client) dan di-re-export di bawah agar route cukup impor satu file.
// ---------------------------------------------------------------------------

export {
  DEFAULT_ROLES,
  PERMISSION_IDS,
  SUPER_ADMIN_ROLE,
  hasPermission,
} from "@/lib/permissions";
export type { PermissionId, PermissionSubject, RoleDef } from "@/lib/permissions";

// --- roles_config ----------------------------------------------------------

const ROLES_CACHE_TTL_MS = 30_000;
let rolesCache: { roles: RoleDef[]; at: number } | null = null;

/** Dipanggil setelah roles_config disimpan agar perubahan langsung berlaku. */
export function invalidateRolesCache(): void {
  rolesCache = null;
}

function parseRoles(raw: string): RoleDef[] | null {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return null;
  // Format lama memakai permission tanpa underscore ('paket', 'booking'). Data
  // seperti itu tidak bisa dipetakan ke vokabuler sekarang → pakai default.
  const hasOldFormat = parsed.some(
    (r: RoleDef) =>
      Array.isArray(r?.permissions) &&
      r.permissions.some((p) => typeof p === "string" && !p.includes("_") && p !== "all"),
  );
  if (hasOldFormat) return null;
  return parsed as RoleDef[];
}

/** roles_config dari DB (fallback DEFAULT_ROLES), di-cache singkat. */
export async function getRolesConfig(): Promise<RoleDef[]> {
  if (rolesCache && Date.now() - rolesCache.at < ROLES_CACHE_TTL_MS) {
    return rolesCache.roles;
  }

  let roles = DEFAULT_ROLES;
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "roles_config" } });
    if (setting?.value) {
      const parsed = parseRoles(setting.value);
      if (parsed) roles = parsed;
    }
  } catch (e) {
    // roles_config rusak / DB tidak terjangkau: jangan 500-kan seluruh admin,
    // pakai default (yang tetap membatasi) tapi catat supaya terlihat.
    reportServerError({ route: "lib/rbac getRolesConfig", code: "roles_read_failed" }, e);
  }

  rolesCache = { roles, at: Date.now() };
  return roles;
}

// --- resolusi actor --------------------------------------------------------

export type Actor = PermissionSubject & {
  userId: number | null;
  email: string | null;
  roleName: string;
};

/**
 * Siapa pemanggilnya & apa yang boleh dia lakukan.
 *
 * Role dibaca dari DB lewat user id, BUKAN dari JWT. `token.role` hanya ditulis
 * sekali saat sign-in (lib/auth.ts), jadi user yang rolenya diubah admin akan
 * membawa role lama sampai 30 hari ke depan. Membaca dari DB membuat perubahan
 * role langsung berlaku tanpa perlu logout.
 */
export async function resolveActor(session: unknown): Promise<Actor | null> {
  const user = (session as { user?: { id?: unknown; email?: unknown; role?: unknown } } | null)
    ?.user;
  if (!user) return null;

  const idNum = Number(user.id);
  const userId = Number.isFinite(idNum) ? idNum : null;
  const email = typeof user.email === "string" ? user.email : null;

  // Role dari JWT hanya dipakai bila baris user tidak terbaca.
  let role = typeof user.role === "string" ? user.role : "";
  if (userId !== null) {
    try {
      const row = await prisma.adminUser.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!row) return null; // user sudah dihapus tapi sesinya masih hidup
      role = row.role;
    } catch (e) {
      reportServerError({ route: "lib/rbac resolveActor", code: "actor_read_failed" }, e);
    }
  }
  if (!role) return null;

  const roles = await getRolesConfig();
  const def = roles.find((r) => r.id === role);

  // Super Admin selalu penuh, walau roles_config diedit/rusak.
  const permissions =
    role === SUPER_ADMIN_ROLE ? ["all"] : Array.isArray(def?.permissions) ? def.permissions : [];

  return { userId, email, role, roleName: def?.name ?? role, permissions };
}

// --- pengecekan ------------------------------------------------------------

export type Guard = { denied: NextResponse; actor: null } | { denied: null; actor: Actor };

/**
 * Gerbang standar untuk route admin.
 *
 *   const gate = await requirePermission(request, "POST /api/upload", "cms_manage");
 *   if (gate.denied) return gate.denied;
 *   // gate.actor tersedia untuk audit log
 *
 * Panggil tanpa `required` bila route hanya perlu sesi admin yang sah.
 */
export async function requirePermission(
  request: Request | undefined,
  route: string,
  ...required: string[]
): Promise<Guard> {
  const session = await getServerSession(authOptions);
  const actor = await resolveActor(session);

  if (!actor) {
    reportAuthDenied({ route, status: 401, code: "no_session", req: request });
    return {
      denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      actor: null,
    };
  }

  if (!hasPermission(actor, ...required)) {
    reportAuthDenied({
      route,
      status: 403,
      code: "permission_denied",
      req: request,
      actorId: actor.userId,
      actorEmail: actor.email,
      detail: { role: actor.role, requiredAnyOf: required },
    });
    return {
      denied: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      actor: null,
    };
  }

  return { denied: null, actor };
}
