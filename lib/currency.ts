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

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatEUR = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

let ratesCache: any = null;
let lastFetchTime = 0;

export const fetchExchangeRates = async () => {
  const now = Date.now();
  // Cache rates for 1 hour to prevent API limits
  if (ratesCache && (now - lastFetchTime) < 3600000) {
    return ratesCache;
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/IDR');
    const data = await response.json();
    ratesCache = data.rates;
    lastFetchTime = now;
    return ratesCache;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // Fallback static rates
    return {
      USD: 0.000063, // 1 IDR = 0.000063 USD approx
      EUR: 0.000058, // 1 IDR = 0.000058 EUR approx
    };
  }
}
