import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Destinasi & Paket Wisata...");

  // Seed Super Admin, Manager & Editor (Segregation of Duties & Kredensial Aman)
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || "Elenmor123&";
  const hashedPassword = await bcrypt.hash(initialPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@agendain.com" },
    update: {
      password: hashedPassword,
      role: "super_admin",
    },
    create: {
      email: "admin@agendain.com",
      password: hashedPassword,
      nama: "Super Admin",
      role: "super_admin",
    },
  });
  console.log("Super Admin user updated/created: admin@agendain.com");
  if (!process.env.ADMIN_INITIAL_PASSWORD) {
    console.warn(
      "WARNING: Segera ganti password default admin@agendain.com di production!",
    );
  }

  // Akun Manager (Admin Trip)
  await prisma.adminUser.upsert({
    where: { email: "manager@agendain.com" },
    update: { role: "admin" },
    create: {
      email: "manager@agendain.com",
      password: hashedPassword,
      nama: "Trip Manager",
      role: "admin",
    },
  });

  // Akun Content Editor
  await prisma.adminUser.upsert({
    where: { email: "editor@agendain.com" },
    update: { role: "editor" },
    create: {
      email: "editor@agendain.com",
      password: hashedPassword,
      nama: "Content Editor",
      role: "editor",
    },
  });
  console.log("Segregation of duties users created (Manager & Editor).");

  // Default Settings
  await prisma.setting.upsert({
    where: { key: "contact_whatsapp" },
    update: {},
    create: { key: "contact_whatsapp", value: "+62 819-9526-4565" },
  });

  await prisma.setting.upsert({
    where: { key: "site_logo" },
    update: {},
    create: { key: "site_logo", value: "/uploads/Logo ( White Version ).png" },
  });
  console.log("Default settings created.");

  const destinasiEropaBarat = await prisma.destinasi.upsert({
    where: { slug: "eropa-barat" },
    update: {},
    create: {
      nama: "Eropa Barat",
      slug: "eropa-barat",
      negara: "Prancis, Swiss, Italia",
      deskripsi: "Kumpulan negara eksotis di Eropa Barat.",
      foto: "/uploads/seed/paris.png",
    },
  });

  const destinasiSkandinavia = await prisma.destinasi.upsert({
    where: { slug: "skandinavia" },
    update: {},
    create: {
      nama: "Skandinavia",
      slug: "skandinavia",
      negara: "Norwegia, Swedia",
      deskripsi: "Pesona salju dan fenomena alam di Eropa Utara.",
      foto: "/uploads/seed/swiss.png",
    },
  });

  const destinasiTurki = await prisma.destinasi.upsert({
    where: { slug: "turki" },
    update: {},
    create: {
      nama: "Turki",
      slug: "turki",
      negara: "Turki",
      deskripsi: "Negara lintas benua dengan kekayaan sejarah peradaban Islam.",
      foto: "/uploads/seed/italy.png",
    },
  });

  const paketData = [
    {
      nama: "Eksplorasi Eropa Barat (Prancis, Swiss, Italia)",
      slug: "eksplorasi-eropa-barat",
      deskripsi:
        "Perjalanan 10 hari melintasi 3 negara paling memukau di Eropa. Nikmati keindahan Menara Eiffel, pemandangan salju abadi di Mount Titlis Swiss, hingga sejarah panjang Colosseum di Roma.",
      harga: 28500000,
      durasi: 10,
      destinasiId: destinasiEropaBarat.id,
      foto: [
        {
          thumb: "/uploads/seed/paris.png",
          medium: "/uploads/seed/paris.png",
          full: "/uploads/seed/paris.png",
        },
      ],
      itinerary: [
        {
          hari: 1,
          judul: "Keberangkatan Jakarta - Paris",
          deskripsi:
            "Penerbangan dari Bandara Soekarno Hatta menuju CDG Paris.",
        },
        {
          hari: 2,
          judul: "Paris City Tour",
          deskripsi:
            "Mengunjungi Menara Eiffel, Louvre Museum, dan Arc de Triomphe.",
        },
        {
          hari: 3,
          judul: "Perjalanan ke Swiss",
          deskripsi: "Menggunakan kereta cepat menuju Lucerne, Swiss.",
        },
      ],
      fasilitas: [
        "Hotel Bintang 4",
        "Bus Pariwisata VIP",
        "Tour Leader Berbahasa Indonesia",
        "Dokumentasi",
      ],
      termasuk: [
        "Tiket Pesawat PP",
        "Akomodasi 9 Malam",
        "Sarapan",
        "Tiket Masuk Wisata",
      ],
      tidakTermasuk: [
        "Visa Schengen",
        "Asuransi Perjalanan",
        "Pengeluaran Pribadi",
      ],
      status: "publish",
      label: "Best Seller",
    },
    {
      nama: "Keajaiban Skandinavia & Aurora Borealis",
      slug: "skandinavia-aurora",
      deskripsi:
        "Rasakan pengalaman magis melihat langsung Northern Lights (Aurora Borealis) di Tromsø, Norwegia, serta menikmati keindahan kota Stockholm dan pesona desa-desa Nordik.",
      harga: 35000000,
      durasi: 8,
      destinasiId: destinasiSkandinavia.id,
      foto: [
        {
          thumb: "/uploads/seed/swiss.png",
          medium: "/uploads/seed/swiss.png",
          full: "/uploads/seed/swiss.png",
        },
      ],
      itinerary: [
        {
          hari: 1,
          judul: "Jakarta - Oslo",
          deskripsi: "Penerbangan menuju Oslo, Norwegia.",
        },
        {
          hari: 2,
          judul: "Berburu Aurora",
          deskripsi:
            "Perjalanan malam hari menuju spot Aurora terbaik di Tromsø.",
        },
      ],
      fasilitas: [
        "Hotel Bintang 4",
        "Transportasi Musim Dingin",
        "Peralatan Musim Dingin",
      ],
      termasuk: ["Tiket Pesawat PP", "Akomodasi", "Sarapan & Makan Malam"],
      tidakTermasuk: ["Visa Schengen", "Tipping Guide"],
      status: "publish",
      label: "Limited Seat",
    },
    {
      nama: "Halal Tour Turki & Sensasi Balon Udara",
      slug: "halal-tour-turki-cappadocia",
      deskripsi:
        "Jelajahi jejak sejarah peradaban Islam di Istanbul, kunjungi Blue Mosque, hingga menikmati pengalaman tak terlupakan terbang dengan Balon Udara di atas lembah eksotis Cappadocia.",
      harga: 18900000,
      durasi: 7,
      destinasiId: destinasiTurki.id,
      foto: [
        {
          thumb: "/uploads/seed/italy.png",
          medium: "/uploads/seed/italy.png",
          full: "/uploads/seed/italy.png",
        },
      ],
      itinerary: [
        {
          hari: 1,
          judul: "Jakarta - Istanbul",
          deskripsi: "Penerbangan menuju Istanbul.",
        },
        {
          hari: 2,
          judul: "Istanbul Historical Tour",
          deskripsi: "Kunjungan ke Blue Mosque, Hagia Sophia, Topkapi Palace.",
        },
        {
          hari: 3,
          judul: "Cappadocia Hot Air Balloon",
          deskripsi:
            "Penerbangan pagi hari menggunakan balon udara di Cappadocia.",
        },
      ],
      fasilitas: [
        "Hotel Bintang 4 & 5",
        "Bus VIP AC",
        "Meals Full Board (Halal)",
        "Tour Guide Lokal (Berbahasa Indonesia)",
      ],
      termasuk: [
        "Tiket Pesawat PP (Turkish Airlines)",
        "Akomodasi",
        "Balon Udara Cappadocia (Basic)",
        "Air Mineral 2 Botol/Hari",
      ],
      tidakTermasuk: ["Tipping Guide/Driver", "Pengeluaran Pribadi"],
      status: "publish",
      label: "Promo Spesial",
    },
  ];

  for (const p of paketData) {
    await prisma.openTrip.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log("Dummy Paket Wisata berhasil ditambahkan!");

  // Private Trip Packages
  const privateTripPackages = [
    {
      title: "VALUE TRIP — Jelajahi Lebih Banyak, Bayar Lebih Hemat!",
      subtitle: "Italy - Value",
      image: "/gallery-colosseum.webp",
      locationTab: "Italy",
      chips: ["Durasi fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
      features: [
        "Solusi terbaik buat kamu yang pengen keliling Eropa hemat tapi gak mau keganggu orang lain di open trip.",
        "Rasakan pengalaman otentik naik transportasi lokal, serasa jadi traveler sejati!",
        "Menginap nyaman di Hotel Bintang 2/3 atau Apartemen pilihan terbaik",
        "Bebas pilih sarapan (Tidak Termasuk)",
      ],
    },
    {
      title: "BALANCE TRIP — Nyaman, Seru, Tetap Worth It!",
      subtitle: "Italy - Balance",
      image: "/dest-italy.webp",
      locationTab: "Italy",
      chips: ["Durasi fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
      features: [
        "Pilihan paling cerdas buat kamu yang mau liburan berkesan tanpa kompromi kenyamanan",
        "Nikmati istirahat berkualitas di Hotel Bintang 3 yang cozy",
        "Bebas pilih sarapan (Tidak Termasuk)",
        "Dilengkapi 1x Private Car — bebas macet, bebas ribet!",
      ],
    },
    {
      title: "PREMIUM TRIP — Liburan Mewah, Semua Sudah Beres!",
      subtitle: "Italy - Premium",
      image: "/dest-france.webp",
      locationTab: "Italy",
      chips: ["Durasi fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
      features: [
        "Untuk kamu yang percaya bahwa liburan terbaik = tanpa drama dan tanpa ribet",
        "Tidur pulas di Hotel Bintang 4 pilihan eksklusif",
        "3-4x Private Car siap mengantar ke mana pun kamu mau",
        "Luggage Forwarding Service — kopermu duluan sampai, kamu tinggal santai!",
      ],
    },
  ];

  // Bersihkan data lama agar id tidak terus bertambah jika berulang
  await prisma.privateTripPackage.deleteMany({});

  for (const pt of privateTripPackages) {
    await prisma.privateTripPackage.create({
      data: pt,
    });
  }
  console.log("Dummy Private Trip Packages berhasil ditambahkan!");

  // Seed Home CMS Settings (seluruh sub-judul & deskripsi font weight: Medium / 500)
  const homeSettings = {
    // Hero
    heroTitle: 'Jelajahi *Eropa* Tanpa Beban',
    heroTitle_en: 'Explore *Europe* Burden-Free',
    heroTitleWeight: '700',
    heroSubtitle: 'Rencanakan perjalanan impian Anda bersama ahlinya. Transparan, terpercaya, dan berkesan.',
    heroSubtitle_en: 'Plan your dream journey with the experts. Transparent, trusted, and memorable.',
    heroSubtitleWeight: '500',
    heroBgImage: '/hero-coastal.webp',

    // Why Choose Us
    whyTitleMain: 'Mengapa Memilih Kami',
    whyTitleMain_en: 'Why Choose Us',
    whyTitleMainWeight: '500',
    whyTitleSub: 'Kenapa Memilih *Agendain?*',
    whyTitleSub_en: 'Why Choose *Agendain?*',
    whyTitleSubWeight: '700',
    whyItems: [
      { number: '01', image: '/uploads/seed/paris.png', title: 'Transparan & Terpercaya', desc: 'Harga jelas, tanpa biaya tersembunyi. Kami berkomitmen pada kejujuran dan keterbukaan.', titleWeight: '500', descWeight: '500' },
      { number: '02', image: '/uploads/seed/swiss.png', title: 'Pengalaman Lokal Autentik', desc: 'Nikmati perjalanan dengan sentuhan lokal yang otentik dan berkesan.', titleWeight: '500', descWeight: '500' },
      { number: '03', image: '/uploads/seed/italy.png', title: 'Layanan Premium', desc: 'Hotel bintang 4-5, transportasi VIP, dan tour leader berpengalaman.', titleWeight: '500', descWeight: '500' },
    ],
    whyItems_en: [
      { number: '01', image: '/uploads/seed/paris.png', title: 'Transparent & Trusted', desc: 'Clear pricing, no hidden fees. We are committed to honesty and transparency.', titleWeight: '500', descWeight: '500' },
      { number: '02', image: '/uploads/seed/swiss.png', title: 'Authentic Local Experience', desc: 'Enjoy trips with an authentic and memorable local touch.', titleWeight: '500', descWeight: '500' },
      { number: '03', image: '/uploads/seed/italy.png', title: 'Premium Service', desc: '4-5 star hotels, VIP transport, and experienced tour leaders.', titleWeight: '500', descWeight: '500' },
    ],

    // Destinations
    destEyebrow: 'Eksplor Bersama Agendain',
    destEyebrow_en: 'Explore With Agendain',
    destEyebrowWeight: '500',
    destTitle: '*Destinasi* Favorit',
    destTitle_en: 'Favorite *Destinations*',
    destTitleWeight: '700',

    // Testimonial
    testiBadge: 'Sudut Pandang Pelanggan',
    testiBadge_en: 'Customer Perspectives',
    testiBadgeWeight: '500',
    testiTitle: '"Perjalanan ke *Italia* yang Tak Terlupakan"',
    testiTitle_en: '"An Unforgettable Trip to *Italy*"',
    testiTitleWeight: '700',
    galleryImg1: '', galleryImg2: '', galleryImg3: '', galleryImg4: '', galleryImg5: '',

    // Accordion
    accTitle: 'Lihat, Hirup, & *Simpan* Memori',
    accTitle_en: 'See, Breathe, & *Save* Memories',
    accTitleWeight: '700',
    accSubtitle: 'Sudut Terbaik Eropa',
    accSubtitle_en: 'The Best Corners of Europe',
    accSubtitleWeight: '500',
    accImage: '/accordion-street.webp',
    accItems: [
      { title: 'Keindahan Paris', body: 'Kota cahaya yang mempesona dengan Menara Eiffel, Louvre, dan jalanan romantisnya.' },
      { title: 'Pesona Swiss', body: 'Pemandangan Alpen yang menakjubkan, danau biru jernih, dan desa-desa yang memukau.' },
      { title: 'Sejarah Roma', body: 'Colosseum, Vatikan, dan warisan peradaban kuno yang masih berdiri kokoh.' },
    ],
    accItems_en: [
      { title: 'The Beauty of Paris', body: 'The city of light captivates with the Eiffel Tower, Louvre, and romantic streets.' },
      { title: 'The Charm of Switzerland', body: 'Stunning Alpine scenery, crystal-clear lakes, and picturesque villages.' },
      { title: 'The History of Rome', body: 'The Colosseum, Vatican, and ancient civilisation heritage that still stands strong.' },
    ],

    // Social Proof
    socialName: 'El Rumi & Syifa',
    socialName_en: 'El Rumi & Syifa',
    socialTitle: 'Pengalaman *Liburan* yang Tak *Terlupakan*',
    socialTitle_en: 'An *Unforgettable* Holiday *Experience*',
    socialTitleWeight: '700',
    socialQuote: '"Agendain membuat perjalanan kami begitu mudah dan berkesan. Semua sudah diurus dengan sempurna!"',
    socialQuote_en: '"Agendain made our trip so easy and memorable. Everything was taken care of perfectly!"',
    socialSubtitle: 'Perjalanan eksklusif bersama orang-orang tersayang, tanpa ribet.',
    socialSubtitle_en: 'An exclusive journey with loved ones, hassle-free.',
    socialSubtitleWeight: '500',
    socialImage: '/el-rumi-syifa.webp',
    socialBgImg: '/dest-italy.webp',
    testiItems: [
      { name: 'Budi Santoso', text: 'Pelayanan luar biasa! Semua sudah diatur dengan rapi.' },
      { name: 'Rina Wati', text: 'Pengalaman pertama ke Eropa dan semuanya sempurna.' },
    ],
    testiItems_en: [
      { name: 'Budi Santoso', text: 'Outstanding service! Everything was perfectly arranged.' },
      { name: 'Rina Wati', text: 'First trip to Europe and everything was perfect.' },
    ],

    // FAQ
    faqTitle: 'Pertanyaan yang Sering *Ditanyakan*',
    faqTitle_en: 'Frequently *Asked* Questions',
    faqTitleWeight: '700',
    faqSubtitle: 'Masih punya pertanyaan? Hubungi kami via WhatsApp!',
    faqSubtitle_en: 'Still have questions? Contact us via WhatsApp!',
    faqSubtitleWeight: '500',
    faqItems: [
      { q: 'Apakah harga sudah termasuk tiket pesawat?', a: 'Ya, semua paket Open Trip sudah termasuk tiket pesawat PP dari Jakarta.' },
      { q: 'Bagaimana cara pembayaran?', a: 'Pembayaran bisa dilakukan via transfer bank. DP minimal 30% untuk booking.' },
      { q: 'Apakah bisa request itinerary khusus?', a: 'Tentu! Silakan pilih paket Private Trip untuk itinerary yang bisa dikustomisasi.' },
    ],
    faqItems_en: [
      { q: 'Does the price include airfare?', a: 'Yes, all Open Trip packages include round-trip airfare from Jakarta.' },
      { q: 'How do I pay?', a: 'Payment can be made via bank transfer. Minimum 30% deposit to book.' },
      { q: 'Can I request a custom itinerary?', a: 'Of course! Please choose the Private Trip package for customisable itineraries.' },
    ],

    sectionOrder: 'hero,why,destinations,testimonial,accordion,socialproof,faq',
  };

  await prisma.setting.upsert({
    where: { key: 'home_settings' },
    update: {},
    create: { key: 'home_settings', value: JSON.stringify(homeSettings) },
  });
  console.log("Home CMS Settings seeded (all subtitles/descriptions font-weight: Medium 500).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
