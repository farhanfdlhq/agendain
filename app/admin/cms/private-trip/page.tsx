"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Save, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AirplaneLoader from "@/components/ui/airplane-loader";
import { MediaPicker } from "@/components/ui/media-picker";
import { FontWeightPicker } from "@/components/ui/font-weight-picker";
import DynamicIcon, { AVAILABLE_ICONS } from "@/components/DynamicIcon/DynamicIcon";
import { foldLegacyRepeaters, PRIVATE_TRIP_REPEATERS } from "@/lib/i18n/localize";

function BadgeInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl border p-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-blue-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 border rounded-lg">
        {AVAILABLE_ICONS.map(iconName => (
          <button
            key={iconName}
            type="button"
            onClick={() => setInputValue(prev => prev + `[${iconName}] `)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={`Tambah icon ${iconName}`}
          >
            <DynamicIcon name={iconName} size={16} />
          </button>
        ))}
      </div>
      <div className="relative mt-1">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg pr-20"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
          + Tambah
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        Tekan Enter untuk menambahkan badge/chips. Bisa pilih icon di atas.
      </p>
    </div>
  );
}

export default function PrivateTripCMSPage() {
  const [data, setData] = useState<any>({
    heroTitle: "",
    heroTitle_en: "",
    heroTitleWeight: "800",
    heroSubtitle: "",
    heroSubtitle_en: "",
    heroSubtitleWeight: "500",
    heroImage: "",
    packagesTitle: "",
    packagesTitle_en: "",
    packagesTitleWeight: "800",
    packagesSubtitle: "",
    packagesSubtitle_en: "",
    packagesSubtitleWeight: "500",
    ctaTitle: "",
    ctaTitle_en: "",
    ctaTitleWeight: "800",
    ctaSubtitle: "",
    ctaSubtitle_en: "",
    ctaSubtitleWeight: "500",
    ctaBtnText: "",
    ctaBtnText_en: "",
    whyEyebrow: "",
    whyEyebrow_en: "",
    whyTitle: "",
    whyTitle_en: "",
    whyTitleWeight: "800",
    whySubtitle: "",
    whySubtitle_en: "",
    whySubtitleWeight: "500",
    whyItems: [],
    workflowTitle: "",
    workflowTitle_en: "",
    workflowSubtitle: "",
    workflowSubtitle_en: "",
    workflowSteps: [],
    formTitle: "",
    formTitle_en: "",
    formSubtitle: "",
    formSubtitle_en: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  const [isScrolled, setIsScrolled] = useState(false);
  const topHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = topHeaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetching]);

  useEffect(() => {
    fetch("/api/settings/private-trip")
      .then((res) => res.json())
      .then((res) => {
        if (!res.error) {
          // Data lama menyimpan whyItems_en / workflowSteps_en sebagai array
          // terpisah. Teksnya dilipat ke array utama lalu array _en dibuang,
          // sehingga simpanan berikutnya memakai bentuk baru (migrasi lazy).
          foldLegacyRepeaters(res, PRIVATE_TRIP_REPEATERS);
          setData((prev: any) => ({ ...prev, ...res }));
        }
        setFetching(false);
      })
      .catch(() => {
        setFetching(false);
        toast.error("Gagal memuat data");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings/private-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Konten berhasil diperbarui!");
      } else {
        toast.error("Gagal menyimpan.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const renderLivePreview = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*[^*]+\*)/g);
    return (
      <>
        {parts.map((part, idx) => {
          if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
            const innerText = part.slice(1, -1);
            return (
              <span
                key={idx}
                className="inline-block font-extrabold px-1.5 py-0.5 mx-0.5 rounded bg-amber-400/20 text-[#FFC704] border border-[#FFC704]/40 shadow-[0_0_12px_rgba(255,199,4,0.25)] transition-all duration-300 transform scale-[1.02]"
              >
                {innerText}
              </span>
            );
          }
          return (
            <span key={idx} className="text-slate-100">
              {part}
            </span>
          );
        })}
      </>
    );
  };

  const renderImageInput = (
    label: string,
    fieldName: string,
    placeholder = "",
    resolutionHint = "",
  ) => {
    const activeFieldName = fieldName;
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">{label}</Label>
        {resolutionHint && (
          <p className="text-[11px] text-muted-foreground mt-0 mb-2 font-medium italic">
            💡 Resolusi yang disarankan:{" "}
            <span className="font-bold text-slate-700">{resolutionHint}</span>
          </p>
        )}
        <MediaPicker
          value={data[activeFieldName] || ""}
          onChange={(url) =>
            setData((prev: any) => ({ ...prev, [activeFieldName]: url }))
          }
          label="Pilih Gambar"
          description={
            placeholder ? `Disarankan seperti: ${placeholder}` : undefined
          }
        />
      </div>
    );
  };

  const renderTextInput = (
    label: string,
    fieldName: string,
    isTextarea = false,
    placeholder = "",
    enableWeight = false,
    defaultWeight = "400",
  ) => {
    const activeFieldName = activeTab === "en" ? `${fieldName}_en` : fieldName;
    const weightField = `${fieldName}Weight`;
    const selectedWeight = data[weightField]
      ? Number(data[weightField])
      : undefined;
    const isTitleOrHighlight =
      label.includes("*") ||
      label.toLowerCase().includes("kuning") ||
      fieldName.includes("Title") ||
      (data[activeFieldName] && String(data[activeFieldName]).includes("*"));

    return (
      <div className="space-y-3 p-3.5 rounded-xl border border-border/60 bg-muted/10 shadow-xs">
        <div className="space-y-2">
          <Label className="flex items-center justify-between gap-2 text-sm font-semibold">
            <span>{label}</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              {activeTab}
            </span>
          </Label>
          {isTextarea ? (
            <Textarea
              name={activeFieldName}
              value={data[activeFieldName] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              rows={3}
              style={
                enableWeight && selectedWeight
                  ? { fontWeight: selectedWeight }
                  : undefined
              }
            />
          ) : (
            <Input
              type="text"
              name={activeFieldName}
              value={data[activeFieldName] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              style={
                enableWeight && selectedWeight
                  ? { fontWeight: selectedWeight }
                  : undefined
              }
            />
          )}
        </div>

        {isTitleOrHighlight && data[activeFieldName] && (
          <div className="relative mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-between gap-3 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFC704] to-amber-600 rounded-l-lg opacity-80" />
            <div className="flex flex-col gap-1 w-full pl-1">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFC704]/10 text-[#FFC704] border border-[#FFC704]/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFC704] animate-pulse"></span>
                  Live Preview
                </span>
                {!String(data[activeFieldName]).includes("*") && (
                  <span className="text-[11px] text-slate-400 italic">
                    Tips: Apit kata dengan{" "}
                    <code className="text-[#FFC704] bg-slate-900 px-1 py-0.5 rounded font-bold">
                      *bintang*
                    </code>{" "}
                    untuk warna kuning
                  </span>
                )}
              </div>
              <div
                className="text-base font-bold text-slate-100 mt-1 pl-1 pr-2 tracking-tight leading-relaxed break-words"
                style={
                  enableWeight && selectedWeight
                    ? { fontWeight: selectedWeight }
                    : undefined
                }
              >
                {renderLivePreview(String(data[activeFieldName]))}
              </div>
            </div>
          </div>
        )}

        {enableWeight && (
          <div className="pt-2 border-t border-border/40">
            <FontWeightPicker
              value={data[weightField]}
              onChange={(val) =>
                setData((prev: any) => ({ ...prev, [weightField]: val }))
              }
              defaultWeight={defaultWeight}
            />
          </div>
        )}
      </div>
    );
  };

  const renderArrayEditor = (
    fieldKey: string,
    template: any,
    fields: { key: string; label: string; isTextArea?: boolean; isIconPicker?: boolean }[],
  ) => {
    // Satu array untuk kedua bahasa. Ikon dan field bahasa-netral lain hidup di
    // kunci polos; hanya teks yang punya sibling `_en`. Lihat lib/i18n/localize.
    const items = data[fieldKey] || [];
    const textKey = (name: string) => (activeTab === "en" ? `${name}_en` : name);

    const handleAdd = () => {
      setData((prev: any) => ({
        ...prev,
        [fieldKey]: [...items, { ...template }],
      }));
    };

    const handleRemove = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setData((prev: any) => ({ ...prev, [fieldKey]: newItems }));
    };

    const handleChange = (index: number, key: string, val: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [key]: val };
      setData((prev: any) => ({ ...prev, [fieldKey]: newItems }));
    };

    return (
      <div className="space-y-4">
        {activeTab === "en" && (
          <p className="text-[11px] text-muted-foreground italic">
            Ikon dipakai bersama oleh kedua bahasa. Teks yang dibiarkan kosong
            otomatis memakai versi Indonesia.
          </p>
        )}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-xl">
            Belum ada item.
          </div>
        )}
        <div className="grid gap-4">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="p-4 border rounded-xl bg-muted/10 relative shadow-sm space-y-4"
            >
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 h-6 w-6 rounded-full"
                onClick={() => handleRemove(index)}
              >
                &times;
              </Button>
              <h4 className="text-sm font-semibold mb-2">Item #{index + 1}</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div
                    key={f.key}
                    className={
                      f.isTextArea ? "sm:col-span-2 space-y-2" : "space-y-2"
                    }
                  >
                    <Label className="text-xs">{f.label}</Label>
                    {f.isIconPicker ? (
                      <div className="flex flex-col gap-1.5">
                        <Input
                          value={item[f.key] || ""}
                          onChange={(e) => handleChange(index, f.key, e.target.value)}
                          placeholder="misal: Clock, Users..."
                        />
                        <div className="flex flex-wrap gap-1 mt-1 p-1.5 bg-slate-50 border rounded-lg max-h-24 overflow-y-auto">
                          {AVAILABLE_ICONS.map(iconName => (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => handleChange(index, f.key, iconName)}
                              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title={`Pilih icon ${iconName}`}
                            >
                              <DynamicIcon name={iconName} size={14} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : f.isTextArea ? (
                      <Textarea
                        value={item[textKey(f.key)] || ""}
                        onChange={(e) =>
                          handleChange(index, textKey(f.key), e.target.value)
                        }
                        placeholder={activeTab === "en" ? item[f.key] || "" : undefined}
                        rows={3}
                      />
                    ) : (
                      <Input
                        value={item[textKey(f.key)] || ""}
                        onChange={(e) =>
                          handleChange(index, textKey(f.key), e.target.value)
                        }
                        placeholder={activeTab === "en" ? item[f.key] || "" : undefined}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          + Tambah Item
        </Button>
      </div>
    );
  };

  const renderPackageEditor = () => {
    const activeFieldName = "packages"; // No translation for packages yet or we can just use one list.
    const items = data[activeFieldName] || [];

    const handleAddItem = () => {
      const newItem = {
        title: "",
        subtitle: "",
        image: "",
        locationTab: "",
        chips: [],
        features: [],
      };
      setData((prev: any) => ({
        ...prev,
        [activeFieldName]: [...items, newItem],
      }));
    };

    const handleRemoveItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setData((prev: any) => ({ ...prev, [activeFieldName]: newItems }));
    };

    const handleItemChange = (index: number, field: string, val: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: val };
      setData((prev: any) => ({ ...prev, [activeFieldName]: newItems }));
    };

    const handleArrayStringChange = (
      index: number,
      field: string,
      text: string,
    ) => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        [field]: text
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s !== ""),
      };
      setData((prev: any) => ({ ...prev, [activeFieldName]: newItems }));
    };

    return (
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-lg text-primary">
            Manajemen Kartu Paket Private Trip
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
          >
            + Tambah Paket
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-xl">
              Belum ada paket yang ditambahkan.
            </div>
          )}
          <div className="space-y-6">
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-xl bg-muted/10 relative shadow-sm"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 h-6 w-6 rounded-full"
                  onClick={() => handleRemoveItem(index)}
                >
                  &times;
                </Button>
                <h4 className="text-sm font-semibold mb-4">
                  Paket #{index + 1}
                </h4>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Gambar Cover</Label>
                      <MediaPicker
                        value={item.image || ""}
                        onChange={(url) =>
                          handleItemChange(index, "image", url)
                        }
                        label="Pilih Foto/Gambar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Label Lokasi (Kiri Atas)
                      </Label>
                      <Input
                        value={item.locationTab || ""}
                        onChange={(e) =>
                          handleItemChange(index, "locationTab", e.target.value)
                        }
                        placeholder="Contoh: Italy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Teks Badge/Chips</Label>
                      <BadgeInput
                        tags={Array.isArray(item.chips) ? item.chips : []}
                        onChange={(newTags) =>
                          handleItemChange(index, "chips", newTags)
                        }
                        placeholder="Ketik lalu Enter..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col justify-start">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Nama Paket (Kecil Abu-abu)
                      </Label>
                      <Input
                        value={item.subtitle || ""}
                        onChange={(e) =>
                          handleItemChange(index, "subtitle", e.target.value)
                        }
                        placeholder="Contoh: ITALY - PREMIUM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Judul Paket Utama</Label>
                      <Input
                        value={item.title || ""}
                        onChange={(e) =>
                          handleItemChange(index, "title", e.target.value)
                        }
                        placeholder="Contoh: PREMIUM TRIP — Liburan Mewah..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Poin Fitur/Keunggulan (Pisahkan dengan Enter)
                      </Label>
                      <Textarea
                        value={(Array.isArray(item.features)
                          ? item.features
                          : []
                        ).join("\n")}
                        onChange={(e) =>
                          handleArrayStringChange(
                            index,
                            "features",
                            e.target.value,
                          )
                        }
                        className="min-h-[150px]"
                        placeholder="Menginap di Hotel Bintang 4&#10;Private Car eksklusif..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (fetching) {
    return (
      <div className="flex h-full min-h-[500px] w-full items-center justify-center">
        <AirplaneLoader size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div
        ref={topHeaderRef}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            CMS Private Trip
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola teks untuk halaman Private Trip Eropa.
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold rounded-full px-6 shadow-xs cursor-pointer transition-all text-white"
          style={{ color: "#ffffff" }}
        >
          {loading ? (
            <AirplaneLoader size={18} className="mr-2" />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          Simpan Perubahan
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={activeTab === "id" ? "default" : "outline"}
          onClick={() => setActiveTab("id")}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img
            src="/flags/id.png"
            alt="ID"
            width={20}
            height={15}
            className="rounded-xs object-cover"
          />
          Indonesia
        </Button>
        <Button
          type="button"
          variant={activeTab === "en" ? "default" : "outline"}
          onClick={() => setActiveTab("en")}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img
            src="/flags/en.png"
            alt="EN"
            width={20}
            height={15}
            className="rounded-xs object-cover"
          />
          English
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">
              Teks Utama (Hero)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                {renderImageInput(
                  "Gambar Latar Belakang (Hero Image)",
                  "heroImage",
                  "/private_trip_hero.png",
                  "1920x1080 px (Landscape)",
                )}
              </div>
              <div className="space-y-4 flex flex-col justify-start">
                {renderTextInput(
                  "Judul Utama (*Highlight Kuning*)",
                  "heroTitle",
                  false,
                  "Eropa Eksklusif *Sesuai Cara* Kamu",
                  true,
                  "800",
                )}
                {renderTextInput(
                  "Sub-Judul (Deskripsi)",
                  "heroSubtitle",
                  true,
                  "Rancang perjalanan impianmu...",
                  true,
                  "500",
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">
              Teks Bagian "Mengapa Memilih Kami"
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            {renderTextInput(
              "Judul Kecil (Eyebrow)",
              "whyEyebrow",
              false,
              "Kenapa Harus Agendain?",
            )}
            {renderTextInput(
              "Judul Utama (*Highlight Kuning*)",
              "whyTitle",
              false,
              "Eksplorasi Eropa bareng ahlinya, *semua sudut aman terkendali*",
              true,
              "800",
            )}
            {renderTextInput(
              "Deskripsi",
              "whySubtitle",
              true,
              "Mencari teman perjalanan ke Eropa itu mudah...",
              true,
              "500",
            )}
            <div className="space-y-4 border-t pt-4">
              <Label className="text-base font-semibold">
                Daftar Keunggulan
              </Label>
              {renderArrayEditor(
                "whyItems",
                { icon: "🌍", title: "", desc: "" },
                [
                  { key: "icon", label: "Ikon (Lucide)", isIconPicker: true },
                  { key: "title", label: "Judul Keunggulan" },
                  {
                    key: "desc",
                    label: "Deskripsi Keunggulan",
                    isTextArea: true,
                  },
                ],
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">
              Teks Daftar Paket
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            {renderTextInput(
              "Judul Daftar Paket (*Highlight Kuning*)",
              "packagesTitle",
              false,
              "Pilihan *Private Trip* Kami",
              true,
              "800",
            )}
            {renderTextInput(
              "Deskripsi Daftar Paket",
              "packagesSubtitle",
              true,
              "Beragam kelas layanan yang disesuaikan...",
              true,
              "500",
            )}
          </CardContent>
        </Card>

        {renderPackageEditor()}

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">
              Teks Bagian "Cara Booking"
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            {renderTextInput(
              "Judul",
              "workflowTitle",
              false,
              "Cara Booking Private Trip",
            )}
            {renderTextInput(
              "Sub-Judul",
              "workflowSubtitle",
              false,
              "Dari Konsultasi Sampai Berangkat",
            )}
            <div className="space-y-4 border-t pt-4">
              <Label className="text-base font-semibold">
                Langkah-langkah Workflow
              </Label>
              {renderArrayEditor(
                "workflowSteps",
                { title: "", desc: "" },
                [
                  { key: "title", label: "Judul Langkah" },
                  { key: "desc", label: "Deskripsi Langkah", isTextArea: true },
                ],
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg text-primary">
              Banner Promo (Bawah)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            {renderTextInput(
              "Judul Promo (*Highlight Kuning*)",
              "ctaTitle",
              false,
              "Siap *Agendain* Private Trip Kamu?",
              true,
              "800",
            )}
            {renderTextInput(
              "Sub-Judul (Deskripsi)",
              "ctaSubtitle",
              true,
              "Mari diskusikan rencana perjalanan impianmu...",
              true,
              "500",
            )}
            {renderTextInput(
              "Teks Tombol",
              "ctaBtnText",
              false,
              "Hubungi Konsultan Kami",
            )}
          </CardContent>
        </Card>
      </form>

      {/* Apple / macOS-style Frosted Glass Floating Pill Dock */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar ${
          isScrolled
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        {/* Language Segmented Toggle Container */}
        <div className="flex items-center gap-1 bg-black/[0.05] dark:bg-white/[0.08] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("id")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
              activeTab === "id"
                ? "bg-white dark:bg-zinc-800 text-foreground font-bold shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
            }`}
          >
            <img
              src="/flags/id.png"
              alt="ID"
              width={16}
              height={12}
              className="rounded-2xs object-cover shrink-0"
            />
            <span>ID</span>
            <span className="hidden sm:inline">Indonesia</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("en")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer select-none ${
              activeTab === "en"
                ? "bg-white dark:bg-zinc-800 text-foreground font-bold shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
            }`}
          >
            <img
              src="/flags/en.png"
              alt="EN"
              width={16}
              height={12}
              className="rounded-2xs object-cover shrink-0"
            />
            <span>EN</span>
            <span className="hidden sm:inline">English</span>
          </button>
        </div>

        {/* Separator */}
        <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 shrink-0 my-auto hidden sm:block" />

        {/* Action Trigger */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          style={{ color: "#ffffff" }}
        >
          {loading ? (
            <AirplaneLoader
              size={16}
              className="text-white shrink-0 animate-spin"
            />
          ) : (
            <Save size={16} className="shrink-0" />
          )}
          <span>Simpan Perubahan</span>
        </button>
      </div>
    </div>
  );
}
