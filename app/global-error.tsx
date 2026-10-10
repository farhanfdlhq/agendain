"use client"

// Batas error terakhir: aktif bila root layout sendiri gagal (mis. DB mati saat
// getSettings), jadi menggantikan seluruh <html>. Tidak bisa mengandalkan CSS
// global/token/font — gaya ditulis inline. Desainnya sama dengan
// public/error-page.html (yang disajikan nginx saat aplikasi mati total).

import { useEffect } from "react"

const css = `
  *{box-sizing:border-box;margin:0}
  html,body{height:100%}
  body{min-height:100%;display:flex;flex-direction:column;background:#032f48;
    background-image:radial-gradient(120% 80% at 50% 0%,#054569 0%,#032f48 70%);color:#fff;
    font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
  .ge-head{padding:28px 24px 0;display:flex;justify-content:center}
  .ge-head img{height:34px;width:auto}
  .ge-main{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
    padding:48px 24px 64px;max-width:560px;margin:0 auto}
  .ge-rule{width:56px;height:3px;border-radius:9999px;background:#FFC704;margin-bottom:28px}
  .ge-main h1{font-size:clamp(2rem,6vw,2.75rem);line-height:1.12;font-weight:800;letter-spacing:-.02em;text-wrap:balance}
  .ge-main h1 em{font-style:normal;color:#FFC704}
  .ge-lead{margin-top:16px;font-size:1.0625rem;line-height:1.6;color:rgba(255,255,255,.82);text-wrap:balance}
  .ge-actions{margin-top:32px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
  .ge-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 26px;border-radius:9999px;
    font:inherit;font-weight:700;font-size:1rem;text-decoration:none;cursor:pointer;transition:background-color .15s,border-color .15s}
  .ge-primary{background:#FFC704;color:#032f48;border:0}
  .ge-primary:hover{background:#e6b300}
  .ge-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35)}
  .ge-ghost:hover{border-color:#fff}
  .ge-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
  .ge-digest{margin-top:20px;font-size:.75rem;color:rgba(255,255,255,.45);font-variant-numeric:tabular-nums}
  .ge-en{margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12);font-size:.875rem;line-height:1.5;color:rgba(255,255,255,.55)}
`

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error("Global Error:", error)
  }, [error])

  return (
    <html lang="id">
      <head>
        <title>Sebentar ya | Agendain</title>
        <meta name="robots" content="noindex" />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <header className="ge-head">
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image butuh layout yang sedang gagal */}
          <img src="/Logo%20(%20White%20Version%20).png" alt="agendain.id" width={157} height={34} />
        </header>
        <main className="ge-main">
          <div className="ge-rule" aria-hidden="true" />
          <h1>Halaman ini lagi <em>istirahat sebentar</em></h1>
          <p className="ge-lead">
            Ada gangguan di sistem kami saat memuat halaman. Coba lagi sebentar; bila masih terjadi, kembali ke Beranda.
          </p>
          <div className="ge-actions">
            <button type="button" className="ge-btn ge-primary" onClick={() => retry()}>
              Coba lagi
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- sengaja full reload; root layout sedang gagal */}
            <a className="ge-btn ge-ghost" href="/">Ke Beranda</a>
          </div>
          {error.digest && <p className="ge-digest">Kode: {error.digest}</p>}
          <p className="ge-en" lang="en">
            Something went wrong while loading this page. Please try again in a moment.
          </p>
        </main>
      </body>
    </html>
  )
}
