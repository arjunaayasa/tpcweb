import { NextResponse } from 'next/server';
import { getSSOLoginUrl } from '@/lib/sso';

export async function POST() {
  const loginUrl = await getSSOLoginUrl();
  return NextResponse.redirect(loginUrl);
}
