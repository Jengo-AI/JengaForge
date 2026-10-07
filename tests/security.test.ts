import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCanonicalToolIds } from '../services/stackService';
import { 
  isValidHttpUrl, 
  isAllowedOrigin, 
  sanitizeProfileUpdates 
} from '../services/securityUtils';
import { TOOLS_REGISTRY } from '../constants';

test('Security: URL Validation and SSRF Protection (Production Implementation)', async (t) => {
  await t.test('accepts valid public HTTPS URLs', () => {
    assert.equal(isValidHttpUrl('https://cursor.com'), true);
    assert.equal(isValidHttpUrl('https://claude.ai/overview'), true);
    assert.equal(isValidHttpUrl('https://deepseek.com'), true);
    assert.equal(isValidHttpUrl('https://jengaforge.dev/docs'), true);
  });

  await t.test('enforces strict HTTPS when requireHttps is enabled', () => {
    assert.equal(isValidHttpUrl('https://cursor.com', true), true);
    assert.equal(isValidHttpUrl('http://cursor.com', true), false);
  });

  await t.test('rejects local and loopback addresses', () => {
    assert.equal(isValidHttpUrl('http://localhost:3000'), false);
    assert.equal(isValidHttpUrl('http://127.0.0.1:8080'), false);
    assert.equal(isValidHttpUrl('http://[::1]:3000'), false);
    assert.equal(isValidHttpUrl('https://localhost:443'), false);
    assert.equal(isValidHttpUrl('https://127.0.0.1/admin'), false);
  });

  await t.test('rejects private IPv4 networks (RFC 1918 & RFC 3927 link-local)', () => {
    assert.equal(isValidHttpUrl('http://192.168.1.1/admin'), false);
    assert.equal(isValidHttpUrl('https://192.168.0.100/status'), false);
    assert.equal(isValidHttpUrl('http://10.0.0.1/meta'), false);
    assert.equal(isValidHttpUrl('https://10.254.1.2/secret'), false);
    assert.equal(isValidHttpUrl('http://172.16.0.1'), false);
    assert.equal(isValidHttpUrl('https://172.31.255.255'), false);
    assert.equal(isValidHttpUrl('http://169.254.169.254/latest/meta-data'), false); // AWS/GCP cloud metadata
    assert.equal(isValidHttpUrl('https://169.254.169.254/'), false);
  });

  await t.test('rejects internal and non-public domains', () => {
    assert.equal(isValidHttpUrl('http://server.local'), false);
    assert.equal(isValidHttpUrl('https://corp-backend.internal'), false);
    assert.equal(isValidHttpUrl('http://gateway.lan'), false);
    assert.equal(isValidHttpUrl('https://intranet.corp'), false);
    assert.equal(isValidHttpUrl('http://sandbox.test'), false);
  });

  await t.test('rejects invalid schemes and code injections', () => {
    assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
    assert.equal(isValidHttpUrl('file:///etc/passwd'), false);
    assert.equal(isValidHttpUrl('data:text/html,test'), false);
    assert.equal(isValidHttpUrl('ftp://example.com'), false);
    assert.equal(isValidHttpUrl(''), false);
    assert.equal(isValidHttpUrl(null as any), false);
    assert.equal(isValidHttpUrl(undefined as any), false);
  });
});

test('Security: Stack Tool IDs Canonical Enforcement (Production Implementation)', async (t) => {
  await t.test('filters out arbitrary and fake tool IDs against TOOLS_REGISTRY', () => {
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
    assert.deepEqual(filterCanonicalToolIds([123, true, {}] as any), []);
  });

  await t.test('verifies that all TOOLS_REGISTRY tools can pass canonical filtering', () => {
    const allRegistryIds = TOOLS_REGISTRY.map(t => t.id);
    const filtered = filterCanonicalToolIds(allRegistryIds);
    assert.equal(filtered.length, allRegistryIds.length);
  });
});

test('Security: CORS Origin Policy (Production Implementation)', async (t) => {
  await t.test('allows official production domains in production mode', () => {
    assert.equal(isAllowedOrigin('https://jenga-forge.vercel.app', true), true);
    assert.equal(isAllowedOrigin('https://jengaforge.ai', true), true);
    assert.equal(isAllowedOrigin(undefined, true), true); // Server-to-server / curl
  });

  await t.test('rejects localhost and preview domains in strict production mode', () => {
    assert.equal(isAllowedOrigin('http://localhost:3000', true), false);
    assert.equal(isAllowedOrigin('http://127.0.0.1:3000', true), false);
  });

  await t.test('allows local dev and preview origins in non-production mode', () => {
    assert.equal(isAllowedOrigin('http://localhost:3000', false), true);
    assert.equal(isAllowedOrigin('http://127.0.0.1:3000', false), true);
    assert.equal(isAllowedOrigin('https://ais-dev-tcsepyjqmovf6epwqukwv6-259395365633.europe-west2.run.app', false), true);
  });

  await t.test('rejects unauthorized third-party origins in all environments', () => {
    assert.equal(isAllowedOrigin('https://malicious-phishing.com', true), false);
    assert.equal(isAllowedOrigin('https://random-app.vercel.app', true), false);
    assert.equal(isAllowedOrigin('https://evil-container.run.app', true), false);
    assert.equal(isAllowedOrigin('https://malicious-phishing.com', false), false);
  });
});

test('Security: Profile Mutation Sanitization (Production Implementation)', async (t) => {
  await t.test('strictly filters out masteryLevel, stacksCreated, id, email, and joinedAt', () => {
    const maliciousClientUpdates: any = {
      name: 'Legit User',
      avatar: 'https://images.unsplash.com/avatar.jpg',
      masteryLevel: 999999,
      stacksCreated: 5000,
      id: 'hacked_id',
      email: 'hacked@email.com',
      joinedAt: '2020-01-01T00:00:00Z',
      savedToolIds: ['cursor-agent', 'gemini-4-argon'],
      unknownAdminField: true,
    };

    const sanitized = sanitizeProfileUpdates(maliciousClientUpdates);

    // Whitelisted fields are preserved
    assert.equal(sanitized.name, 'Legit User');
    assert.equal(sanitized.avatar, 'https://images.unsplash.com/avatar.jpg');
    assert.deepEqual(sanitized.savedToolIds, ['cursor-agent', 'gemini-4-argon']);

    // Restricted fields are completely excluded
    assert.equal(sanitized.masteryLevel, undefined);
    assert.equal(sanitized.stacksCreated, undefined);
    assert.equal(sanitized.id, undefined);
    assert.equal(sanitized.email, undefined);
    assert.equal(sanitized.joinedAt, undefined);
    assert.equal(sanitized.unknownAdminField, undefined);
  });

  await t.test('handles invalid or non-object payloads gracefully', () => {
    assert.deepEqual(sanitizeProfileUpdates(null), {});
    assert.deepEqual(sanitizeProfileUpdates(undefined), {});
    assert.deepEqual(sanitizeProfileUpdates('malicious string' as any), {});
    assert.deepEqual(sanitizeProfileUpdates(123 as any), {});
  });
});
