import { SUPER_ADMIN_ROLE, RBAC_SETTINGS_V2, type PermissionSubject, type RoleDef } from "./permissions";

/** Kelola user bukan izin untuk memberikan/mengambil alih hak yang lebih tinggi. */
export function canManageUserRole(actor: PermissionSubject, role: RoleDef | undefined): boolean {
  if (actor.role === SUPER_ADMIN_ROLE) return true;
  if (!role) return false;
  if (role.id === SUPER_ADMIN_ROLE || role.permissions.includes("all")) return false;
  return role.permissions.every(
    (permission) => permission === RBAC_SETTINGS_V2 ||
      actor.permissions.includes("all") || actor.permissions.includes(permission),
  );
}

/**
 * Prinsip yang sama untuk halaman Roles: pemegang `roles_manage` yang bukan
 * Super Admin tidak boleh menambahkan izin yang ia sendiri tidak punya ke role
 * mana pun (termasuk role-nya sendiri) — kalau boleh, ia bisa menaikkan haknya
 * sendiri. Izin yang SUDAH ada di role boleh tetap ada atau dicabut.
 *
 * Mengembalikan daftar izin yang ditolak (kosong = boleh disimpan).
 */
export function forbiddenRoleGrants(
  actor: PermissionSubject,
  current: RoleDef[],
  next: RoleDef[],
): string[] {
  if (actor.role === SUPER_ADMIN_ROLE || actor.permissions.includes("all")) return [];
  const denied = new Set<string>();
  for (const role of next) {
    if (role.id === SUPER_ADMIN_ROLE) continue; // dipaksa 'all' oleh sanitizeRoles, tidak berubah
    const before = new Set(current.find((r) => r.id === role.id)?.permissions ?? []);
    for (const p of role.permissions) {
      if (p === RBAC_SETTINGS_V2 || before.has(p)) continue;
      if (!actor.permissions.includes(p)) denied.add(p);
    }
  }
  return [...denied];
}
