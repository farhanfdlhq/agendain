import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--color-ink)", marginBottom: "8px" }}>
          Pengaturan Sistem
        </h2>
        <p style={{ color: "var(--color-muted)" }}>Konfigurasi parameter dan identitas website Agendain Anda.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", background: "white", borderRadius: "var(--radius-xl)", border: "1px dashed var(--color-border-strong)" }}>
        <Settings size={48} color="var(--color-muted)" style={{ marginBottom: "16px", opacity: 0.5 }} />
        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "8px" }}>Menu Pengaturan Sedang Dalam Pengembangan</h3>
        <p style={{ color: "var(--color-muted)", textAlign: "center", maxWidth: "500px" }}>
          Fitur pengaturan ini akan segera hadir. Anda nantinya dapat mengubah nama web, logo, kontak WhatsApp, dan metode pembayaran melalui halaman ini.
        </p>
      </div>
    </div>
  )
}
