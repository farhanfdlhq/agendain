export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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
