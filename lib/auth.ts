import { NextAuthOptions } from "next-auth";
import { LOGIN_ERRORS } from "./auth-messages";
import CredentialsProvider from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIpFromHeaders } from "@/lib/security";
import { logAudit } from "@/lib/audit";
import { decodeSessionToken, passwordVersion } from "@/lib/session-token";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@agendain.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Tangkap IP & user-agent untuk audit. authorize() tak menerima `req`,
        // jadi ambil dari next/headers (async di Next 16). Dibungkus try/catch
        // agar kegagalan capture tak pernah menggagalkan proses login.
        let ip: string | null = null,
          userAgent: string | null = null;
        try {
          const h = await headers();
          ip = getClientIpFromHeaders(h);
          userAgent = h.get("user-agent");
        } catch {}

        if (!credentials?.email || !credentials?.password) {
          await logAudit({
            action: "login.failed",
            actorEmail: credentials?.email?.toLowerCase().trim() ?? null,
            detail: { reason: "missing_fields" },
            ip,
            userAgent,
          });
          throw new Error(LOGIN_ERRORS.empty);
        }

        const email = credentials.email.toLowerCase().trim();

        // Rate limit per-IP, di samping per-email di bawah. Per-email saja bisa
        // ditembus credential spraying: banyak email berbeda dari satu IP, tiap
        // email tetap di bawah 8. Batas per-IP membendung total percobaan dari
        // satu sumber. Angkanya lebih longgar (20) agar kantor ber-NAT dengan
        // beberapa admin tidak ikut terblokir. Dilewati bila IP gagal ditangkap
        // (jangan kunci user sah karena header hilang); cf-connecting-ip dari
        // Cloudflare tidak bisa dipalsukan end-user.
        if (ip) {
          const ipLimit = rateLimit(`login-ip:${ip}`, 20, 5 * 60 * 1000);
          if (!ipLimit.success) {
            await logAudit({
              action: "login.failed",
              actorEmail: email,
              detail: { reason: "rate_limited_ip" },
              ip,
              userAgent,
            });
            throw new Error(LOGIN_ERRORS.rateLimited);
          }
        }

        const loginLimit = rateLimit(`login:${email}`, 8, 5 * 60 * 1000);
        if (!loginLimit.success) {
          await logAudit({
            action: "login.failed",
            actorEmail: email,
            detail: { reason: "rate_limited" },
            ip,
            userAgent,
          });
          throw new Error(LOGIN_ERRORS.rateLimited);
        }

        // Error Prisma memuat path & detail server; jangan sampai ke layar login.
        let user;
        try {
          user = await prisma.adminUser.findUnique({ where: { email } });
        } catch (e) {
          console.error("Login: gagal membaca adminUser", e);
          throw new Error(LOGIN_ERRORS.unavailable);
        }

        if (!user) {
          await logAudit({
            action: "login.failed",
            actorEmail: email,
            detail: { reason: "user_not_found" },
            ip,
            userAgent,
          });
          throw new Error(LOGIN_ERRORS.invalid);
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          await logAudit({
            action: "login.failed",
            actorId: user.id,
            actorEmail: email,
            detail: { reason: "bad_password" },
            ip,
            userAgent,
          });
          throw new Error(LOGIN_ERRORS.invalid);
        }

        await logAudit({
          action: "login.success",
          actorId: user.id,
          actorEmail: email,
          ip,
          userAgent,
        });

        return {
          id: user.id.toString(),
          name: user.nama,
          email: user.email,
          role: user.role,
          avatar: user.avatar ?? undefined,
          passwordVersion: passwordVersion(user.password),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: { decode: decodeSessionToken },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        if (session?.name) token.name = session.name;
        if (session?.avatar !== undefined) token.avatar = session.avatar;
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.avatar = user.avatar;
        token.passwordVersion = user.passwordVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
