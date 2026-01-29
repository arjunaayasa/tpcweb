import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_TOKEN_COOKIE = 'admin_tpc_token';
const ADMIN_JWT_ISSUER = 'tpc-admin';
const ADMIN_JWT_AUDIENCE = 'tpc-admin';
const ADMIN_TOKEN_TTL = '1d';

const getAdminJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not set.');
  }
  return new TextEncoder().encode(secret);
};

export async function signAdminToken(payload: { sub: string; email: string }) {
  const secret = getAdminJwtSecret();
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer(ADMIN_JWT_ISSUER)
    .setAudience(ADMIN_JWT_AUDIENCE)
    .setExpirationTime(ADMIN_TOKEN_TTL)
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  const secret = getAdminJwtSecret();
  const { payload } = await jwtVerify(token, secret, {
    issuer: ADMIN_JWT_ISSUER,
    audience: ADMIN_JWT_AUDIENCE,
  });
  return payload;
}
