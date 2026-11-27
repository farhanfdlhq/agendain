/**
 * Data peta arsitektur website untuk tab Arsitektur di Admin → Audit Log.
 * Bahasa awam: setiap perangkat punya `use` (kegunaan) dan `ana` (perumpamaan).
 * Sengaja tanpa detail sensitif (port, nama panel server, lokasi server).
 * Koordinat [x, z] di lantai isometrik; satu satuan ≈ satu kotak kisi.
 */

export type ArchNodeKind = "phone" | "pc" | "cloud" | "router" | "server" | "db" | "chat"

export type ArchNode = {
  id: string
  pos: [number, number]
  kind: ArchNodeKind
  color?: number
  name: string
  sub: string
  use: string
  ana: string
  facts: string[]
}

export type ArchZone = {
  name: string
  x: [number, number]
  z: [number, number]
  tone: "blue" | "peach"
}

export type ArchLinkKind = "net" | "server" | "wa"

/** [dari, ke, jenis kabel, lengkungan] */
export type ArchLink = [string, string, ArchLinkKind, number]

export type PacketType = "req" | "res" | "data" | "wa" | "err"

/** [dari, ke, jenis paket, isi] */
export type ArchHop = [string, string, PacketType, string]

export type ArchFlowKey = "home" | "trip" | "booking" | "wa" | "notfound"

export type ArchFlow = { key: ArchFlowKey; label: string; title: string; hops: ArchHop[] }

export const PACKET_TYPES: Record<PacketType, { color: number; label: string }> = {
  req: { color: 0x2f6fe0, label: "Permintaan" },
  res: { color: 0x1fa463, label: "Balasan" },
  data: { color: 0xd99a00, label: "Data" },
  wa: { color: 0x25d366, label: "WhatsApp" },
  err: { color: 0xc0392b, label: "404" },
}

export const ARCH_NODES: ArchNode[] = [
  {
    id: "hp", pos: [-18, 0], kind: "phone", color: 0x34495a, name: "Pengunjung", sub: "HP atau laptop",
    use: "Perangkat yang dipakai calon traveler untuk membuka agendain.com: melihat paket, membaca artikel, dan mengirim booking.",
    ana: "Ibaratnya tamu yang datang ke kantor travel.",
    facts: ["Situs tersedia dalam bahasa Indonesia dan Inggris", "Tampilan menyesuaikan layar HP maupun laptop"],
  },
  {
    id: "internet", pos: [-11, 0], kind: "cloud", name: "Internet", sub: "Seluler · WiFi",
    use: "Jalur yang menghubungkan perangkat pengunjung ke Agendain, lewat operator seluler atau WiFi.",
    ana: "Ibaratnya jalan raya menuju kantor.",
    facts: [],
  },
  {
    id: "wa", pos: [-4, -7], kind: "chat", color: 0x25d366, name: "WhatsApp", sub: "Chat langsung",
    use: "Tombol hijau di setiap halaman untuk langsung chat dengan tim Agendain. Pesan pembukanya sudah terisi otomatis, jadi pengunjung tinggal kirim.",
    ana: "Ibaratnya nomor telepon kantor yang bisa langsung dihubungi.",
    facts: ["Langsung ke aplikasi WhatsApp, tidak lewat server Agendain"],
  },
  {
    id: "cf", pos: [-4, 0], kind: "router", color: 0xf38020, name: "Cloudflare", sub: "Gerbang dan pengaman",
    use: "Pintu depan situs. Cloudflare mengarahkan alamat agendain.com ke server yang benar, mengunci koneksi supaya aman (ikon gembok di browser), menyimpan salinan foto agar situs cepat dibuka, dan menahan lalu lintas mencurigakan sebelum sampai ke server.",
    ana: "Ibaratnya resepsionis sekaligus satpam di pintu depan, yang juga menyimpan brosur siap ambil.",
    facts: ["Foto yang sudah disimpan tidak perlu diambil ulang dari server", "Salinan diperbarui otomatis saat konten diubah"],
  },
  {
    id: "web", pos: [3, 0], kind: "server", color: 0x3f63c9, name: "Web server", sub: "Pengantar permintaan",
    use: "Menerima permintaan yang sudah lolos dari Cloudflare, lalu mengantarkannya ke aplikasi Agendain.",
    ana: "Ibaratnya petugas yang mengantar tamu ke ruangan yang tepat.",
    facts: ["Menyala otomatis bila server dinyalakan ulang"],
  },
  {
    id: "next", pos: [10, 0], kind: "server", color: 0x054569, name: "Next.js", sub: "Aplikasi Agendain",
    use: "Otak situs Agendain. Menyusun setiap halaman (beranda, paket, blog), memeriksa isi form booking, menjaga panel admin, dan menjawab alamat yang salah dengan halaman 404.",
    ana: "Ibaratnya staf kantor yang menyiapkan informasi paket untuk setiap tamu.",
    facts: ["Booking dicek dulu: status paket, tanggal, kuota, dan harga", "Alamat yang salah tidak ikut terbaca Google"],
  },
  {
    id: "db", pos: [17, 0], kind: "db", color: 0x3f63c9, name: "Database", sub: "Penyimpanan data",
    use: "Tempat semua data Agendain disimpan: paket dan jadwal, harga, kuota, artikel, isi halaman, booking yang masuk, dan akun admin.",
    ana: "Ibaratnya lemari arsip kantor.",
    facts: ["Dicadangkan otomatis setiap hari"],
  },
]

export const ARCH_ZONES: ArchZone[] = [
  { name: "Pengunjung", x: [-21, -15], z: [-3.4, 3.4], tone: "blue" },
  { name: "Internet", x: [-14, -0.6], z: [-10, 3.4], tone: "blue" },
  { name: "Server Agendain", x: [0.6, 20.4], z: [-3.4, 3.4], tone: "peach" },
]

export const ARCH_LINKS: ArchLink[] = [
  ["hp", "internet", "net", 0],
  ["internet", "cf", "net", 0],
  ["internet", "wa", "wa", 0.1],
  ["cf", "web", "net", 0],
  ["web", "next", "server", 0],
  ["next", "db", "server", 0],
]

export const ARCH_FLOWS: ArchFlow[] = [
  {
    key: "home", label: "Buka beranda", title: "Pengunjung membuka beranda",
    hops: [
      ["hp", "internet", "req", "buka agendain.com"], ["internet", "cf", "req", "cek alamat dan koneksi aman"],
      ["cf", "web", "req", "teruskan ke server"], ["web", "next", "req", "ke aplikasi"],
      ["next", "db", "data", "ambil konten beranda"], ["db", "next", "data", "konten dan paket"],
      ["next", "web", "res", "halaman jadi"], ["web", "cf", "res", "halaman"],
      ["cf", "internet", "res", "halaman + foto dari salinan"], ["internet", "hp", "res", "beranda tampil"],
    ],
  },
  {
    key: "trip", label: "Lihat paket", title: "Pengunjung melihat paket Open Trip",
    hops: [
      ["hp", "internet", "req", "buka halaman paket"], ["internet", "cf", "req", "koneksi aman"],
      ["cf", "web", "req", "teruskan ke server"], ["web", "next", "req", "ke aplikasi"],
      ["next", "db", "data", "ambil paket dan jadwal"], ["db", "next", "data", "harga, kuota, itinerary"],
      ["next", "web", "res", "halaman paket"], ["web", "cf", "res", "halaman"],
      ["cf", "internet", "res", "halaman + foto dari salinan"], ["internet", "hp", "res", "detail paket tampil"],
    ],
  },
  {
    key: "booking", label: "Kirim booking", title: "Pengunjung mengirim booking",
    hops: [
      ["hp", "internet", "req", "kirim form booking"], ["internet", "cf", "req", "koneksi aman"],
      ["cf", "web", "req", "teruskan ke server"], ["web", "next", "req", "cek isi form"],
      ["next", "db", "data", "cek kuota dan harga"], ["db", "next", "data", "valid"],
      ["next", "db", "data", "simpan booking"], ["db", "next", "data", "tersimpan"],
      ["next", "web", "res", "booking diterima"], ["web", "cf", "res", "balasan"],
      ["cf", "internet", "res", "balasan"], ["internet", "hp", "res", "pesan terima kasih"],
    ],
  },
  {
    key: "wa", label: "Chat WhatsApp", title: "Pengunjung menekan tombol WhatsApp",
    hops: [
      ["hp", "internet", "wa", "buka WhatsApp"], ["internet", "wa", "wa", "pesan pembuka terisi"],
      ["wa", "internet", "res", "chat terbuka"], ["internet", "hp", "res", "ngobrol dengan tim"],
    ],
  },
  {
    key: "notfound", label: "Alamat salah", title: "Pengunjung membuka alamat yang salah",
    hops: [
      ["hp", "internet", "req", "buka artikel salah ketik"], ["internet", "cf", "req", "koneksi aman"],
      ["cf", "web", "req", "teruskan ke server"], ["web", "next", "req", "cek alamat"],
      ["next", "db", "data", "cari artikel"], ["db", "next", "err", "tidak ada"],
      ["next", "web", "err", "halaman tidak ditemukan"], ["web", "cf", "err", "404"],
      ["cf", "internet", "err", "404"], ["internet", "hp", "err", "halaman 404"],
    ],
  },
]

export const ARCH_NODE_MAP: Record<string, ArchNode> = Object.fromEntries(ARCH_NODES.map((n) => [n.id, n]))
