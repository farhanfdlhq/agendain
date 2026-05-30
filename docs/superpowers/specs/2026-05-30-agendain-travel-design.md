# Agendain Travel Website — Design Specification
**Date:** 2026-05-30  
**Status:** Approved by client  
**Author:** Brainstorming session

---

## 1. Project Overview

**Agendain** adalah website travel agency hybrid yang melayani perjalanan dari Indonesia ke Italia, Eropa, dan internasional. Model bisnis hybrid: landing page paket wisata + direct booking + form inquiry + konsultasi WhatsApp.

### Target Pengguna
- Wisatawan Indonesia yang ingin ke Italia/Eropa
- Usia 22–45 tahun, melek digital
- Mencari paket wisata terpercaya dengan harga transparan

### Bahasa
- Bahasa Indonesia (utama untuk MVP)
- Siap untuk bilingual di fase berikutnya

---

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Vanilla CSS + CSS Modules |
| **Database** | MySQL |
| **ORM** | Prisma |
| **Auth (Admin)** | NextAuth.js (credential provider) |
| **Font** | Inter (Google Fonts) |
| **Deploy** | VPS + PM2 + Nginx reverse proxy |

---

## 3. Color System

### Strategi
Green (#103a20) mendominasi struktur (navbar, footer, dark bands).
Red (#d92028) sebagai aksen aksi (CTA, search orb, harga, badge).
White canvas membiarkan foto bernapas.

### Tokens

```css
--color-primary: #d92028;
--color-primary-active: #b8181e;
--color-primary-disabled: #f5b0b3;
--color-dominant: #103a20;
--color-dominant-hover: #1a5c30;
--color-dominant-surface: #0d2e19;
--color-dominant-tint: #e8f0eb;
--color-canvas: #ffffff;
--color-surface-soft: #f7f8f7;
--color-surface-card: #fafafa;
--color-ink: #1a1a1a;
--color-body: #3d3d3d;
--color-muted: #6b7280;
--color-on-primary: #ffffff;
--color-on-dominant: #ffffff;
--color-hairline: #e5e7eb;
--color-border-strong: #d1d5db;
```

---

## 4. Typography

Font: Inter (Google Fonts)

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| display-xl | 48px | 700 | Hero h1 |
| display-lg | 36px | 700 | Section headline |
| display-md | 28px | 600 | Sub-section head |
| title-lg | 22px | 600 | Card title besar |
| title-md | 18px | 600 | Card title normal |
| body-lg | 18px | 400 | Body utama hero |
| body-md | 16px | 400 | Running text |
| body-sm | 14px | 400 | Meta, label kecil |
| caption | 13px | 500 | Badge, tag |
| button-md | 16px | 600 | CTA label |

---

## 5. Layout & Spacing

```css
--spacing-xxs: 2px;   --spacing-xs: 4px;    --spacing-sm: 8px;
--spacing-md: 12px;   --spacing-base: 16px; --spacing-lg: 24px;
--spacing-xl: 32px;   --spacing-xxl: 48px;  --spacing-section: 64px;
--rounded-sm: 8px;    --rounded-md: 14px;
--rounded-lg: 20px;   --rounded-xl: 32px;   --rounded-full: 9999px;
--shadow-card: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px;
```

Breakpoints: Mobile <744px | Tablet 744-1128px | Desktop 1128-1440px | Wide >1440px

---

## 6. Halaman Public

### 6.1 Beranda (/)
1. Navbar
2. Hero — foto Italia/Eropa full-screen, overlay gelap, h1, search bar
3. Kategori Cepat — pill chips per destinasi
4. Paket Unggulan — 4-up grid + "Lihat Semua"
5. Destinasi Populer — 3-up destination cards
6. Kenapa Agendain? — 4 feature icons
7. Testimonial — 2-col review cards
8. CTA Band — #103a20 background
9. Footer

### 6.2 Tentang Kami (/tentang)
Hero kecil | Story 2-col | Angka Bicara (4 stat) | Tim | Mitra | Footer

### 6.3 Paket Wisata (/paket)
Filter Bar sticky | Grid 4-up/2-up/1-up | Pagination | Footer

### 6.4 Detail Paket (/paket/[slug])
Photo Gallery (Airbnb style) | Layout 2-col:
- Kiri 60%: Judul, Itinerary Accordion, Fasilitas, Ulasan
- Kanan 38%: Reservation Card sticky (tanggal, pax, harga, [Pesan] + [WA])

### 6.5 Private Trip (/private-trip)
Hero | 3 Keunggulan | Form Request (Nama, Email, WA, Destinasi, Tanggal, Pax, Budget, Catatan) | FAQ | Footer

### 6.6 Destinasi (/destinasi)
Hero | Grid Negara 3-up | Footer

### 6.7 Detail Destinasi (/destinasi/[slug])
Hero full-bleed | Info Singkat (Bahasa, Mata Uang, Visa) | Paket ke Sini | Tempat Wajib | Tips | Footer

### 6.8 Kontak (/kontak)
Split: Form kiri | Info + WA + Maps kanan | Footer

---

## 7. Admin Dashboard (/admin)

### Routes
| Route | Fungsi |
|-------|--------|
| /admin | Login (NextAuth) |
| /admin/dashboard | Stats + booking terbaru + grafik |
| /admin/paket | CRUD paket wisata |
| /admin/destinasi | CRUD destinasi |
| /admin/booking | Kelola booking + status |
| /admin/inquiry | Kelola form kontak |
| /admin/private-trip | Kelola request private trip |

### Layout Admin
- Sidebar: #103a20, 240px
- Content bg: #f7f8f7
- Action buttons: #d92028

---

## 8. API Routes

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | /api/paket | List paket |
| GET | /api/paket/[slug] | Detail paket |
| POST | /api/booking | Buat booking |
| POST | /api/inquiries | Form kontak |
| POST | /api/private-trip | Request private trip |
| GET | /api/admin/stats | Dashboard stats (protected) |
| CRUD | /api/admin/paket | Kelola paket (protected) |
| CRUD | /api/admin/destinasi | Kelola destinasi (protected) |

---

## 9. Database Schema (Prisma)

```prisma
model Paket {
  id            Int        @id @default(autoincrement())
  nama          String
  slug          String     @unique
  deskripsi     String     @db.Text
  harga         Decimal    @db.Decimal(15, 2)
  durasi        Int
  destinasiId   Int
  destinasi     Destinasi  @relation(fields: [destinasiId], references: [id])
  foto          Json
  itinerary     Json
  fasilitas     Json
  termasuk      Json
  tidakTermasuk Json
  status        String     @default("draft")
  bookings      Booking[]
  inquiries     Inquiry[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Destinasi {
  id           Int      @id @default(autoincrement())
  nama         String
  slug         String   @unique
  negara       String
  deskripsi    String   @db.Text
  foto         String
  bahasa       String?
  matauang     String?
  waktuTerbaik String?
  infoVisa     String?  @db.Text
  pakets       Paket[]
}

model Booking {
  id         Int      @id @default(autoincrement())
  nama       String
  email      String
  noWa       String
  paketId    Int
  paket      Paket    @relation(fields: [paketId], references: [id])
  tanggal    DateTime
  jumlahPax  Int
  total      Decimal  @db.Decimal(15, 2)
  status     String   @default("pending")
  catatan    String?  @db.Text
  createdAt  DateTime @default(now())
}

model Inquiry {
  id           Int      @id @default(autoincrement())
  nama         String
  email        String
  noWa         String?
  pesan        String   @db.Text
  paketId      Int?
  paket        Paket?   @relation(fields: [paketId], references: [id])
  sudahDibalas Boolean  @default(false)
  createdAt    DateTime @default(now())
}

model PrivateTrip {
  id        Int      @id @default(autoincrement())
  nama      String
  email     String
  noWa      String
  destinasi String
  tanggal   DateTime
  jumlahPax Int
  budget    String
  catatan   String?  @db.Text
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model AdminUser {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  nama      String
  createdAt DateTime @default(now())
}
```

---

## 10. Alur Booking

```
User → Paket Detail → [Pesan Sekarang]
    ├── Chat WA → wa.me/62xxx?text=Halo paket {nama}
    ├── Form Inquiry → /api/inquiries → DB → admin review
    └── Direct Booking → pilih tanggal+pax → /api/booking → DB → admin konfirmasi
```

---

## 11. Fase Berikutnya

- Fase 2: Payment gateway (Midtrans) + Notifikasi WA otomatis
- Fase 3: Multi-bahasa (English) + Blog + Map view destinasi
- Fase 4: Review system + Dark mode
