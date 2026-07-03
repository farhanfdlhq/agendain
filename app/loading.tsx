import AirplaneLoader from "@/components/ui/airplane-loader"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AirplaneLoader size={48} />
      <h3 className="text-xl font-medium" style={{ color: 'var(--color-ink)' }}>Sedang Memuat...</h3>
      <p className="text-sm max-w-md text-center" style={{ color: 'var(--color-ink)', opacity: 0.7 }}>Menyiapkan destinasi dan paket perjalanan terbaik untuk Anda.</p>
    </div>
  )
}
