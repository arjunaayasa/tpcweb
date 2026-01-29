import { NextResponse } from 'next/server';
import { getSSOLoginUrl } from '@/lib/sso';

export async function POST() {
  const loginUrl = getSSOLoginUrl();
  return NextResponse.redirect(loginUrl);
}
