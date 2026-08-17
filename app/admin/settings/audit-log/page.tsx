"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { ScrollText, RefreshCw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { PageSizeSelect } from "@/components/ui/page-size-select"
import { TablePagination } from "@/components/ui/table-pagination"

type AuditLog = {
  id: number
  action: string
  actorId: number | null
  actorEmail: string | null
  targetType: string | null
  targetId: string | null
  detail: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
}

// Aksi berisiko/negatif ditandai merah; login sukses hijau; sisanya netral.
const DESTRUCTIVE_ACTIONS = new Set([
  "login.failed",
  "user.delete",
  "error.server",
  "error.unhandled",
  "upload.failed",
])

const ACTION_LABELS: Record<string, string> = {
  "login.success": "Login Berhasil",
  "login.failed": "Login Gagal",
  "user.create": "Buat User",
  "user.update": "Ubah User",
  "user.delete": "Hapus User",
  "role.update": "Ubah Konfigurasi Role",
  "profile.update": "Ubah Profil",
  "profile.password_change": "Ganti Password",
  "profile.avatar_change": "Ganti Avatar",
  "error.server": "Error Server",
  "error.unhandled": "Error Tidak Tertangani",
  "upload.rejected": "Upload Ditolak",
  "upload.failed": "Upload Gagal",
  "auth.denied": "Akses Ditolak",
}

// Format JSON detail agar terbaca; fallback ke string mentah bila bukan JSON.
function formatDetail(detail: string): string {
  try {
    return JSON.stringify(JSON.parse(detail), null, 2)
  } catch {
    return detail
  }
}

export default function AuditLogPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null)

  const fetchData = useCallback(async (targetPage: number, targetSize: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/audit-log?page=${targetPage}&pageSize=${targetSize}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.rows)
        setTotal(data.total)
        setPage(data.page)
        setPageSize(data.pageSize)
      } else {
        toast.error("Gagal memuat audit log")
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session && (session.user as any)?.role !== 'super_admin') {
      router.push('/admin')
      return
    }
    if (session) fetchData(1, 10)
  }, [session, router, fetchData])

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const actionVariant = (action: string) => {
    if (DESTRUCTIVE_ACTIONS.has(action)) return "destructive" as const
    if (action === "login.success") return "secondary" as const
    return "outline" as const
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (loading && logs.length === 0) {
    return <div className="flex h-64 items-center justify-center"><AirplaneLoader size={48} /></div>
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Audit Log</h2>
          <p className="text-sm text-muted-foreground mt-1">Jejak aktivitas keamanan: login, perubahan user, role, dan profil.</p>
        </div>
        <Button variant="outline" onClick={() => fetchData(page, pageSize)} disabled={loading} className="rounded-full px-5 whitespace-nowrap">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <ScrollText className="w-5 h-5" />
            <h3 className="font-bold text-lg">Riwayat Aktivitas</h3>
          </div>

          <div className="mb-4">
            <PageSizeSelect
              value={pageSize}
              onValueChange={(n) => fetchData(1, n)}
              disabled={loading}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-12 font-semibold text-muted-foreground py-4">#</TableHead>
                  <TableHead className="font-semibold text-muted-foreground py-4">Waktu</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Aksi</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Pelaku</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Target</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={log.id} className="border-b-0">
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionVariant(log.action)} className="font-medium">
                        {ACTION_LABELS[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.actorEmail || <span className="text-muted-foreground italic">tidak dikenal</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {log.targetType ? `${log.targetType}${log.targetId ? ` #${log.targetId}` : ''}` : '—'}
                        </span>
                        {log.detail && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => setDetailLog(log)}
                            title="Lihat detail"
                            aria-label="Lihat detail"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {log.ip || '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Belum ada log.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6">
            <TablePagination
              page={page}
              pageCount={totalPages}
              total={total}
              from={from}
              to={to}
              onPageChange={(p) => fetchData(p, pageSize)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detailLog} onOpenChange={(open) => { if (!open) setDetailLog(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Aktivitas</DialogTitle>
            <DialogDescription>
              {detailLog ? (ACTION_LABELS[detailLog.action] || detailLog.action) : ""}
              {detailLog?.actorEmail ? ` · ${detailLog.actorEmail}` : ""}
            </DialogDescription>
          </DialogHeader>
          {detailLog?.detail && (
            <pre className="text-xs whitespace-pre-wrap break-all max-h-[60vh] overflow-auto rounded-lg bg-muted p-4 font-mono">
              {formatDetail(detailLog.detail)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
