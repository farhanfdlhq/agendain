import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import type { NextRequest } from "next/server"

const handler = NextAuth(authOptions)

async function authHandler(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params
  // NextAuth v4 expects a synchronous params object in context
  return handler(req, { ...context, params })
}

export { authHandler as GET, authHandler as POST }
