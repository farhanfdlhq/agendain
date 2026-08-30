/**
 * Renderer PDF itinerary. HANYA dari route handler (Node). Mengonsumsi objek
 * yang SAMA dari `buildItineraryView` seperti halaman HTML publik, jadi isinya
 * mustahil berbeda. Karakter dijaga ASCII/Latin-1 (pelajaran invoice: simbol
 * di luar WinAnsi jadi glyph salah di Helvetica @react-pdf).
 */
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { ItineraryView } from "./itinerary";
import { sumberGambar } from "./pdf-utils";

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 44, fontSize: 9, color: "#3f3f46", lineHeight: 1.5 },
  kop: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#d4d4d8", paddingBottom: 16 },
  kopKiri: { width: "58%" },
  kopKanan: { width: "40%", alignItems: "flex-end" },
  logo: { height: 34, marginBottom: 8, objectFit: "contain" },
  namaPerusahaan: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#18181b" },
  kecil: { fontSize: 8, color: "#71717a" },
  judulDok: { fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 2, color: "#18181b", lineHeight: 1.2 },
  labelSeksi: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: "#a1a1aa", textTransform: "uppercase" },
  namaKlien: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#18181b", marginTop: 4 },
  judulItinerary: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#18181b", marginTop: 16 },
  hariHead: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#a1a1aa", paddingBottom: 4, marginTop: 14 },
  hariLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#18181b" },
  aktivitas: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f4f4f5", paddingVertical: 6 },
  cJam: { width: "22%" },
  cIsi: { width: "58%", paddingRight: 8 },
  cGambar: { width: "20%", alignItems: "flex-end" },
  jamTeks: { fontFamily: "Helvetica-Bold", color: "#3f3f46" },
  gambar: { width: 70, height: 44, borderRadius: 4, objectFit: "cover" },
  catatan: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#e4e4e7" },
});

export function ItineraryPdf({ v }: { v: ItineraryView }) {
  const logo = sumberGambar(v.kop.logo);

  return (
    <Document title={v.meta.judul} author={v.kop.nama}>
      <Page size="A4" style={s.page}>
        <View style={s.kop}>
          <View style={s.kopKiri}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logo ? <Image src={logo} style={s.logo} /> : null}
            <Text style={s.namaPerusahaan}>{v.kop.nama}</Text>
            {v.kop.alamat ? <Text style={s.kecil}>{v.kop.alamat}</Text> : null}
            {v.kop.telepon ? <Text style={s.kecil}>{v.kop.telepon}</Text> : null}
            {v.kop.email ? <Text style={s.kecil}>{v.kop.email}</Text> : null}
            {v.kop.website ? <Text style={s.kecil}>{v.kop.website}</Text> : null}
          </View>

          <View style={s.kopKanan}>
            <Text style={s.judulDok}>{v.label.itinerary}</Text>
            {v.meta.tanggalFmt ? <Text style={[s.kecil, { marginTop: 6 }]}>{v.label.tanggal}: {v.meta.tanggalFmt}</Text> : null}
            <Text style={[s.labelSeksi, { marginTop: 10 }]}>{v.label.madeFor}</Text>
            <Text style={s.namaKlien}>{v.madeFor.nama}</Text>
            {v.madeFor.negara ? <Text style={s.kecil}>{v.madeFor.negara}</Text> : null}
            {v.madeFor.telepon ? <Text style={s.kecil}>{v.madeFor.telepon}</Text> : null}
            {v.madeFor.email ? <Text style={s.kecil}>{v.madeFor.email}</Text> : null}
          </View>
        </View>

        <Text style={s.judulItinerary}>{v.meta.judul}</Text>

        {v.hari.map((h, hi) => (
          <View key={hi} wrap={false}>
            <View style={s.hariHead}>
              <Text style={s.hariLabel}>{h.label}</Text>
              <Text style={s.kecil}>{v.label.totalDurasi}: {h.totalFmt}</Text>
            </View>
            {h.items.map((it, i) => (
              <View key={i} style={s.aktivitas}>
                <View style={s.cJam}>
                  {it.jamFmt ? <Text style={s.jamTeks}>{it.jamFmt}</Text> : null}
                  {it.durasiFmt ? <Text style={[s.kecil, { color: "#a1a1aa" }]}>{it.durasiFmt}</Text> : null}
                </View>
                <View style={s.cIsi}>
                  {it.lokasi ? <Text>{it.lokasi}</Text> : null}
                  {it.catatan ? <Text style={[s.kecil, { fontStyle: "italic" }]}>{it.catatan}</Text> : null}
                </View>
                <View style={s.cGambar}>
                  {(() => {
                    const g = sumberGambar(it.gambar);
                    // eslint-disable-next-line jsx-a11y/alt-text
                    return g ? <Image src={g} style={s.gambar} /> : null;
                  })()}
                </View>
              </View>
            ))}
          </View>
        ))}

        {v.catatan ? (
          <View style={s.catatan}>
            <Text style={s.labelSeksi}>{v.label.catatan}</Text>
            <Text style={[s.kecil, { marginTop: 5 }]}>{v.catatan}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
