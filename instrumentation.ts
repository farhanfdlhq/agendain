// Next.js instrumentation hook (v15+). onRequestError menangkap error yang
// BUBBLE keluar dari route/render (mis. 3 route tanpa try/catch + render Server
// Component). Ini jaring pengaman — mayoritas error ditelan catch dan dilaporkan
// eksplisit lewat lib/error-log.ts; keduanya saling melengkapi dan tak dobel
// (WeakSet wasReported/markReported).
//
// Tipe parameter ditulis inline (selaras RequestErrorContext yang dikirim Next)
// agar tidak bergantung pada re-export namespace `Instrumentation` dari root.

export async function register(): Promise<void> {
  // Tidak ada inisialisasi khusus; keberadaan register() membuat Next memuat
  // modul instrumentation ini.
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: NodeJS.Dict<string | string[]> },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "proxy";
    renderSource?: "react-server-components" | "react-server-components-payload" | "server-rendering";
    revalidateReason?: "on-demand" | "stale" | undefined;
  },
): Promise<void> {
  try {
    // (a) Prisma hanya tersedia di runtime Node.js — jangan sentuh di Edge.
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    // (b) redirect()/notFound() melempar error kontrol-alur dengan digest
    // berawalan "NEXT_" (NEXT_REDIRECT / NEXT_HTTP_ERROR_FALLBACK). Itu alur
    // normal, bukan kegagalan — jangan dicatat.
    const digest = (err as { digest?: unknown })?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_")) return;

    const { logErrorEvent, wasReported } = await import("@/lib/error-log");

    // (c) sudah dicatat oleh catch route (serverError/report*) → jangan dobel.
    if (wasReported(err)) return;

    await logErrorEvent(
      "error.unhandled",
      {
        route: `${request.method} ${context.routePath || request.path}`,
        status: 500,
        code: context.routeType,
        detail: {
          routerKind: context.routerKind,
          renderSource: context.renderSource,
          revalidateReason: context.revalidateReason,
        },
      },
      err,
    );
  } catch {
    // Instrumentation tidak boleh menjatuhkan proses.
  }
}
