import { describe, it, expect } from "vitest";
import { PERMISSION_IDS, DEFAULT_ROLES, hasPermission } from "./permissions";

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
