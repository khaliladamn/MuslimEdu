// Base URL for the Manhaje API.
// Confirmed working endpoint during Phase 1 testing:
// https://manhaje.com/apps/api/login
export const API_BASE_URL = 'https://manhaje.com/apps/api';

// Origin used to resolve RELATIVE image paths the backend returns
// (e.g. "/storage/reports/x.jpg" or "storage/reports/x.jpg").
// The Laravel app lives under /apps, so we strip only the trailing "/api":
//   https://manhaje.com/apps/api  ->  https://manhaje.com/apps
// If your storage links resolve from the domain root instead, change this to:
//   const API_ORIGIN = 'https://manhaje.com';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const ENDPOINTS = {
  login: `${API_BASE_URL}/login`,
  me: `${API_BASE_URL}/me`,
  logout: `${API_BASE_URL}/logout`,
  logoutAll: `${API_BASE_URL}/logout-all`,
};

/**
 * Turns a backend image path into a loadable absolute URL.
 *
 * The API returns image fields (profile photos, report photos) as paths that
 * may be already-absolute ("https://...") OR relative ("/storage/x.jpg").
 * React Native's <Image> can't load a relative path, so it silently shows
 * nothing - this is the "images don't sync" bug. Run every backend image
 * URL through this before handing it to <Image source={{ uri }} />.
 *
 * Returns null for empty/nullish input so callers can conditionally render.
 */
export function absoluteUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  if (/^data:/i.test(path)) return path; // inline base64, leave alone
  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
}
