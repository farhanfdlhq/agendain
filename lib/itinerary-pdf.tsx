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
  rute: { fontSize: 9, color: "#71717a", marginTop: 2, marginBottom: 2 },
  hariHead: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#a1a1aa", paddingBottom: 4, marginTop: 14 },
  hariLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#18181b" },
  // Baris header kolom tabel (Time | Activity | Location | Transport | City).
  kolHead: { flexDirection: "row", backgroundColor: "#f4f4f5", paddingVertical: 4, paddingHorizontal: 2, marginTop: 4 },
  kolHeadTeks: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 0.5, color: "#52525b", textTransform: "uppercase" },
  aktivitas: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f4f4f5", paddingVertical: 5, paddingHorizontal: 2 },
  cTime: { width: "15%", paddingRight: 4 },
  cAkt: { width: "24%", paddingRight: 4 },
  cLok: { width: "31%", paddingRight: 4 },
  cTrans: { width: "15%", paddingRight: 4 },
  cKota: { width: "15%" },
  jamTeks: { fontFamily: "Helvetica-Bold", color: "#3f3f46", fontSize: 8 },
  aktTeks: { fontFamily: "Helvetica-Bold", color: "#18181b" },
  gambar: { width: "100%", height: 42, borderRadius: 4, objectFit: "cover", marginTop: 4 },
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
        {v.meta.rute ? <Text style={s.rute}>{v.meta.rute}</Text> : null}

        {v.hari.map((h, hi) => (
          <View key={hi} wrap={false}>
            <View style={s.hariHead}>
              <Text style={s.hariLabel}>{h.label}{h.kota ? ` — ${h.kota}` : ""}</Text>
              <Text style={s.kecil}>{v.label.totalDurasi}: {h.totalFmt}</Text>
            </View>
            {/* Header kolom seperti contoh: Time | Activity | Location | Transport | City */}
            <View style={s.kolHead}>
              <Text style={[s.kolHeadTeks, s.cTime]}>{v.label.waktu}</Text>
              <Text style={[s.kolHeadTeks, s.cAkt]}>{v.label.aktivitas}</Text>
              <Text style={[s.kolHeadTeks, s.cLok]}>{v.label.lokasi}</Text>
              <Text style={[s.kolHeadTeks, s.cTrans]}>{v.label.transport}</Text>
              <Text style={[s.kolHeadTeks, s.cKota]}>{v.label.kota}</Text>
            </View>
            {h.items.map((it, i) => (
              <View key={i} style={s.aktivitas}>
                <View style={s.cTime}>
                  {it.jamFmt ? <Text style={s.jamTeks}>{it.jamFmt}</Text> : null}
                  {it.durasiFmt ? <Text style={[s.kecil, { color: "#a1a1aa" }]}>{it.durasiFmt}</Text> : null}
                </View>
                <View style={s.cAkt}>
                  {it.aktivitas ? <Text style={s.aktTeks}>{it.aktivitas}</Text> : null}
                </View>
                <View style={s.cLok}>
                  {it.lokasi ? <Text>{it.lokasi}</Text> : null}
                  {it.catatan ? <Text style={[s.kecil, { fontStyle: "italic" }]}>{it.catatan}</Text> : null}
                  {(() => {
                    const g = sumberGambar(it.gambar);
                    // eslint-disable-next-line jsx-a11y/alt-text
                    return g ? <Image src={g} style={s.gambar} /> : null;
                  })()}
                </View>
                <View style={s.cTrans}>
                  {it.transport ? <Text>{it.transport}</Text> : null}
                </View>
                <View style={s.cKota}>
                  {it.kota ? <Text style={s.kecil}>{it.kota}</Text> : null}
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
