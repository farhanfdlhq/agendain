import { NextRequest, NextResponse } from 'next/server';
import { resolve, sep } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

// Folder akar yang boleh dilayani. Semua permintaan harus menyelesaikan path
// ke DALAM folder ini.
const UPLOADS_ROOT = resolve(process.cwd(), 'public', 'uploads');

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathArray = resolvedParams.path;

  if (!pathArray || pathArray.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Anti directory traversal yang KUAT: resolve() meruntuhkan `..`/`.` dan
  // pemisah OS, lalu kita pastikan hasilnya tetap di dalam UPLOADS_ROOT. Tidak
  // bergantung pada penyaringan string `..` (yang rapuh terhadap encoding &
  // pemisah Windows). Path absolut/drive-letter dari input juga ikut tertolak
  // karena keluar dari root.
  const requested = resolve(UPLOADS_ROOT, pathArray.join('/'));
  if (requested !== UPLOADS_ROOT && !requested.startsWith(UPLOADS_ROOT + sep)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (!existsSync(requested)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const file = await readFile(requested);

    // Determine content type based on extension
    const ext = requested.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'pdf') contentType = 'application/pdf';

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
