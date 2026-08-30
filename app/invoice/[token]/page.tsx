import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Download, FileText } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { buildInvoiceView } from "@/lib/invoice"

// Invoice tidak boleh terindeks mesin pencari — tautannya rahasia per klien.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Invoice",
}

/** Ambil hanya key yang dibutuhkan kop dokumen. */
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
  return {
    settings,
    siteSettings: { site_name: map.site_name ?? "", site_logo: map.site_logo ?? "" },
  }
}

export default async function InvoicePublikPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { token },
    include: { paymentAccount: true },
  })

  // Draft & batal SENGAJA 404, bukan 403: tautan yang belum siap tidak boleh
  // membocorkan bahwa invoicenya ada.
  if (!invoice || invoice.status === "draft" || invoice.status === "batal") notFound()

  const { settings, siteSettings } = await ambilPengaturan()
  const v = buildInvoiceView({ invoice, akun: invoice.paymentAccount, settings, siteSettings })

  return (
    <main className="min-h-dvh bg-zinc-100 py-6 px-4 print:bg-white print:p-0">
      {/* Aksi — disembunyikan saat dicetak. */}
      <div className="mx-auto mb-4 flex max-w-[820px] flex-wrap justify-end gap-2 print:hidden">
        <a
          href={`/api/invoice/pdf/${token}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          <FileText size={16} /> Lihat PDF
        </a>
        <a
          href={`/api/invoice/pdf/${token}?dl=1`}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Download size={16} /> Unduh PDF
        </a>
      </div>

      <article className="mx-auto max-w-[820px] rounded-2xl bg-white p-8 shadow-sm print:rounded-none print:shadow-none sm:p-12">
        {/* Kop */}
        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {/* Ada logo → nama jadi baris pendamping. Tanpa logo → nama itulah
                identitas utamanya, jadi ditampilkan besar dan tidak diulang. */}
            {v.kop.logo ? (
              <>
                {/* Sengaja <img>, bukan next/image: logo diunggah admin dengan
                    dimensi yang tidak diketahui, dan halaman ini dicetak ke PDF
                    oleh browser — optimizer gambar tidak memberi manfaat di sini. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.kop.logo} alt={v.kop.nama} className="mb-3 h-12 w-auto max-w-[220px] object-contain" />
                <p className="text-sm font-semibold text-zinc-900">{v.kop.nama}</p>
              </>
            ) : (
              <p className="text-xl font-bold text-zinc-900">{v.kop.nama}</p>
            )}
            {v.kop.alamat && <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-zinc-500">{v.kop.alamat}</p>}
            <div className="mt-1 space-y-0.5 text-xs text-zinc-500">
              {v.kop.telepon && <p>{v.kop.telepon}</p>}
              {v.kop.email && <p>{v.kop.email}</p>}
              {v.kop.website && <p>{v.kop.website}</p>}
              {v.kop.npwp && <p>NPWP: {v.kop.npwp}</p>}
            </div>
          </div>

          <div className="shrink-0 sm:text-right">
            <h1 className="text-2xl font-bold tracking-widest text-zinc-900">{v.label.invoice}</h1>
            <p className="mt-1 font-mono text-sm text-zinc-600">{v.meta.nomor}</p>
            <div className="mt-3 space-y-0.5 text-xs text-zinc-600">
              <p><span className="text-zinc-400">{v.label.tanggal}:</span> {v.meta.tanggalFmt}</p>
              {v.meta.adaJatuhTempo && (
                <p><span className="text-zinc-400">{v.label.jatuhTempo}:</span> {v.meta.jatuhTempoFmt}</p>
              )}
            </div>
            {v.meta.lunas && (
              <span className="mt-3 inline-block rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold tracking-wider text-emerald-700">
                {v.label.lunas}
              </span>
            )}
            {v.meta.jatuhTempoTerlewat && (
              <span className="mt-3 inline-block rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-bold tracking-wider text-red-700">
                {v.label.jatuhTempoTerlewat}
              </span>
            )}
          </div>
        </header>

        {/* Ditagihkan kepada */}
        <section className="border-b border-zinc-200 py-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{v.label.ditagihkanKepada}</p>
          <p className="mt-2 text-base font-semibold text-zinc-900">{v.klien.nama}</p>
          {v.klien.alamat && <p className="mt-0.5 whitespace-pre-line text-sm text-zinc-500">{v.klien.alamat}</p>}
          <div className="mt-0.5 text-sm text-zinc-500">
            {v.klien.telepon && <span>{v.klien.telepon}</span>}
            {v.klien.telepon && v.klien.email && <span className="px-1.5">·</span>}
            {v.klien.email && <span>{v.klien.email}</span>}
          </div>
          {v.meta.judul && <p className="mt-3 text-sm font-medium text-zinc-700">{v.meta.judul}</p>}
        </section>

        {/* Rincian */}
        <section className="py-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-zinc-300 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="w-10 py-2 font-semibold">#</th>
                  <th className="py-2 font-semibold">{v.label.deskripsi}</th>
                  <th className="w-16 py-2 text-right font-semibold">{v.label.qty}</th>
                  <th className="w-32 py-2 text-right font-semibold">{v.label.harga}</th>
                  <th className="w-36 py-2 text-right font-semibold">{v.label.jumlah}</th>
                </tr>
              </thead>
              <tbody>
                {v.baris.map(b => (
                  <tr key={b.no} className="border-b border-zinc-100 align-top">
                    <td className="py-3 text-zinc-400">{b.no}</td>
                    <td className="py-3 pr-4 text-zinc-800">{b.deskripsi}</td>
                    <td className="py-3 text-right tabular-nums text-zinc-600">{b.qty}</td>
                    <td className="py-3 text-right tabular-nums text-zinc-600">{b.hargaFmt}</td>
                    <td className="py-3 text-right font-medium tabular-nums text-zinc-900">{b.jumlahFmt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <dl className="w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">{v.label.subtotal}</dt>
                <dd className="tabular-nums text-zinc-800">{v.ringkasan.subtotalFmt}</dd>
              </div>
              {v.ringkasan.adaPajak && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">{v.ringkasan.pajakLabel}</dt>
                  <dd className="tabular-nums text-zinc-800">{v.ringkasan.pajakFmt}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-300 pt-2 text-base font-bold text-zinc-900">
                <dt>{v.label.total}</dt>
                <dd className="tabular-nums">{v.ringkasan.totalFmt}</dd>
              </div>
              {v.ringkasan.padananFmt && (
                <div className="flex justify-between text-xs text-zinc-400">
                  <dt>≈ {v.ringkasan.padananFmt}</dt>
                  <dd>{v.ringkasan.kursFmt}</dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        {/* Rekening & catatan */}
        {(v.rekening || v.catatan) && (
          <section className="grid gap-6 border-t border-zinc-200 pt-6 sm:grid-cols-2">
            {v.rekening && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{v.label.rekening}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">{v.rekening.bank}</p>
                {v.rekening.nomor && <p className="font-mono text-sm text-zinc-700">{v.rekening.nomor}</p>}
                {v.rekening.iban && <p className="font-mono text-xs text-zinc-700">IBAN: {v.rekening.iban}</p>}
                {v.rekening.bicSwift && <p className="font-mono text-xs text-zinc-700">BIC/SWIFT: {v.rekening.bicSwift}</p>}
                {v.rekening.atasNama && (
                  <p className="mt-0.5 text-xs text-zinc-500">{v.label.atasNama} {v.rekening.atasNama}</p>
                )}
              </div>
            )}
            {v.catatan && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{v.label.catatan}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{v.catatan}</p>
              </div>
            )}
          </section>
        )}

        {/* Tanda tangan */}
        {(v.tandaTangan.gambar || v.tandaTangan.nama) && (
          <section className="mt-8 flex justify-end">
            <div className="text-center">
              {v.tandaTangan.gambar && (
                // Alasan sama dengan logo di kop; `alt` kosong karena tanda
                // tangan bersifat dekoratif — namanya sudah tertulis di bawahnya.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.tandaTangan.gambar} alt="" className="mx-auto mb-1 h-16 w-auto object-contain" />
              )}
              {v.tandaTangan.nama && <p className="text-sm font-semibold text-zinc-800">{v.tandaTangan.nama}</p>}
              {v.tandaTangan.jabatan && <p className="text-xs text-zinc-500">{v.tandaTangan.jabatan}</p>}
            </div>
          </section>
        )}
      </article>
    </main>
  )
}
