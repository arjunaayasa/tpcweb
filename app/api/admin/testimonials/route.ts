import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_TESTIMONIAL_PHOTO_URL } from '@/lib/testimonials';
import { requireAdminFromRequest } from '@/lib/sso';

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const badRequestResponse = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

const isSameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const ensureSameOrigin = (request: Request) => {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
};

const requireAdmin = async (request: Request) => {
  const admin = await requireAdminFromRequest(request);
  if (!admin) {
    return unauthorizedResponse();
  }
  return null;
};

type TestimonialPayload = {
  quote?: string;
  name?: string;
  role?: string;
  company?: string;
  photoUrl?: string;
};

const normalizeRequired = (value?: string) => value?.toString().trim() ?? '';

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ testimonials });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const originError = ensureSameOrigin(request);
  if (originError) {
    return originError;
  }
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  let payload: TestimonialPayload;
  try {
    payload = (await request.json()) as TestimonialPayload;
  } catch {
    return badRequestResponse('Invalid payload');
  }

  const quote = normalizeRequired(payload.quote);
  const name = normalizeRequired(payload.name);
  const role = normalizeRequired(payload.role);
  const company = normalizeRequired(payload.company);
  const photoUrl =
    payload.photoUrl?.toString().trim() || DEFAULT_TESTIMONIAL_PHOTO_URL;

  if (!quote || !name || !role || !company) {
    return badRequestResponse('Missing required fields');
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: { quote, name, role, company, photoUrl },
    });
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const originError = ensureSameOrigin(request);
  if (originError) {
    return originError;
  }
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  let payload: TestimonialPayload & { id?: string };
  try {
    payload = (await request.json()) as TestimonialPayload & { id?: string };
  } catch {
    return badRequestResponse('Invalid payload');
  }

  const id = payload.id?.toString().trim();
  if (!id) {
    return badRequestResponse('Missing testimonial id');
  }

  const updates: Record<string, string> = {};
  const quote = payload.quote?.toString().trim();
  const name = payload.name?.toString().trim();
  const role = payload.role?.toString().trim();
  const company = payload.company?.toString().trim();
  const photoUrl = payload.photoUrl?.toString().trim();

  if (quote !== undefined) {
    if (!quote) {
      return badRequestResponse('Quote cannot be empty');
    }
    updates.quote = quote;
  }

  if (name !== undefined) {
    if (!name) {
      return badRequestResponse('Name cannot be empty');
    }
    updates.name = name;
  }

  if (role !== undefined) {
    if (!role) {
      return badRequestResponse('Role cannot be empty');
    }
    updates.role = role;
  }

  if (company !== undefined) {
    if (!company) {
      return badRequestResponse('Company cannot be empty');
    }
    updates.company = company;
  }

  if (payload.photoUrl !== undefined) {
    updates.photoUrl = photoUrl || DEFAULT_TESTIMONIAL_PHOTO_URL;
  }

  if (Object.keys(updates).length === 0) {
    return badRequestResponse('No fields to update');
  }

  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json({ testimonial });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const originError = ensureSameOrigin(request);
  if (originError) {
    return originError;
  }
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  const url = new URL(request.url);
  let id = url.searchParams.get('id')?.trim();

  if (!id) {
    try {
      const payload = (await request.json()) as { id?: string };
      id = payload.id?.toString().trim();
    } catch {
      return badRequestResponse('Missing testimonial id');
    }
  }

  if (!id) {
    return badRequestResponse('Missing testimonial id');
  }

  try {
    const result = await prisma.testimonial.deleteMany({ where: { id } });
    if (result.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
