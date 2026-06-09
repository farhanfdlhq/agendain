import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

type Role = 'super_admin' | 'admin' | 'editor'

const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 3,
  admin: 2,
  editor: 1,
}

export async function requireRole(minRole: Role = 'admin') {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const userRole = (session.user as any).role as Role || 'editor'
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
    return { authorized: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { authorized: true, session, role: userRole }
}
