import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// unsafe-eval hanya diperlukan oleh tooling dev (React Refresh / webpack).
// Di production dihapus agar permukaan XSS lebih kecil. unsafe-inline pada
// script tetap dipertahankan karena bootstrap inline Next.js membutuhkannya
// (beralih ke nonce butuh refactor besar dan berisiko regresi).
//
// static.cloudflareinsights.com: beacon Web Analytics yang DISUNTIK otomatis
// oleh Cloudflare di edge. Tanpa izin ini, script-nya diblokir CSP → memunculkan
// error di console (menurunkan skor Lighthouse "Best Practices"). Beacon-nya
// mengirim data ke cloudflareinsights.com (lihat connect-src).
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com"
  : "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-src 'self' https://www.youtube.com https://www.instagram.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // AVIF didahulukan, WebP sebagai fallback. Default Next hanya WebP; AVIF
    // memangkas hero full-bleed ~30% (PageSpeed "Meningkatkan penayangan
    // gambar" ≈ 144 KiB) tanpa kehilangan kualitas yang terlihat. Next memilih
    // format pertama yang didukung browser lewat header Accept.
    formats: ["image/avif", "image/webp"],
    // Next 16 hanya melayani quality yang terdaftar; default-nya [75]. Hero
    // beranda memakai quality={85} (gambar full-bleed, 75 masih terlihat
    // lunak), jadi 85 harus disebut di sini — kalau tidak, Next menolaknya
    // dan hanya menulis peringatan di log.
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      // Aset statis di /public tanpa hash di nama file: default Next me-served
      // dengan cache pendek, dan Cloudflare (yang menghormati Cache-Control
      // origin) ikut memakai TTL pendek → PageSpeed "Gunakan durasi cache yang
      // efisien". Bendera bahasa praktis tidak pernah berubah → cache setahun.
      {
        source: '/flags/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Media unggahan CMS (mis. logo): boleh di-cache lama untuk pengunjung
      // berulang, tapi stale-while-revalidate menjaga agar penggantian gambar
      // (nama file sama) tetap menyegar tanpa memaksa pengunjung menunggu.
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
};

export default nextConfig;
