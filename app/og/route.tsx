import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

// Butuh fs + sharp + font → runtime Node (bukan edge).
export const runtime = "nodejs";

const CACHE = "public, max-age=86400, stale-while-revalidate=604800";
const ALLOWED = /\.(webp|jpe?g|png|avif)$/i;
const PUBLIC_DIR = path.join(process.cwd(), "public");
const FONT_DIR = path.join(process.cwd(), "assets/og-fonts");
const W = 1200;
const H = 630;
const GOLD = "#F5A623";

// Font di-cache lintas request (server berumur panjang di PM2). Montserrat =
// font situs (lihat app/tokens.css --font-display), jadi kartu share seragam.
let fontsCache: { name: string; data: Buffer; weight: 400 | 600 | 700 }[] | null = null;
async function loadFonts() {
  if (fontsCache) return fontsCache;
  const [bold, semi, reg] = await Promise.all([
    readFile(path.join(FONT_DIR, "Montserrat-Bold.ttf")),
    readFile(path.join(FONT_DIR, "Montserrat-SemiBold.ttf")),
    readFile(path.join(FONT_DIR, "Montserrat-Regular.ttf")),
  ]);
  fontsCache = [
    { name: "Montserrat", data: bold, weight: 700 },
    { name: "Montserrat", data: semi, weight: 600 },
    { name: "Montserrat", data: reg, weight: 400 },
  ];
  return fontsCache;
}

async function fallback(): Promise<Response> {
  const buf = await readFile(path.join(PUBLIC_DIR, "og-image.jpg"));
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": CACHE },
  });
}

type Word = { text: string; gold: boolean };

// Pisah penanda *emas* (sintaks heroTitle CMS) jadi segmen berwarna.
function parseGold(text: string): { text: string; gold: boolean }[] {
  if (text.includes("*")) {
    return text
      .split(/(\*[^*]+\*)/g)
      .filter(Boolean)
      .map((p) =>
        p.startsWith("*") && p.endsWith("*")
          ? { text: p.slice(1, -1), gold: true }
          : { text: p, gold: false },
      );
  }
  return [{ text, gold: false }];
}

function toWords(segs: { text: string; gold: boolean }[]): Word[] {
  const words: Word[] = [];
  for (const s of segs) {
    for (const p of s.text.split(/\s+/)) {
      if (p) words.push({ text: p, gold: s.gold });
    }
  }
  return words;
}

// Bungkus baris manual (satori tak memecah teks di dalam satu flex item) supaya
// bisa mempertahankan kata emas + kontrol jumlah baris.
function wrap(words: Word[], maxChars: number): Word[][] {
  const lines: Word[][] = [[]];
  let len = 0;
  for (const w of words) {
    const cur = lines[lines.length - 1];
    const add = (cur.length ? 1 : 0) + w.text.length;
    if (len + add > maxChars && cur.length) {
      lines.push([w]);
      len = w.text.length;
    } else {
      cur.push(w);
      len += add;
    }
  }
  return lines;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const sp = new URL(request.url).searchParams;
    const src = sp.get("src") || "";
    const title = (sp.get("title") || "").slice(0, 120).trim();
    const subtitle = (sp.get("subtitle") || "").slice(0, 200).trim();

    // Hanya path lokal aman: mulai "/", bukan "//", tanpa "..", ekstensi gambar.
    if (
      !src.startsWith("/") ||
      src.startsWith("//") ||
      src.includes("..") ||
      !ALLOWED.test(src)
    ) {
      return fallback();
    }
    const filePath = path.join(PUBLIC_DIR, src);
    if (!filePath.startsWith(PUBLIC_DIR)) return fallback();

    let input: Buffer;
    try {
      input = await readFile(filePath);
    } catch {
      return fallback();
    }

    const sharp = (await import("sharp")).default;
    const bgJpeg = await sharp(input)
      .resize(W, H, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    // Tanpa teks → kembalikan foto ter-crop apa adanya (cepat, tak perlu font).
    if (!title) {
      return new Response(new Uint8Array(bgJpeg), {
        headers: { "Content-Type": "image/jpeg", "Cache-Control": CACHE },
      });
    }

    const bgDataUri = `data:image/jpeg;base64,${bgJpeg.toString("base64")}`;
    const fonts = await loadFonts();
    const lines = wrap(toWords(parseGold(title)), 26);

    const img = new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: "flex",
            position: "relative",
            fontFamily: "Montserrat",
          }}
        >
          <img
            src={bgDataUri}
            width={W}
            height={H}
            style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }}
          />
          {/* overlay gelap agar teks terbaca (meniru overlay hero) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: W,
              height: H,
              background:
                "linear-gradient(180deg, rgba(4,7,15,0.40) 0%, rgba(4,7,15,0.45) 40%, rgba(4,7,15,0.82) 100%)",
            }}
          />
          {/* konten tengah */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: W,
              height: H,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 90px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {lines.map((line, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "row" }}>
                  {line.map((w, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: 62,
                        fontWeight: 700,
                        color: w.gold ? GOLD : "#ffffff",
                        marginRight: 15,
                        lineHeight: 1.1,
                      }}
                    >
                      {w.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ width: 96, height: 6, background: GOLD, borderRadius: 3, marginTop: 28, marginBottom: 26 }} />

            {subtitle ? (
              <div
                style={{
                  fontSize: 29,
                  fontWeight: 400,
                  color: "#e7ecf4",
                  textAlign: "center",
                  lineHeight: 1.35,
                  maxWidth: 920,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          {/* pil domain */}
          <div
            style={{
              position: "absolute",
              top: 44,
              right: 48,
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.35)",
              fontSize: 24,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            agendain.com
          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: "normal" as const })),
      },
    );

    // ImageResponse menghasilkan PNG (berat utk foto) → kompres ke JPG.
    const png = Buffer.from(await img.arrayBuffer());
    const jpg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(jpg), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": CACHE },
    });
  } catch (e) {
    // Gagal render (mis. font/gambar) → jangan pernah kosongkan preview: jatuh
    // ke kartu brand default. Error dicatat untuk audit.
    console.error("OG_ERROR", e);
    try {
      return await fallback();
    } catch {
      return new Response("og image failed", { status: 500 });
    }
  }
}
