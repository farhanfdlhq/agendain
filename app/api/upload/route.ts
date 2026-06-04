import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Security: Check file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar. Maksimal 10MB.' }, { status: 400 });
    }

    // Security: Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak diizinkan. Gunakan JPG, PNG, WEBP, PDF, atau DOC.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const finalName = `${uniqueSuffix}-${filename}`;
    
    // Path to save the file in public/uploads
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, finalName);
    
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${finalName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
