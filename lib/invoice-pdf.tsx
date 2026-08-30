/**
 * Renderer PDF invoice. HANYA dipakai dari route handler (Node), tidak boleh
 * diimpor komponen client — @react-pdf/renderer bukan untuk browser bundle.
 *
 * Layoutnya mencerminkan halaman HTML publik, tetapi keduanya membaca objek
 * yang SAMA dari `buildInvoiceView`. Jadi walau markup-nya berbeda, angka dan
 * teksnya mustahil berbeda.
 */
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceView } from "./invoice";
import { sumberGambar } from "./pdf-utils";

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 44, fontSize: 9, color: "#3f3f46", lineHeight: 1.5 },
  baris: { flexDirection: "row", justifyContent: "space-between" },
  kop: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#d4d4d8", paddingBottom: 16 },
  kopKiri: { width: "58%" },
  kopKanan: { width: "38%", alignItems: "flex-end" },
  logo: { height: 34, marginBottom: 8, objectFit: "contain" },
  namaPerusahaan: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#18181b" },
  kecil: { fontSize: 8, color: "#71717a" },
  judulInvoice: { fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 2, color: "#18181b", lineHeight: 1.2 },
  nomor: { fontSize: 9, color: "#52525b", marginTop: 4 },
  cap: { marginTop: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 10, fontSize: 8, fontFamily: "Helvetica-Bold" },
  capLunas: { borderColor: "#6ee7b7", color: "#047857", backgroundColor: "#ecfdf5" },
  capTempo: { borderColor: "#fca5a5", color: "#b91c1c", backgroundColor: "#fef2f2" },
  seksi: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e4e4e7" },
  labelSeksi: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: "#a1a1aa", textTransform: "uppercase" },
  namaKlien: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#18181b", marginTop: 5 },
  thBaris: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#a1a1aa", paddingBottom: 5, marginTop: 16 },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 0.6, color: "#71717a", textTransform: "uppercase" },
  tdBaris: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f4f4f5", paddingVertical: 7 },
  cNo: { width: "6%" }, cDesk: { width: "48%", paddingRight: 8 },
  cQty: { width: "10%", textAlign: "right" }, cHarga: { width: "18%", textAlign: "right" },
  cJml: { width: "18%", textAlign: "right" },
  ringkasan: { marginTop: 14, alignSelf: "flex-end", width: "48%" },
  barisRingkas: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalBaris: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#a1a1aa", paddingTop: 5, marginTop: 4 },
  totalTeks: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#18181b" },
  bawah: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e4e4e7" },
  kolomBawah: { width: "48%" },
  mono: { fontFamily: "Courier", fontSize: 9, color: "#3f3f46" },
  ttd: { marginTop: 26, alignItems: "flex-end" },
  gambarTtd: { height: 46, marginBottom: 3, objectFit: "contain" },
});

export function InvoicePdf({ v }: { v: InvoiceView }) {
  const logo = sumberGambar(v.kop.logo);
  const ttd = sumberGambar(v.tandaTangan.gambar);

  return (
    <Document title={`Invoice ${v.meta.nomor}`} author={v.kop.nama}>
      <Page size="A4" style={s.page}>
        <View style={s.kop}>
          <View style={s.kopKiri}>
            {/* `Image` di sini milik @react-pdf/renderer, bukan <img> HTML —
                ia tidak punya prop `alt`, jadi aturan alt-text tak berlaku. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logo ? <Image src={logo} style={s.logo} /> : null}
            <Text style={s.namaPerusahaan}>{v.kop.nama}</Text>
            {v.kop.alamat ? <Text style={s.kecil}>{v.kop.alamat}</Text> : null}
            {v.kop.telepon ? <Text style={s.kecil}>{v.kop.telepon}</Text> : null}
            {v.kop.email ? <Text style={s.kecil}>{v.kop.email}</Text> : null}
            {v.kop.website ? <Text style={s.kecil}>{v.kop.website}</Text> : null}
            {v.kop.npwp ? <Text style={s.kecil}>NPWP: {v.kop.npwp}</Text> : null}
          </View>

          <View style={s.kopKanan}>
            <Text style={s.judulInvoice}>{v.label.invoice}</Text>
            <Text style={s.nomor}>{v.meta.nomor}</Text>
            <Text style={[s.kecil, { marginTop: 6 }]}>{v.label.tanggal}: {v.meta.tanggalFmt}</Text>
            {v.meta.adaJatuhTempo ? (
              <Text style={s.kecil}>{v.label.jatuhTempo}: {v.meta.jatuhTempoFmt}</Text>
            ) : null}
            {v.meta.lunas ? <Text style={[s.cap, s.capLunas]}>{v.label.lunas}</Text> : null}
            {v.meta.jatuhTempoTerlewat ? (
              <Text style={[s.cap, s.capTempo]}>{v.label.jatuhTempoTerlewat}</Text>
            ) : null}
          </View>
        </View>

        <View style={s.seksi}>
          <Text style={s.labelSeksi}>{v.label.ditagihkanKepada}</Text>
          <Text style={s.namaKlien}>{v.klien.nama}</Text>
          {v.klien.alamat ? <Text style={s.kecil}>{v.klien.alamat}</Text> : null}
          {v.klien.telepon || v.klien.email ? (
            <Text style={s.kecil}>
              {[v.klien.telepon, v.klien.email].filter(Boolean).join("  ·  ")}
            </Text>
          ) : null}
          {v.meta.judul ? (
            <Text style={{ marginTop: 8, fontFamily: "Helvetica-Bold", color: "#3f3f46" }}>{v.meta.judul}</Text>
          ) : null}
        </View>

        <View style={s.thBaris}>
          <Text style={[s.th, s.cNo]}>#</Text>
          <Text style={[s.th, s.cDesk]}>{v.label.deskripsi}</Text>
          <Text style={[s.th, s.cQty]}>{v.label.qty}</Text>
          <Text style={[s.th, s.cHarga]}>{v.label.harga}</Text>
          <Text style={[s.th, s.cJml]}>{v.label.jumlah}</Text>
        </View>

        {v.baris.map(b => (
          <View key={b.no} style={s.tdBaris} wrap={false}>
            <Text style={[s.cNo, { color: "#a1a1aa" }]}>{b.no}</Text>
            <Text style={s.cDesk}>{b.deskripsi}</Text>
            <Text style={s.cQty}>{b.qty}</Text>
            <Text style={s.cHarga}>{b.hargaFmt}</Text>
            <Text style={[s.cJml, { fontFamily: "Helvetica-Bold", color: "#18181b" }]}>{b.jumlahFmt}</Text>
          </View>
        ))}

        <View style={s.ringkasan}>
          <View style={s.barisRingkas}>
            <Text style={{ color: "#71717a" }}>{v.label.subtotal}</Text>
            <Text>{v.ringkasan.subtotalFmt}</Text>
          </View>
          {v.ringkasan.adaPajak ? (
            <View style={s.barisRingkas}>
              <Text style={{ color: "#71717a" }}>{v.ringkasan.pajakLabel}</Text>
              <Text>{v.ringkasan.pajakFmt}</Text>
            </View>
          ) : null}
          <View style={s.totalBaris}>
            <Text style={s.totalTeks}>{v.label.total}</Text>
            <Text style={s.totalTeks}>{v.ringkasan.totalFmt}</Text>
          </View>
          {v.ringkasan.padananFmt ? (
            <View style={[s.barisRingkas, { marginTop: 3 }]}>
              {/* Prefix tilde, bukan simbol "kira-kira" U+2248 — yang tidak ada
                  di Helvetica bawaan @react-pdf sehingga dirender jadi glyph
                  salah ("H"). Tilde U+007E glyph Latin dasar, aman di semua font.
                  Halaman HTML tetap memakai simbol kira-kira karena browser bisa. */}
              <Text style={[s.kecil, { color: "#a1a1aa" }]}>~ {v.ringkasan.padananFmt}</Text>
              <Text style={[s.kecil, { color: "#a1a1aa" }]}>{v.ringkasan.kursFmt}</Text>
            </View>
          ) : null}
        </View>

        {v.rekening || v.catatan ? (
          <View style={s.bawah}>
            <View style={s.kolomBawah}>
              {v.rekening ? (
                <>
                  <Text style={s.labelSeksi}>{v.label.rekening}</Text>
                  <Text style={{ marginTop: 5, fontFamily: "Helvetica-Bold", color: "#18181b" }}>{v.rekening.bank}</Text>
                  {v.rekening.nomor ? <Text style={s.mono}>{v.rekening.nomor}</Text> : null}
                  {v.rekening.iban ? <Text style={s.mono}>IBAN: {v.rekening.iban}</Text> : null}
                  {v.rekening.bicSwift ? <Text style={s.mono}>BIC/SWIFT: {v.rekening.bicSwift}</Text> : null}
                  {v.rekening.atasNama ? (
                    <Text style={s.kecil}>{v.label.atasNama} {v.rekening.atasNama}</Text>
                  ) : null}
                </>
              ) : null}
            </View>
            <View style={s.kolomBawah}>
              {v.catatan ? (
                <>
                  <Text style={s.labelSeksi}>{v.label.catatan}</Text>
                  <Text style={[s.kecil, { marginTop: 5 }]}>{v.catatan}</Text>
                </>
              ) : null}
            </View>
          </View>
        ) : null}

        {ttd || v.tandaTangan.nama ? (
          <View style={s.ttd}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {ttd ? <Image src={ttd} style={s.gambarTtd} /> : null}
            {v.tandaTangan.nama ? (
              <Text style={{ fontFamily: "Helvetica-Bold", color: "#18181b" }}>{v.tandaTangan.nama}</Text>
            ) : null}
            {v.tandaTangan.jabatan ? <Text style={s.kecil}>{v.tandaTangan.jabatan}</Text> : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
