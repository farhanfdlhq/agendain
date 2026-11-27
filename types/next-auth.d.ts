import { DefaultSession, DefaultUser } from "next-auth"
// Import diperlukan agar augmentasi modul "next-auth/jwt" di bawah mengacu ke modul aslinya.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      avatar?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: string
    avatar?: string
    passwordVersion?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    avatar?: string
    passwordVersion?: string
  }
}
