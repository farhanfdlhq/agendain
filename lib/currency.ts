export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Harga ringkas untuk kartu paket: "18 Juta" / "28,5 Juta" / "18 Million".
 *
 * Nilai non-bulat tetap ringkas dengan satu angka desimal — bentuk inilah yang
 * dipakai kartu beranda sejak awal. Membatasinya ke kelipatan satu juta saja
 * membuat harga jatuh ke format panjang "Rp 28.500.000", yang melebarkan kolom
 * grid sampai kartu keluar dari kontainernya. Di bawah 1 juta tetap pakai
 * format rupiah penuh. Sebelumnya logika ini ditulis dua kali (PackageCard &
 * DestinationsSection) dan keduanya hardcoded "Juta".
 */
export const formatPriceShort = (amount: number, locale: 'id' | 'en' = 'id'): string => {
  if (amount >= 1000000) {
    const juta = amount / 1000000
    const opts = { maximumFractionDigits: 1 }
    return locale === 'en'
      ? `${juta.toLocaleString('en-US', opts)} Million`
      : `${juta.toLocaleString('id-ID', opts)} Juta`
  }
  return formatIDR(amount)
}

export const formatEUR = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export type ExchangeRates = {
  /** Pengali IDR → EUR. */
  EUR: number;
  /** Kurs tengah 1 EUR dalam rupiah, untuk ditampilkan apa adanya. */
  eurIdr: number;
  /** `wise` bila kurs live berhasil diambil, `fallback` bila memakai angka cadangan. */
  source: "wise" | "fallback";
};

// 1 EUR dalam rupiah. Hanya dipakai bila Wise tidak bisa dihubungi; angkanya
// sengaja konservatif dan wajib ditandai `source: "fallback"` agar halaman
// tidak mengklaim kurs itu live.
const FALLBACK_EUR_IDR = 17250;

let ratesCache: ExchangeRates | null = null;
let lastFetchTime = 0;

/**
 * Kurs tengah EUR/IDR dari Wise.
 *
 * `wise.com/rates/live` adalah endpoint yang dipakai widget di situs Wise
 * sendiri; tidak butuh API key dan mengembalikan kurs tengah yang sama dengan
 * yang tampil di halaman depan mereka. Sebelumnya di sini dipakai
 * exchangerate-api.com, yang angkanya berbeda tipis dari Wise.
 *
 * Hasilnya di-cache satu jam. Kegagalan TIDAK ikut di-cache, jadi gangguan
 * sesaat tidak mengunci situs ke kurs cadangan selama sejam.
 */
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  const now = Date.now();
  if (ratesCache && now - lastFetchTime < 3600000) {
    return ratesCache;
  }

  try {
    const res = await fetch("https://wise.com/rates/live?source=EUR&target=IDR", {
      headers: { Accept: "application/json" },
      // Timeout: tanpa ini permintaan yang menggantung ikut menahan render
      // halaman paket sampai batas waktu default Node.
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`Wise HTTP ${res.status}`);

    const data = await res.json();
    const eurIdr = Number(data?.value);
    if (!Number.isFinite(eurIdr) || eurIdr <= 0) throw new Error("Nilai kurs Wise tidak valid");

    ratesCache = { EUR: 1 / eurIdr, eurIdr, source: "wise" };
    lastFetchTime = now;
    return ratesCache;
  } catch (error) {
    console.error("Gagal mengambil kurs Wise:", error);
    return { EUR: 1 / FALLBACK_EUR_IDR, eurIdr: FALLBACK_EUR_IDR, source: "fallback" };
  }
};
