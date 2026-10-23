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
