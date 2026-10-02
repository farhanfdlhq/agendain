import { Badge } from "@/components/ui/badge"
import { CHANGELOG, type ChangelogEntry } from "@/lib/changelog"

// Label teks saja (tanpa ikon dekoratif): kata "Baru/Peningkatan/Perbaikan"
// sudah membawa maknanya; warna hanya pembeda kelompok.
const SECTIONS: { key: "added" | "improved" | "fixed"; label: string; tone: string }[] = [
  { key: "added", label: "Baru", tone: "text-emerald-700 dark:text-emerald-400" },
  { key: "improved", label: "Peningkatan", tone: "text-sky-700 dark:text-sky-400" },
  { key: "fixed", label: "Perbaikan", tone: "text-amber-700 dark:text-amber-400" },
]

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

function Release({ entry, isCurrent }: { entry: ChangelogEntry; isCurrent: boolean }) {
  return (
    <li className="group relative pl-8 pb-8 last:pb-0">
      {/* Garis & titik timeline */}
      <span aria-hidden="true" className="absolute left-[6.5px] top-2 bottom-0 w-0.5 rounded-full bg-primary/20 group-last:hidden" />
      <span
        aria-hidden="true"
        // Versi saat ini: navy penuh + cincin gold brand. Versi yang sudah
        // dilewati: navy lembut (bukan putih polos) agar alurnya tetap terbaca.
        className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 ${
          isCurrent
            ? "border-primary bg-primary ring-4 ring-[#FFC704]/40"
            : "border-primary/50 bg-primary/25"
        }`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-lg font-bold tracking-tight text-foreground">v{entry.version}</h4>
        {isCurrent && <Badge className="rounded-full">Versi saat ini</Badge>}
        <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-foreground/80">{entry.title}</p>

      <div className="mt-4 space-y-4">
        {SECTIONS.map(({ key, label, tone }) => {
          const items = entry[key]
          if (!items?.length) return null
          return (
            <div key={key}>
              <p className={`text-xs font-bold uppercase tracking-wider ${tone}`}>{label}</p>
              <ul className="mt-2 space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/60">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </li>
  )
}

/** Riwayat rilis web (sumber: lib/changelog.ts), terbaru di atas. */
export default function ChangelogList() {
  return (
    <ol className="relative">
      {CHANGELOG.map((entry, i) => (
        <Release key={entry.version} entry={entry} isCurrent={i === 0} />
      ))}
    </ol>
  )
}
