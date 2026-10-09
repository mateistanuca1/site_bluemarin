import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { contentTag } from '@/lib/content';
import type { ContentKey } from '@/lib/types';

/**
 * Backend-ul Flask apeleaza ruta asta dupa fiecare salvare din admin, ca
 * modificarile sa apara imediat pe site in loc sa astepte expirarea cache-ului.
 *
 * Nu sta sub /api pentru ca pe Vercel tot ce e sub /api merge la Flask.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET nu este configurat pe frontend.' },
      { status: 503 },
    );
  }

  if (request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Secret invalid.' }, { status: 401 });
  }

  let key: string | null = null;
  try {
    const body = await request.json();
    key = typeof body?.key === 'string' ? body.key : null;
  } catch {
    // Fara corp de cerere — revalidam tot.
  }

  if (key) {
    revalidateTag(contentTag(key as ContentKey));
  } else {
    revalidateTag('content');
  }

  return NextResponse.json({ revalidated: true, key: key ?? 'tot continutul' });
}
