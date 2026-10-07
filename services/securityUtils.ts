/**
 * Security & Validation Utilities for JengaForge
 * Canonical production implementations used across server, client services, and test suites.
 */

/**
 * Validates URLs against SSRF, internal network traversal, and malformed inputs.
 * @param value The candidate URL string
 * @param requireHttps Whether to strictly require HTTPS protocol (recommended for submissions)
 */
export function isValidHttpUrl(value: string, requireHttps = false): boolean {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    if (requireHttps) {
      if (parsed.protocol !== 'https:') return false;
    } else {
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || hostname.includes('..')) return false;

    // Reject loopback, link-local, private RFC 1918 / RFC 4193 IP ranges, and internal names
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan') ||
      hostname.endsWith('.corp') ||
      hostname.endsWith('.test')
    ) {
      return false;
    }

    // Must contain a valid domain with TLD (e.g. domain.com)
    if (!hostname.includes('.')) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Production domain allowlist for CORS headers.
 */
export const PRODUCTION_ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  'https://jenga-forge.vercel.app',
  'https://jengaforge.ai',
]);

/**
 * Evaluates whether an incoming HTTP request origin is permitted.
 */
export function isAllowedOrigin(origin: string | undefined, isProduction = process.env.NODE_ENV === 'production'): boolean {
  if (!origin) return true; // allow same-origin, curl, server-to-server, or mobile web views
  if (PRODUCTION_ALLOWED_ORIGINS.has(origin)) return true;

  if (!isProduction) {
    if (
      origin === 'http://localhost:3000' ||
      origin === 'http://127.0.0.1:3000' ||
      origin === 'https://ais-dev-tcsepyjqmovf6epwqukwv6-259395365633.europe-west2.run.app' ||
      origin === 'https://ais-pre-tcsepyjqmovf6epwqukwv6-259395365633.europe-west2.run.app'
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes user profile mutation payloads, strictly rejecting client attempts
 * to modify system-governed fields such as masteryLevel, stacksCreated, id, email, or joinedAt.
 */
export function sanitizeProfileUpdates(updates: any): Record<string, any> {
  const allowedUpdates: Record<string, any> = {};
  if (!updates || typeof updates !== 'object') return allowedUpdates;

  if (typeof updates.name === 'string' && updates.name.trim().length > 0) {
    allowedUpdates.name = updates.name.trim().slice(0, 100);
  }
  if (typeof updates.avatar === 'string' && updates.avatar.trim().length > 0) {
    allowedUpdates.avatar = updates.avatar.trim().slice(0, 2000);
  }
  if (Array.isArray(updates.savedToolIds)) {
    allowedUpdates.savedToolIds = updates.savedToolIds
      .filter((id: unknown): id is string => typeof id === 'string')
      .slice(0, 500);
  }

  return allowedUpdates;
}
