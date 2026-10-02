/**
 * Daftar isi otomatis untuk dokumen rich text dari CMS (mis. Privacy Policy).
 *
 * Fungsi murni (tanpa DOM) → hasil identik di server & client, jadi daftar isi
 * ikut ter-render di HTML awal tanpa hydration mismatch. Level bagian dipilih
 * otomatis: <h2> bila muncul ≥2 kali, selain itu <h3> (konten lama memakai satu
 * <h2> sebagai judul dokumen lalu <h3> per bagian). Nomor manual di depan judul
 * ("1. ", "2) ") dibuang dan diganti label nomor yang konsisten.
 */
export type DocOutlineItem = { id: string; num: string; title: string }

const HEADING_RE = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi
const LEADING_NUM_RE = /^((?:\s|<[^>]+>)*)\d+[.)]\s*/

const stripTags = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

export function buildDocOutline(html: string): { html: string; items: DocOutlineItem[] } {
  if (!html) return { html, items: [] }

  const h2Count = (html.match(/<h2[\s>]/gi) || []).length
  const level = h2Count >= 2 ? '2' : '3'
  const items: DocOutlineItem[] = []

  const out = html.replace(HEADING_RE, (match, lvl: string, _attrs: string, inner: string) => {
    if (lvl !== level) return match
    const cleanInner = inner.replace(LEADING_NUM_RE, '$1')
    const title = stripTags(cleanInner)
    if (!title) return match
    const num = String(items.length + 1).padStart(2, '0')
    const id = `bagian-${items.length + 1}`
    items.push({ id, num, title })
    // Atribut lama (mis. style) dibuang; id & data-num dari kita.
    return `<h${lvl} id="${id}" data-num="${num}" class="doc-section">${cleanInner}</h${lvl}>`
  })

  return { html: out, items }
}
