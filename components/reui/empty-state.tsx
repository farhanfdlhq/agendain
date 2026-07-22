import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Belum Ada Data",
  description = "Saat ini belum ada data yang dapat ditampilkan di tabel ini.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 border border-border/40 bg-card rounded-2xl shadow-sm text-center col-span-full">
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon || <FileSearch size={32} strokeWidth={1.5} />}
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm mt-2 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
