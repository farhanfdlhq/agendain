import { getSiteSettings } from "@/lib/get-settings"
import LoginForm from "./LoginForm"

// Server component: `site_logo` dibaca di sini dan diteruskan ke form sebagai
// prop, sehingga logo yang benar sudah ada di HTML pertama. Sebelumnya halaman
// ini client component yang mengawali dengan placeholder `/logo_present.webp`
// lalu menukarnya lewat fetch `/api/settings` di useEffect — di production fetch
// itu 0,7–1,9 dtk, jadi placeholder dummy sempat berkedip tiap refresh.
export default async function LoginPage() {
  const settings = await getSiteSettings()

  // Konvensi fallback yang sama dengan Navbar & Footer: "/logo.png" dianggap
  // belum diset. Fallback ke aset brand `/agendain.jpeg`, BUKAN placeholder
  // dummy. Dalam kondisi normal cabang ini tak terpakai karena site_logo terisi.
  const logoUrl =
    settings.site_logo && settings.site_logo !== "/logo.png"
      ? settings.site_logo
      : "/agendain.jpeg"

  return <LoginForm logoUrl={logoUrl} />
}
