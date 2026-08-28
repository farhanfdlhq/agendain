"use client";

import { useState, useEffect, useMemo, useDeferredValue } from "react";
import { EmptyState } from "@/components/reui/empty-state";
import { AdminHeader } from "@/components/reui/admin-header";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  WifiOff,
  AlertCircle,
  RefreshCw,
  PackageX,
} from "lucide-react";
import { formatIDR } from "@/lib/currency";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/Providers/ConfirmProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AirplaneLoader from "@/components/ui/airplane-loader";
import { PageSizeSelect } from "@/components/ui/page-size-select";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/lib/use-table-pagination";

// Dipetakan per status, bukan ternary "published atau bukan". Dengan ternary,
// status apa pun selain `published` — termasuk `archived` dan nilai kosong —
// sama-sama tampil amber seolah Draft.
const STATUS_TRIGGER_CLASS: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  draft: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  archived: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
  unknown: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
};

export default function AdminPaketPage() {
  const { confirm } = useConfirm();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    fetchPackages();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/open-trip");
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      } else {
        setError("Gagal memuat data dari server.");
      }
    } catch (error) {
      console.error("Failed to fetch packages", error);
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (slug: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/open-trip/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status berhasil diperbarui");
        fetchPackages();
      } else {
        toast.error("Gagal memperbarui status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem");
    }
  };

  const handleDelete = async (slug: string) => {
    const ok = await confirm({
      title: "Hapus paket",
      message: "Paket ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Ya, hapus",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/open-trip/${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Paket berhasil dihapus");
        fetchPackages();
      } else {
        toast.error("Gagal menghapus paket");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan server");
    }
  };

  const filteredPackages = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase();
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.nama.toLowerCase().includes(searchLower) ||
        (pkg.destinasi?.nama?.toLowerCase() || "").includes(searchLower);
      const matchesStatus =
        statusFilter === "all" || pkg.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [packages, deferredSearch, statusFilter]);

  const pagination = useTablePagination(filteredPackages);
  const { pageItems, startIndex, setPage } = pagination;

  // Balik ke halaman 1 saat pencarian atau filter status berubah.
  useEffect(() => { setPage(1); }, [deferredSearch, statusFilter, setPage]);

  const showPagination = !loading && !error && !isOffline && filteredPackages.length > 0;

  const formatPrice = (price: any) => {
    return formatIDR(Number(price));
  };

  const renderState = () => {
    if (isOffline) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-64 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <WifiOff className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium">Anda Sedang Offline</h3>
              <p className="text-sm text-muted-foreground">
                Koneksi internet terputus. Silakan periksa jaringan Anda lalu
                coba lagi.
              </p>
              <Button
                onClick={fetchPackages}
                variant="outline"
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Coba Ulang
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-64 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium">Terjadi Kesalahan</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                onClick={fetchPackages}
                variant="outline"
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-64 text-center">
            <div className="flex w-full items-center justify-center">
              <AirplaneLoader size={32} className="text-primary" />
              <span className="ml-2 text-muted-foreground">Memuat data...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredPackages.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="p-4">
            <EmptyState
              icon={<PackageX size={32} strokeWidth={1.5} />}
              title="Tidak Ada Paket Ditemukan"
              description="Belum ada paket wisata yang ditambahkan atau paket yang dicari tidak ada."
            />
          </TableCell>
        </TableRow>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <AdminHeader
        title="Manajemen Paket"
        description="Kelola semua paket wisata perjalanan Anda."
        action={
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 font-semibold rounded-full px-6 whitespace-nowrap"
            style={{ color: "#ffffff" }}
          >
            <Link href="/admin/open-trip/baru" style={{ color: "#ffffff" }}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Paket Baru
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama paket atau destinasi..."
                className="pl-9 rounded-full bg-white dark:bg-zinc-900 border-zinc-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-full bg-white dark:bg-zinc-900 border-zinc-200">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  {/* Tanpa opsi ini, paket archived tidak bisa ditemukan
                      lewat filter mana pun selain "Semua Status". */}
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <PageSizeSelect value={pagination.pageSize} onValueChange={pagination.setPageSize} />
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-foreground w-12">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-foreground min-w-[200px]">
                    Nama Paket
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Destinasi
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Durasi
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Harga
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground text-right min-w-[120px]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderState() ||
                  pageItems.map((pkg, i) => (
                    <TableRow
                      key={pkg.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-muted-foreground tabular-nums">
                        {startIndex + i + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <div className="line-clamp-2">{pkg.nama}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-normal bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/50"
                        >
                          {pkg.destinasi.nama}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pkg.durasi} Hari
                      </TableCell>
                      <TableCell className="font-medium text-primary whitespace-nowrap">
                        {formatPrice(pkg.harga)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={pkg.status}
                          onValueChange={(val) =>
                            handleStatusChange(pkg.slug, val)
                          }
                        >
                          <SelectTrigger
                            className={`h-8 w-[110px] text-xs font-medium border ${STATUS_TRIGGER_CLASS[pkg.status] ?? STATUS_TRIGGER_CLASS.unknown}`}
                          >
                            {/* placeholder wajib: tanpa ini, status yang tidak
                                punya SelectItem yang cocok membuat trigger
                                tampil KOSONG tanpa petunjuk apa pun. */}
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="published"
                              className="text-emerald-600 dark:text-emerald-400 font-medium"
                            >
                              Published
                            </SelectItem>
                            <SelectItem
                              value="draft"
                              className="text-amber-600 dark:text-amber-400 font-medium"
                            >
                              Draft
                            </SelectItem>
                            {/* `archived` diterima OpenTripSchema & API. Tanpa
                                item ini, paket berstatus archived membuat
                                Radix merender trigger kosong. */}
                            <SelectItem
                              value="archived"
                              className="text-zinc-500 dark:text-zinc-400 font-medium"
                            >
                              Archived
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Lihat di Web"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Link href={`/open-trip/${pkg.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Edit"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Link href={`/admin/open-trip/edit/${pkg.slug}`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pkg.slug)}
                          title="Hapus"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {showPagination && (
            <div className="border-t p-4">
              <TablePagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                onPageChange={pagination.setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
