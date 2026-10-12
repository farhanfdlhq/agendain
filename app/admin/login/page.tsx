import { getSiteSettings } from "@/lib/get-settings"
import LoginForm from "./LoginForm"
import { siteLogoOr } from "@/lib/site-logo"

// Server component: `site_logo` dibaca di sini dan diteruskan ke form sebagai
// prop, sehingga logo yang benar sudah ada di HTML pertama. Sebelumnya halaman
// ini client component yang mengawali dengan placeholder `/logo_present.webp`
// lalu menukarnya lewat fetch `/api/settings` di useEffect — di production fetch
// itu 0,7–1,9 dtk, jadi placeholder dummy sempat berkedip tiap refresh.
export default async function LoginPage() {
  const settings = await getSiteSettings()

  // "/logo.png"/kosong dianggap belum diset → logo cadangan versi putih
  // (lib/site-logo.ts), sama dengan Navbar & Footer.
  const logoUrl = siteLogoOr(settings.site_logo)

  return <LoginForm logoUrl={logoUrl} />
}
