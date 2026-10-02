import { describe, it, expect } from "vitest";
import { PERMISSION_IDS, DEFAULT_ROLES, RBAC_SETTINGS_V2, hasPermission, upgradeLegacyPermissions } from "./permissions";

describe("permission invoice", () => {
  it("keempat id invoice terdaftar di vokabuler", () => {
    for (const id of ["invoice_view", "invoice_create", "invoice_edit", "invoice_delete"]) {
      expect(PERMISSION_IDS).toContain(id);
    }
  });

  it("role admin mendapat keempat permission invoice", () => {
    const admin = DEFAULT_ROLES.find((r) => r.id === "admin")!;
    expect(admin.permissions).toEqual(
      expect.arrayContaining(["invoice_view", "invoice_create", "invoice_edit", "invoice_delete"]),
    );
  });

  it("role editor TIDAK mendapat akses invoice", () => {
    const editor = DEFAULT_ROLES.find((r) => r.id === "editor")!;
    // RoleDef memakai `id`, sedangkan hasPermission butuh bentuk
    // PermissionSubject yang memakai `role` — dipetakan di sini.
    expect(hasPermission({ role: editor.id, permissions: editor.permissions }, "invoice_view")).toBe(
      false,
    );
  });

  it("super_admin selalu lolos tanpa perlu didaftarkan", () => {
    expect(hasPermission({ role: "super_admin", permissions: [] }, "invoice_view")).toBe(true);
  });
});

describe("permission itinerary", () => {
  it("keempat id itinerary terdaftar di vokabuler", () => {
    for (const id of ["itinerary_view", "itinerary_create", "itinerary_edit", "itinerary_delete"]) {
      expect(PERMISSION_IDS).toContain(id);
    }
  });

  it("role admin mendapat keempat permission itinerary", () => {
    const admin = DEFAULT_ROLES.find((r) => r.id === "admin")!;
    expect(admin.permissions).toEqual(
      expect.arrayContaining(["itinerary_view", "itinerary_create", "itinerary_edit", "itinerary_delete"]),
    );
  });

  it("role editor TIDAK mendapat akses itinerary", () => {
    const editor = DEFAULT_ROLES.find((r) => r.id === "editor")!;
    expect(hasPermission({ role: editor.id, permissions: editor.permissions }, "itinerary_view")).toBe(false);
  });
});

describe("RBAC menu Pengaturan", () => {
  it("izin menu Pengaturan terdaftar terpisah", () => {
    for (const id of ["settings_manage", "users_manage", "audit_view", "roles_manage", "profile_manage"]) {
      expect(PERMISSION_IDS).toContain(id);
    }
  });

  it("role lama pemegang users_manage tetap bisa membuka Audit Log, Roles & Profil", () => {
    const upgraded = upgradeLegacyPermissions(["users_manage", "paket_view"]);
    expect(upgraded).toEqual(expect.arrayContaining(["users_manage", "audit_view", "roles_manage", "profile_manage"]));
  });

  it("role lama tanpa users_manage hanya mendapat Akun & Profil", () => {
    const upgraded = upgradeLegacyPermissions(["paket_view"]);
    expect(upgraded).toContain("profile_manage");
    expect(upgraded).not.toContain("audit_view");
    expect(upgraded).not.toContain("roles_manage");
  });

  it("role yang sudah disimpan dengan penanda v2 tidak diubah (centang admin berlaku)", () => {
    const saved = ["users_manage", RBAC_SETTINGS_V2];
    expect(upgradeLegacyPermissions(saved)).toEqual(saved);
  });

  it("role bawaan admin & editor tetap bisa mengubah profil sendiri", () => {
    for (const id of ["admin", "editor"]) {
      const role = DEFAULT_ROLES.find((r) => r.id === id)!;
      expect(hasPermission({ role: role.id, permissions: role.permissions }, "profile_manage")).toBe(true);
      expect(hasPermission({ role: role.id, permissions: role.permissions }, "audit_view")).toBe(false);
    }
  });
});
