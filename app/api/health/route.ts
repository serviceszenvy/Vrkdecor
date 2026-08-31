import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Deployment health probe used for staging/production smoke tests (P12).
 * Intentionally exposes no environment, version or infrastructure detail.
 */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
