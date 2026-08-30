import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Download, FileText } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { buildItineraryView } from "@/lib/itinerary"
import "./print.css"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const it = await prisma.itinerary.findUnique({ where: { token }, select: { judul: true, status: true } })
  const site = await prisma.setting.findUnique({ where: { key: "site_name" } })
  const siteName = site?.value || "Agendain"
  const tampil = it && it.status === "published" ? it.judul : null
  return {
    robots: { index: false, follow: false },
    title: tampil ? `${tampil} — ${siteName}` : "Itinerary",
  }
}

async function ambilPengaturan() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ["invoice_settings", "site_name", "site_logo"] } },
  })
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  let settings: Record<string, unknown> = {}
  try {
    settings = map.invoice_settings ? JSON.parse(map.invoice_settings) : {}
  } catch {
    settings = {}
  }
  return { settings, siteSettings: { site_name: map.site_name ?? "", site_logo: map.site_logo ?? "" } }
}

export default async function ItineraryPublikPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const itinerary = await prisma.itinerary.findUnique({ where: { token } })

  // Hanya yang published bisa dibuka; draft & archived → notFound (tak bocorkan isi).
  if (!itinerary || itinerary.status !== "published") notFound()

  const { settings, siteSettings } = await ambilPengaturan()
  const v = buildItineraryView({ itinerary, settings, siteSettings })

  return (
    <main className="itinerary-shell min-h-dvh bg-zinc-100 py-6 px-4">
      <div className="itinerary-aksi mx-auto mb-4 flex max-w-[880px] flex-wrap justify-end gap-2">
        <a href={`/api/itinerary/pdf/${token}`} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50">
          <FileText size={16} /> Lihat PDF
        </a>
        <a href={`/api/itinerary/pdf/${token}?dl=1`}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Download size={16} /> Unduh PDF
        </a>
      </div>

      <article className="itinerary-doc mx-auto max-w-[880px] rounded-2xl bg-white p-8 shadow-sm sm:p-12">
        {/* Kop */}
        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {v.kop.logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.kop.logo} alt={v.kop.nama} className="mb-3 h-12 w-auto max-w-[220px] object-contain" />
                <p className="text-sm font-semibold text-zinc-900">{v.kop.nama}</p>
              </>
            ) : (
              <p className="text-xl font-bold text-zinc-900">{v.kop.nama}</p>
            )}
            {v.kop.alamat && <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-zinc-500">{v.kop.alamat}</p>}
            <div className="mt-1 space-y-0.5 text-xs text-zinc-500">
              {v.kop.telepon && <p>{v.kop.teleponHref ? <a href={v.kop.teleponHref} className="hover:text-zinc-700 hover:underline">{v.kop.telepon}</a> : v.kop.telepon}</p>}
              {v.kop.email && <p>{v.kop.emailHref ? <a href={v.kop.emailHref} className="hover:text-zinc-700 hover:underline">{v.kop.email}</a> : v.kop.email}</p>}
              {v.kop.website && <p>{v.kop.websiteHref ? <a href={v.kop.websiteHref} target="_blank" rel="noreferrer noopener" className="hover:text-zinc-700 hover:underline">{v.kop.website}</a> : v.kop.website}</p>}
            </div>
          </div>

          <div className="shrink-0 sm:text-right">
            <h1 className="text-2xl font-bold tracking-widest text-zinc-900">{v.label.itinerary}</h1>
            {v.meta.tanggalFmt && (
              <p className="mt-2 text-xs text-zinc-600"><span className="text-zinc-400">{v.label.tanggal}:</span> {v.meta.tanggalFmt}</p>
            )}
            <div className="mt-3 sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{v.label.madeFor}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">{v.madeFor.nama}</p>
              {v.madeFor.negara && <p className="text-xs text-zinc-500">{v.madeFor.negara}</p>}
              {v.madeFor.telepon && <p className="text-xs text-zinc-500">{v.madeFor.telepon}</p>}
              {v.madeFor.email && <p className="text-xs text-zinc-500">{v.madeFor.email}</p>}
            </div>
          </div>
        </header>

        {/* Judul dokumen */}
        <h2 className="mt-6 text-lg font-bold text-zinc-900">{v.meta.judul}</h2>

        {/* Hari-hari */}
        <div className="mt-4 space-y-8">
          {v.hari.map((h, i) => (
            <section key={i} className="itinerary-hari">
              <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                <h3 className="text-sm font-bold text-zinc-900">{h.label}</h3>
                <span className="text-xs text-zinc-500">{v.label.totalDurasi}: {h.totalFmt}</span>
              </div>
              <div className="mt-2 divide-y divide-zinc-100">
                {h.items.map((it) => (
                  <div key={it.no} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start">
                    <div className="w-40 shrink-0">
                      {it.jamFmt && <p className="text-sm font-medium text-zinc-800">{it.jamFmt}</p>}
                      {it.durasiFmt && <p className="text-xs text-zinc-400">{it.durasiFmt}</p>}
                    </div>
                    <div className="min-w-0 flex-1">
                      {it.lokasi && <p className="text-sm text-zinc-800">{it.lokasi}</p>}
                      {it.catatan && <p className="text-xs italic text-zinc-500">{it.catatan}</p>}
                    </div>
                    {it.gambar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.gambar} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                    )}
                  </div>
                ))}
                {h.items.length === 0 && <p className="py-3 text-sm text-zinc-400">—</p>}
              </div>
            </section>
          ))}
        </div>

        {v.catatan && (
          <section className="itinerary-catatan mt-8 border-t border-zinc-200 pt-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{v.label.catatan}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{v.catatan}</p>
          </section>
        )}
      </article>
    </main>
  )
}
