import { SITE_URL, absoluteUrl } from "@/lib/site";

/**
 * Structured data Schema.org (JSON-LD). Membantu Google memahami entитas
 * (brand, artikel, produk trip) → kandidat rich result & knowledge panel.
 *
 * Render aman: `<` di dalam data di-escape jadi `<` supaya string di dalam
 * konten (mis. deskripsi) tak bisa memutus tag </script> (XSS).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const abs = (u?: string | null): string | undefined => {
  if (!u || typeof u !== "string" || !u.trim()) return undefined;
  return /^https?:\/\//i.test(u) ? u : absoluteUrl(u);
};

/** Identitas brand — dipasang di beranda. */
export function organizationLd(opts: {
  name: string;
  logo?: string | null;
  sameAs?: string[];
  telephone?: string | null;
}): Record<string, unknown> {
  const logo = abs(opts.logo);
  const sameAs = (opts.sameAs || []).filter((u) => /^https?:\/\//i.test(u));
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: opts.name,
    url: SITE_URL,
    ...(logo ? { logo, image: logo } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(opts.telephone ? { telephone: opts.telephone } : {}),
    areaServed: "ID",
    knowsLanguage: ["id", "en"],
  };
}

export function websiteLd(name: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name,
    url: SITE_URL,
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Artikel blog. */
export function blogPostingLd(opts: {
  title: string;
  description?: string | null;
  image?: string | null;
  path: string;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  authorName?: string | null;
  publisherName: string;
  publisherLogo?: string | null;
}): Record<string, unknown> {
  const url = absoluteUrl(opts.path);
  const image = abs(opts.image);
  const iso = (d?: string | Date | null) => {
    if (!d) return undefined;
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
  };
  const logo = abs(opts.publisherLogo);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: opts.title.slice(0, 110),
    ...(opts.description ? { description: opts.description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(iso(opts.datePublished) ? { datePublished: iso(opts.datePublished) } : {}),
    ...(iso(opts.dateModified) ? { dateModified: iso(opts.dateModified) } : {}),
    author: { "@type": "Organization", name: opts.authorName || opts.publisherName, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: opts.publisherName,
      ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}),
    },
  };
}

/** Paket open trip sebagai Product + Offer. */
export function productLd(opts: {
  name: string;
  description?: string | null;
  image?: string | null;
  path: string;
  price?: number | string | null;
  priceCurrency?: string;
}): Record<string, unknown> {
  const url = absoluteUrl(opts.path);
  const image = abs(opts.image);
  const priceNum = opts.price != null ? Number(opts.price) : NaN;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    ...(image ? { image: [image] } : {}),
    brand: { "@type": "Brand", name: "Agendain" },
    ...(Number.isFinite(priceNum) && priceNum > 0
      ? {
          offers: {
            "@type": "Offer",
            price: String(Math.round(priceNum)),
            priceCurrency: opts.priceCurrency || "IDR",
            availability: "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  };
}
