import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";

/**
 * Identitas + permission efektif milik pemanggil sendiri.
 *
 * Dibutuhkan sidebar admin: /api/admin/roles hanya untuk pemegang
 * `users_manage`, jadi role biasa tidak bisa memakainya untuk tahu menu apa
 * yang boleh ia lihat. Tanpa `required` — cukup sesi admin yang sah.
 */
export async function GET(request: Request) {
  const gate = await requirePermission(request, "GET /api/admin/me");
  if (gate.denied) return gate.denied;

  const { role, roleName, permissions, email } = gate.actor;
  return NextResponse.json({ role, roleName, permissions, email });
}
