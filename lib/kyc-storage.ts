import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Canonical per-user storage for KYC submission images on the **tpcweb (aaPanel) disk**.
 *
 * tpcweb is the public front door (taxindo.ai), so KYC documents are stored here — not on the
 * portal/backend (portal.taxindo.ai). Files are kept permanently under a per-user folder so an
 * admin can re-review them from the file manager at any time. They are never served via a public
 * URL; the backend only receives the raw bytes (for OCR/adjudication) plus this stored path as a
 * traceability reference (`imagePath`).
 *
 * Layout: {KYC_STORAGE_DIR}/{userId}/{filename}{ext}
 * Base dir resolves from env `KYC_STORAGE_DIR` (default `./storage/kyc`).
 */

/** Resolve the configured base storage directory (absolute). */
export function getKycStorageBaseDir(): string {
  const configured = process.env.KYC_STORAGE_DIR?.trim() || './storage/kyc';
  return path.resolve(configured);
}

/** Build the per-user directory path for a given user. */
export function getUserKycDir(userId: string): string {
  return path.join(getKycStorageBaseDir(), sanitizeSegment(userId));
}

/**
 * Build the absolute path a submission would be stored at.
 * `ext` should include the leading dot (e.g. `.jpg`); empty string is allowed.
 */
export function getKycFilePath(userId: string, fileName: string, ext = ''): string {
  const normalizedExt = ext ? (ext.startsWith('.') ? ext : `.${ext}`) : '';
  return path.join(getUserKycDir(userId), `${sanitizeSegment(fileName)}${normalizedExt.toLowerCase()}`);
}

/**
 * Persist an uploaded file buffer to `{base}/{userId}/{fileName}{ext}`, creating the directory
 * tree recursively. Returns the absolute stored path (used as the backend `imagePath`).
 */
export async function saveKycFile(
  userId: string,
  fileName: string,
  buffer: Buffer,
  ext = ''
): Promise<string> {
  const dir = getUserKycDir(userId);
  await mkdir(dir, { recursive: true });
  const filePath = getKycFilePath(userId, fileName, ext);
  await writeFile(filePath, buffer);
  return filePath;
}

/**
 * Guard against path traversal / separators in a path segment. KYC ids and user ids are uuids,
 * but this keeps storage safe even if a caller passes something unexpected.
 */
function sanitizeSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
