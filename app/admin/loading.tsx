import AirplaneLoader from "@/components/ui/airplane-loader"

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[70vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
        <AirplaneLoader size={32} />
      </div>
      <h3 className="text-lg font-bold text-foreground">Memuat Data...</h3>
      <p className="text-muted-foreground text-sm text-center">Tunggu sebentar, kami sedang menyiapkan dashboard untuk Anda.</p>
    </div>
  )
}
