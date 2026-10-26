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
    version: '1.7.0',
    date: '2026-10-27',
    title: 'Pemilih tanggal baru di panel admin',
    added: [
      'Pemilih tanggal berbahasa Indonesia (minggu dimulai Senin, tombol Hari ini & Hapus) di form Invoice, Itinerary, dan Paket Wisata, menggantikan kalender bawaan browser yang tampilannya berbeda-beda.',
    ],
    improved: [
      'Jatuh Tempo invoice tidak bisa dipilih sebelum Tanggal Invoice.',
    ],
  },
  {
    version: '1.6.3',
    date: '2026-10-26',
    title: 'Halaman tidak lagi bergeser saat dimuat di ponsel & pesan login lebih aman',
    fixed: [
      'Footer tidak lagi sempat muncul lalu terdorong ke bawah saat halaman dimuat, sehingga tampilan awal di ponsel lebih stabil.',
      'Saat server database bermasalah, halaman login kini menampilkan pesan singkat yang rapi, bukan detail error teknis server.',
    ],
  },
  {
    version: '1.6.2',
    date: '2026-10-26',
    title: 'Kriteria simbol password lebih ringkas',
    improved: [
      'Kriteria simbol di form password kini ringkas dalam satu baris dan menyebut bahwa titik juga boleh dipakai.',
    ],
  },
  {
    version: '1.6.1',
    date: '2026-10-26',
    title: 'Situs lebih cepat di ponsel dan perbaikan tambah user & ganti password',
    improved: [
      'Halaman situs tampil lebih cepat di ponsel: berkas tampilan yang harus diunduh sebelum halaman muncul berkurang hampir setengahnya.',
      'Deskripsi foto utama beranda yang dibaca Google kini tanpa tanda bintang.',
    ],
    fixed: [
      'Menambah user atau mengganti password tidak lagi gagal dengan "Validasi gagal" padahal semua kriteria sudah hijau; aturan di layar dan sistem kini sama (minimal 8 karakter, simbol apa pun termasuk titik).',
      'Bila password ditolak, pesan error kini menyebut alasannya.',
      'Daftar kriteria password tidak lagi muncul di halaman login.',
    ],
  },
  {
    version: '1.6.0',
    date: '2026-10-26',
    title: 'Beranda lebih mudah ditemukan & jujur, testimoni mode foto, dan isian admin lebih aman',
    added: [
      'Sakelar baru di CMS Beranda: section testimoni bisa tampil hanya berupa foto; nama dan kutipan review baru muncul setelah sakelar dinyalakan.',
      'Menekan F5 atau Ctrl+R saat ada isian admin yang belum disimpan kini memunculkan konfirmasi "Perubahan belum disimpan" lebih dulu.',
    ],
    improved: [
      'Judul dan deskripsi halaman di hasil Google kini menyebut travel Eropa & Italia dari Indonesia dengan tour leader orang Indonesia.',
      'Ringkasan situs untuk mesin pencari AI (llms.txt) diperbarui dan hanya memuat layanan yang benar.',
      'Logo Agendain yang dibaca Google kini versi biru agar terlihat jelas di latar putih.',
      'Label FAQ di beranda cukup diatur lewat satu kolom CMS dan boleh memakai emoji (mis. ❓ FAQ); tulisan "FAQ" tidak lagi muncul dua kali.',
      'Menu Destinasi digabung ke Paket Wisata (tombol Kelola Destinasi) sehingga sidebar admin lebih ringkas.',
      'Tab di seluruh panel admin kini seragam dengan gaya tab Audit Log.',
      'Gambar utama beranda dimuat lebih cepat di ponsel dan teks hero langsung tampil sejak awal.',
      'Tombol WhatsApp di beranda dan footer kini seragam, dengan efek hover yang konsisten.',
      'Teks layar memuat dibuat lebih ringkas dan santai.',
    ],
  },
  {
    version: '1.5.1',
    date: '2026-10-25',
    title: 'Optimasi SEO Teknis, Peta Situs Gambar & Feed RSS',
    added: [
      'Peta situs (sitemap.xml) kini menyertakan metadata gambar Google Image untuk seluruh rute paket dan artikel blog.',
      'Feed RSS publik resmi di /feed.xml untuk percepatan perayapan artikel baru oleh Google dan pembaca konten.',
      'Dukungan file ringkasan AI /llms.txt serta aturan perayapan ramah mesin telusur AI modern di robots.txt.',
      'Schema markup JSON-LD BreadcrumbList di seluruh halaman publik dan TouristTrip terstruktur pada detail paket.',
    ],
    improved: [
      'Pemberian dimensi presisi pada logo navbar dan footer untuk mencegah pergeseran tata letak (CLS).',
      'Peningkatan area sentuh tombol interaktif navbar dan footer sesuai standar aksesibilitas mesin telusur.',
    ],
    fixed: [
      'Eliminasi pergeseran tata letak (CLS 0.400) pada beranda akibat pembungkus streaming data.',
      'Pencegahan pengindeksan artikel tidak ditemukan dengan tag robot noindex otomatis.',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-10-24',
    title: 'Kustomisasi penuh teks Beranda via CMS dan pengelolaan destinasi terintegrasi',
    added: [
      'Seluruh teks tombol CTA dan label di 7 bagian beranda (Hero, Destinasi, Testimonial, Accordion, Bukti Sosial, FAQ) kini dapat diedit langsung lewat CMS Admin.',
      'Dukungan penuh bilingual (Indonesia & English) untuk teks tombol, kutipan testimoni, dan ajakan di beranda.',
      'Pengelolaan destinasi terintegrasi langsung dalam modal di halaman Paket Wisata.',
    ],
    improved: [
      'CMS Beranda otomatis mengisi teks bawaan saat pertama kali dibuka sehingga form tidak kosong.',
      'Penyederhanaan struktur data destinasi sebagai label lokasi paket wisata.',
    ],
  },
  {
    version: '1.4.2',
    date: '2026-10-23',
    title: 'Sidebar admin lebih ringkas dan pengelolaan kategori blog',
    improved: [
      'Artikel Blog tersedia langsung di menu utama; pesanan, dokumen, halaman situs, dan pengaturan dikelompokkan lebih jelas.',
      'Kategori blog dapat dikelola dari daftar artikel dan ditambahkan dari editor artikel.',
      'Menu serta tombol aksi mengikuti hak akses pengguna.',
    ],
    fixed: [
      'Menu tetap bisa dibuka saat sidebar diciutkan; grup dapat dioperasikan dengan keyboard.',
      'Menu HP menutup setelah memilih halaman, dan tautan bagian tetap terbaca pada layar kecil.',
      'Pratinjau artikel draft dari daftar artikel kembali membuka pratinjau yang benar.',
      'Kegagalan memuat kategori menawarkan Coba lagi, dan kategori yang masih digunakan tidak dapat dihapus.',
    ],
  },
  {
    version: '1.4.1',
    date: '2026-10-23',
    title: 'Perlindungan akun admin, penyimpanan CMS, dan pemesanan',
    improved: [
      'Pengaturan internal website terlindungi dari pengunjung.',
      'Pengelola akun hanya dapat memberikan dan mengelola hak akses yang sesuai kewenangannya.',
      'Ganti password mencabut sesi login lama; setelah pembaruan ini admin perlu login ulang.',
    ],
    fixed: [
      'CMS Private Trip: kegagalan menyimpan tidak lagi menghapus paket yang sudah ada.',
      'Pemesanan ditolak bila paket belum terbit, jadwal sudah lewat atau berbeda, maupun kursi tidak mencukupi.',
      'Status Lunas dapat disimpan dan memeriksa ketersediaan kursi.',
      'Paket draft hanya dapat dilihat oleh admin yang memiliki izin paket.',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-10-15',
    title: 'Blog per halaman & jumlah dibaca, form Request Private Trip baru',
    added: [
      'Blog: daftar artikel kini dibagi per halaman (9 artikel per halaman) dengan nomor halaman; kategori, pencarian, dan halaman tersimpan di alamat sehingga bisa dibagikan.',
      'Blog: artikel menampilkan "kali dibaca" setelah dibaca minimal 50 kali; Admin → Blog punya kolom Dibaca yang bisa diurutkan untuk melihat artikel terpopuler.',
      'Artikel blog: garis progres baca tipis di atas layar.',
      'Form Request Private Trip tampil baru: panel biru berisi poin keunggulan, pilihan budget sekali klik, dan pemilih bulan yang serasi dengan desain website.',
      'CMS Private Trip: teks form Request Private Trip (judul, sub-judul, poin keunggulan yang bisa ditambah/dihapus, ajakan WhatsApp) kini bisa diedit, serta pengaturan font untuk judul & sub-judul Cara Booking.',
      'Kolom angka di admin dan form booking memakai tombol − / + yang lebih mudah ditekan.',
    ],
    improved: [
      'Pencarian blog mencocokkan setiap kata tanpa peduli urutan dan ikut mencari judul berbahasa Inggris.',
      'Artikel besar di atas daftar Blog kini berlabel "Artikel Terbaru" (sebelumnya "Artikel Utama"), sesuai isinya: artikel yang paling baru terbit.',
      'Paket Private Trip tampil rapi di tengah saat hanya ada 2 paket.',
      'CMS Private Trip lebih ringkas: teks, ketebalan, dan ukuran font dalam satu baris; daftar keunggulan & langkah tampil 2 per baris.',
      'Isi halaman tetap terlihat walau animasi belum berjalan, dan konten di layar pertama langsung tampil tanpa menunggu animasi.',
      'Di HP, deretan kategori blog memberi tanda bahwa masih bisa digeser.',
      'Halaman lebih ringan dan lebih ramah mesin pencari: isi halaman tidak lagi termuat dua kali.',
      'Pembaruan keamanan sistem website.',
    ],
    fixed: [
      'CMS Private Trip: poin fitur paket kini bisa diketik normal — spasi dan Enter tidak lagi hilang.',
      'Admin → Blog kini menampilkan semua artikel (sebelumnya maksimal 50).',
      'Tautan kategori di halaman artikel kini membuka daftar artikel kategori tersebut.',
      'Halaman artikel blog: label kategori, tombol Bagikan, teks info, dan garis pemisah kini tampil dengan warna brand (sebelumnya polos/hitam).',
      'PDF itinerary & invoice kini menampilkan logo perusahaan (rata kiri seperti di halaman web), tanda tangan, dan gambar aktivitas — sebelumnya hilang bila gambarnya berformat WebP.',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-10-12',
    title: 'Gambar Private Trip dari CMS, halaman error memakai logo situs',
    added: [
      'CMS Private Trip: gambar di samping daftar keunggulan ("Mengapa Memilih Kami") kini bisa diganti.',
      'Halaman login admin: tautan "Kembali ke website".',
    ],
    improved: [
      'Halaman "sedang istirahat" saat website diperbarui kini memakai logo dan favicon yang terpasang di Pengaturan.',
      'Label gambar CMS Beranda lebih jelas: gambar samping Accordion dibedakan dari gambar latar Bukti Sosial (yang tampil buram).',
      'Bila logo di Pengaturan belum diisi, website memakai logo resmi Agendain (versi putih atau biru sesuai latar).',
    ],
    fixed: [
      'Menu dan footer tidak lagi sempat menampilkan kode teks seperti "nav.home" sebelum halaman selesai dimuat.',
      'Logo di halaman login admin kini terlihat di HP.',
      'Favicon pada tab PDF invoice/itinerary kembali tampil.',
    ],
  },
  {
    version: '1.2.1',
    date: '2026-10-10',
    title: 'Halaman error yang rapi saat website gagal dimuat',
    improved: [
      'Saat website sedang diperbarui atau mengalami gangguan, pengunjung kini melihat halaman bermerek Agendain dengan tombol Muat ulang dan Beranda, serta otomatis mencoba lagi, bukan tulisan polos "Internal Server Error".',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-10-10',
    title: 'Statistik Open Trip bisa diatur dari CMS',
    added: [
      'CMS Open Trip: kartu Statistik untuk mengatur angka, akhiran (+, K+, %), dan label Indonesia/Inggris keempat statistik di bawah hero, lengkap dengan pratinjau.',
    ],
    improved: [
      'Kolom angka Statistik memakai tombol − / + yang lebih jelas, menggantikan panah kecil bawaan browser.',
    ],
    fixed: [
      'Judul hero Beranda kembali tampil 2 baris di layar lebar (sebelumnya terpecah 3 baris).',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-10-09',
    title: 'Ukuran judul seragam, kontrol font lebih lengkap, dan CMS Footer standar',
    added: [
      'Halaman Tentang Kami: artikel blog tampil 2 per halaman dengan tombol nomor halaman.',
      'CMS Beranda: ketebalan & ukuran teks pertanyaan dan jawaban FAQ, serta judul dan isi daftar "Sudut Pandang", bisa diatur.',
      'Tombol "Lihat Website" di dashboard membuka halaman yang sedang diedit (mis. CMS Tentang Kami → /tentang, edit paket → halaman paketnya).',
      'Pilihan Font Size di CMS diberi label peran: Hero, Judul Section, Judul Kartu, Lead, Body, Caption.',
    ],
    improved: [
      'Ukuran judul seragam di semua halaman: semua judul hero sama besar, begitu juga semua judul section.',
      'CMS Footer mengikuti standar CMS lain: tiap teks punya Font Weight & Font Size, live preview tagline, dan kartu disusun sesuai urutan footer.',
      'Tagline footer memakai format *bintang* untuk kata kuning, sama dengan halaman CMS lain.',
      'Teks di dashboard admin dirapikan ke Bahasa Indonesia (Roles, Desain, editor artikel, dan lainnya) tanpa emoji dan istilah teknis yang bocor.',
    ],
    fixed: [
      'Tombol "Konsultasi Trip" di halaman Tentang Kami tidak lagi membuka halaman yang tidak ada; kini menuju Private Trip.',
      'Tombol di bawah daftar "Sudut Pandang" berlabel sesuai tujuannya: "Lihat Semua Open Trip".',
      'Statistik Open Trip terbaca "Tahun Pengalaman", dan beberapa teks salah ketik atau kurang tepat di website diperbaiki.',
      'Field "Opsi Penjemputan" yang sudah tidak dipakai dihapus dari Pengaturan Sistem.',
    ],
  },
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
