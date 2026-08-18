import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';


export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathArray = resolvedParams.path;
  
  if (!pathArray || pathArray.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Prevent directory traversal
  const safePath = pathArray.map(p => p.replace(/\.\./g, '')).join('/');
  const filePath = join(process.cwd(), 'public', 'uploads', safePath);

  if (!existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    
    // Determine content type based on extension
    const ext = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'pdf') contentType = 'application/pdf';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
