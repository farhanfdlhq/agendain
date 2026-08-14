import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { NextRequest } from "next/server"

const handler = NextAuth(authOptions)

async function authHandler(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params
  
  // Create a new context object that looks like Next 14 context
  const next14Context = { params }
  
  return handler(req, next14Context)
}

export { authHandler as GET, authHandler as POST }
