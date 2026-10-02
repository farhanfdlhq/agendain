/**
 * Log versi web Agendain — ditampilkan di Admin → Audit Log → tab "Log Versi"
 * dan versi terbarunya di sidebar admin.
 *
 * CARA MENAMBAH RILIS (setiap kali commit & push yang membawa perubahan):
 * 1. Tambahkan entri BARU di PALING ATAS array `CHANGELOG`.
 * 2. Naikkan versi (semver):
 *    - major (2.0.0) → perombakan besar / perubahan alur kerja yang terasa.
 *    - minor (1.1.0) → ada fitur baru (`added`).
 *    - patch (1.0.1) → hanya perbaikan/peningkatan kecil (`fixed`/`improved`).
 * 3. Tulis poin dalam bahasa pengguna (apa yang terasa berubah), bukan pesan
 *    commit teknis. Masalah internal/firefighting tidak perlu dicatat.
 * 4. Samakan `version` di package.json.
 */

export type ChangelogEntry = {
  version: string
  /** Format YYYY-MM-DD. */
  date: string
  /** Ringkasan satu baris rilis ini. */
  title: string
  added?: string[]
  improved?: string[]
  fixed?: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.1',
    date: '2026-10-02',
    title: 'Tampilan rapi saat belum ada open trip yang dibuka',
    fixed: [
      'Halaman Open Trip menampilkan "Belum ada open trip yang dibuka saat ini" bila memang belum ada paket terbit; pesan "ubah filter" hanya muncul saat filter destinasi/durasi dipakai.',
      'Section Destinasi Favorit di beranda disembunyikan otomatis selama belum ada paket terbit, dan muncul lagi begitu paket diterbitkan.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-10-02',
    title: 'Tampilan baru open trip, footer & privacy policy, plus log versi',
    added: [
      'Log Versi di halaman Audit Log, dan versi web saat ini tampil di sidebar admin.',
      'Semua menu Pengaturan masuk Roles & Permissions: Audit Log, Roles & Permissions, dan Akun & Profil kini punya izin sendiri (role lama otomatis tetap punya akses yang sama).',
      'Footer baru: logo & sosial media di atas, kolom brand dengan tombol WhatsApp, kontak ber-ikon; semua teksnya diatur dari CMS → Footer.',
      'Halaman Privacy Policy dengan daftar isi yang mengikuti posisi baca dan nomor bagian otomatis dari konten CMS.',
      'Filter open trip menampilkan jumlah hasil, tombol reset, dan animasi saat hasil berganti.',
      'Kontrol Font Size di CMS bergaya Figma: ketik angka atau pilih dari daftar, tombol ↑/↓ untuk menaikkan/menurunkan.',
    ],
    improved: [
      'Kartu open trip baru yang sama di beranda dan halaman Open Trip: label, durasi, tanggal berangkat, sisa kursi, dan harga lengkap per pax.',
      'Section "Cara Booking Private Trip" kini berupa alur 4 langkah bernomor dengan ikon brand.',
      'Section "Pilih Destinasi Open Trip" dirapikan: judul & subjudul sejajar, dropdown filter membulat ber-ikon.',
      'Section "Destinasi Favorit" di beranda ditata ulang; tombol "Lihat Semua Open Trip" bisa diatur dari CMS.',
      'Kartu testimoni kuning memakai teks navy agar mudah dibaca.',
    ],
    fixed: [
      'Paket contoh (dummy) tidak lagi muncul saat semua paket berstatus Draft atau filter tidak menemukan hasil.',
      'Teks testimoni tidak lagi sempat berwarna putih saat slider digeser.',
      'Nomor WhatsApp tidak lagi memakai nomor contoh bila belum diatur di Pengaturan.',
    ],
  },
  {
    version: '0.8.0',
    date: '2026-09-25',
    title: 'Polesan tampilan beranda, blog & CMS',
    added: [
      'Modal bagikan artikel blog (WhatsApp, Telegram, Facebook, X, LinkedIn, Email, salin link).',
      'Kontrol Font Size di samping Font Weight untuk semua teks CMS.',
      'Web app manifest: situs bisa dipasang ke layar utama HP.',
    ],
    improved: [
      'Section "Kenapa Agendain" dirombak jadi layout bento dengan font Inter Display & Gasoek One.',
      'Animasi loading pesawat lebih mulus; angka statistik tidak lagi sempat tampil 0.',
      'Kartu paket memakai palet navy + gold.',
    ],
  },
  {
    version: '0.7.0',
    date: '2026-09-17',
    title: 'SEO & performa',
    added: [
      'Sitemap, robots.txt, dan canonical per halaman untuk Google Search Console.',
      'Kartu pratinjau saat link dibagikan (WhatsApp/sosial media) memakai foto & judul halaman.',
      'Data terstruktur (JSON-LD) untuk agen perjalanan, artikel blog, dan paket open trip.',
    ],
    improved: [
      'Skor PageSpeed naik: hero mobile tampil lebih cepat dan Best Practices 100.',
    ],
  },
  {
    version: '0.6.0',
    date: '2026-09-14',
    title: 'Form lebih aman & CTA WhatsApp kontekstual',
    added: [
      'Peringatan perubahan belum disimpan di semua form editor admin.',
      'Crop foto profil admin.',
      'Pesan WhatsApp otomatis menyesuaikan tombol/halaman yang diklik.',
      'Kurs EUR invoice bisa diisi manual.',
    ],
    improved: [
      'Tampilan beranda dirapikan untuk tablet & HP.',
      'Sidebar & footer: grup Dokumen tertutup secara default, tautan Threads.',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-09-11',
    title: 'Invoice disempurnakan & fitur Itinerary',
    added: [
      'Fitur Itinerary untuk dokumen perjalanan pelanggan.',
      'Status invoice bisa diubah langsung dari daftar.',
    ],
    improved: [
      'Input harga invoice dengan format ribuan; tampilan cetak & PDF invoice dirapikan.',
      'Kontak di kop invoice bisa diklik.',
    ],
  },
  {
    version: '0.4.0',
    date: '2026-08-30',
    title: 'Detail open trip baru & invoice',
    added: [
      'Halaman detail open trip baru: tanggal keberangkatan, sisa kursi, harga EUR dengan kurs live.',
      'Fitur Invoice untuk tagihan pelanggan.',
    ],
    improved: [
      'Semua gambar hero tampil tajam di semua ukuran layar.',
      'Dialog konfirmasi kustom menggantikan pop-up bawaan browser.',
      'Kartu reservasi open trip kembali menempel (sticky) saat digulir.',
    ],
  },
  {
    version: '0.3.0',
    date: '2026-08-24',
    title: 'Editor konten yang lebih lengkap',
    improved: [
      'Editor rich text CMS: semua tool berfungsi di halaman depan dan gambar bisa disisipkan.',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-08-19',
    title: 'Blog & audit keamanan',
    added: [
      'Blog dengan CMS (editor Tiptap, kategori, dwibahasa).',
      'Audit log: jejak login, perubahan user, role, dan profil.',
      'CMS untuk "Mengapa Memilih Kami" dan "Cara Booking" Private Trip.',
    ],
    improved: [
      'Animasi hitung pada angka statistik.',
      'Pilihan emoji instan untuk badge/chips di CMS.',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-07-26',
    title: 'Fondasi situs Agendain',
    added: [
      'Situs publik: beranda, open trip, private trip, dan tentang kami, terhubung penuh ke CMS.',
      'Dashboard admin dengan peran & hak akses (RBAC).',
    ],
  },
]

export const CURRENT_RELEASE = CHANGELOG[0]
export const APP_VERSION = CURRENT_RELEASE.version
