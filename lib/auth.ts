import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIpFromHeaders } from "@/lib/security";
import { logAudit } from "@/lib/audit";

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
          throw new Error("Email dan password harus diisi");
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
            throw new Error("Terlalu banyak percobaan login. Coba lagi nanti.");
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
          throw new Error("Terlalu banyak percobaan login. Coba lagi nanti.");
        }

        const user = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!user) {
          await logAudit({
            action: "login.failed",
            actorEmail: email,
            detail: { reason: "user_not_found" },
            ip,
            userAgent,
          });
          throw new Error("Email atau password salah");
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
          throw new Error("Email atau password salah");
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
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
