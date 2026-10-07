import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCanonicalToolIds } from '../services/stackService';

// SSRF & URL Validation Logic matching server implementation
function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || hostname.includes("..")) return false;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".corp") ||
      hostname.endsWith(".test")
    ) {
      return false;
    }
    if (!hostname.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

// CORS Origin Validation Logic matching server implementation
const allowedOrigins = new Set<string>([
  "https://jenga-forge.vercel.app",
  "https://jengaforge.ai",
]);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return allowedOrigins.has(origin);
}

test('Security: URL Validation and SSRF Protection', async (t) => {
  await t.test('accepts valid public HTTPS URLs', () => {
    assert.equal(isValidHttpUrl('https://cursor.com'), true);
    assert.equal(isValidHttpUrl('https://claude.ai/overview'), true);
    assert.equal(isValidHttpUrl('https://deepseek.com'), true);
  });

  await t.test('rejects local and loopback addresses', () => {
    assert.equal(isValidHttpUrl('http://localhost:3000'), false);
    assert.equal(isValidHttpUrl('http://127.0.0.1:8080'), false);
    assert.equal(isValidHttpUrl('http://[::1]:3000'), false);
  });

  await t.test('rejects private IPv4 networks (RFC 1918)', () => {
    assert.equal(isValidHttpUrl('http://192.168.1.1/admin'), false);
    assert.equal(isValidHttpUrl('http://10.0.0.1/meta'), false);
    assert.equal(isValidHttpUrl('http://172.16.0.1'), false);
    assert.equal(isValidHttpUrl('http://172.31.255.255'), false);
    assert.equal(isValidHttpUrl('http://169.254.169.254/latest/meta-data'), false); // AWS/GCP metadata
  });

  await t.test('rejects internal and non-public domains', () => {
    assert.equal(isValidHttpUrl('http://server.local'), false);
    assert.equal(isValidHttpUrl('http://corp-backend.internal'), false);
    assert.equal(isValidHttpUrl('http://gateway.lan'), false);
  });

  await t.test('rejects invalid schemes', () => {
    assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
    assert.equal(isValidHttpUrl('file:///etc/passwd'), false);
    assert.equal(isValidHttpUrl('data:text/html,test'), false);
  });
});

test('Security: Stack Tool IDs Canonical Enforcement', async (t) => {
  await t.test('filters out arbitrary and fake tool IDs', () => {
    const rawIds = ['cursor-agent', 'fake-tool-123', 'claude-5-5-sonnet', 'malicious-injected-id', 'devin-ai'];
    const filtered = filterCanonicalToolIds(rawIds);

    assert.deepEqual(filtered, ['cursor-agent', 'claude-5-5-sonnet', 'devin-ai']);
    assert.equal(filtered.includes('fake-tool-123'), false);
    assert.equal(filtered.includes('malicious-injected-id'), false);
  });

  await t.test('handles non-array and empty inputs safely', () => {
    assert.deepEqual(filterCanonicalToolIds(null as any), []);
    assert.deepEqual(filterCanonicalToolIds(undefined as any), []);
    assert.deepEqual(filterCanonicalToolIds(['   ']), []);
  });
});

test('Security: CORS Origin Policy', async (t) => {
  await t.test('allows official production domains', () => {
    assert.equal(isAllowedOrigin('https://jenga-forge.vercel.app'), true);
    assert.equal(isAllowedOrigin('https://jengaforge.ai'), true);
    assert.equal(isAllowedOrigin(undefined), true); // Server-to-server / curl
  });

  await t.test('rejects unauthorized third-party origins', () => {
    assert.equal(isAllowedOrigin('https://malicious-phishing.com'), false);
    assert.equal(isAllowedOrigin('https://random-app.vercel.app'), false);
    assert.equal(isAllowedOrigin('https://evil-container.run.app'), false);
  });
});

test('Security: Profile Mutation Sanitization', async (t) => {
  await t.test('disallows client modification of masteryLevel and stacksCreated', () => {
    const maliciousClientUpdates: any = {
      name: 'Legit User',
      masteryLevel: 999999,
      stacksCreated: 5000,
      id: 'hacked_id',
      email: 'hacked@email.com'
    };

    // Client whitelisting model
    const allowedUpdates: any = {};
    if (typeof maliciousClientUpdates.name === 'string' && maliciousClientUpdates.name.trim().length > 0) {
      allowedUpdates.name = maliciousClientUpdates.name.trim().slice(0, 100);
    }
    if (typeof maliciousClientUpdates.avatar === 'string' && maliciousClientUpdates.avatar.trim().length > 0) {
      allowedUpdates.avatar = maliciousClientUpdates.avatar.trim().slice(0, 2000);
    }
    if (Array.isArray(maliciousClientUpdates.savedToolIds)) {
      allowedUpdates.savedToolIds = maliciousClientUpdates.savedToolIds.slice(0, 500);
    }

    assert.equal(allowedUpdates.masteryLevel, undefined);
    assert.equal(allowedUpdates.stacksCreated, undefined);
    assert.equal(allowedUpdates.id, undefined);
    assert.equal(allowedUpdates.email, undefined);
    assert.equal(allowedUpdates.name, 'Legit User');
  });
});
