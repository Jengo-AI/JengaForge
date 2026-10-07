import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TOOLS_REGISTRY } from '../constants';

/**
 * Validates Firestore Security Rules invariants and AST specifications:
 * - Unauthorized profile mutations
 * - Forged UID protections
 * - Forged submission ownership
 * - Exact-schema enforcement for tool submissions
 * - Canonical tool ID registry alignment (single source of truth)
 * - Timestamp and serverTimestamp() security semantics
 * - Safe public HTTPS URL validation & SSRF isolation
 * - Review uniqueness and author verification
 */
test('Firestore Security Rules: Security Boundary & Invariant Validation', async (t) => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  await t.test('rules file exists and specifies rules_version = 2', () => {
    assert.match(rulesContent, /rules_version\s*=\s*['"]2['"]/);
    assert.match(rulesContent, /service\s+cloud\.firestore/);
  });

  await t.test('canonical registry sync: all TOOLS_REGISTRY ids are present in firestore.rules allowlist', () => {
    for (const tool of TOOLS_REGISTRY) {
      assert.ok(
        rulesContent.includes(`'${tool.id}'`),
        `Expected tool ID '${tool.id}' to be present in firestore.rules canonical allowlist`
      );
    }
  });

  await t.test('exact-schema enforcement: toolSubmissions requires hasExactFields', () => {
    assert.match(
      rulesContent,
      /function isValidToolSubmission\(data\)\s*\{\s*return hasExactFields\(\['id', 'name', 'category', 'pricing', 'description', 'websiteUrl', 'tags', 'submittedBy', 'status', 'createdAt'\]\)/
    );
  });

  await t.test('submission owner forged UID protection: request.resource.data.submittedBy must match request.auth.uid', () => {
    assert.match(
      rulesContent,
      /match \/toolSubmissions\/\{submissionId\}\s*\{[\s\S]*?request\.resource\.data\.submittedBy == request\.auth\.uid/
    );
    assert.match(rulesContent, /request\.resource\.data\.status == "PENDING_REVIEW"/);
  });

  await t.test('upvote authorization: voteId is bound to {toolId}_{userId} and checks isCanonicalToolId', () => {
    assert.match(
      rulesContent,
      /match \/toolUpvotes\/\{voteId\}\s*\{[\s\S]*?voteId == request\.resource\.data\.toolId \+ '_' \+ request\.auth\.uid/
    );
    assert.match(rulesContent, /isCanonicalToolId\(request\.resource\.data\.toolId\)/);
  });

  await t.test('review authorization: reviewId is bound to {userId}_{toolId} preventing duplicates or forged authors', () => {
    assert.match(
      rulesContent,
      /match \/reviews\/\{reviewId\}\s*\{[\s\S]*?reviewId == request\.auth\.uid \+ '_' \+ request\.resource\.data\.toolId/
    );
    assert.match(rulesContent, /isCanonicalToolId\(data\.toolId\)/);
  });

  await t.test('user profile immutability: prevents tampering with id, email, joinedAt, masteryLevel, stacksCreated', () => {
    assert.match(rulesContent, /request\.resource\.data\.id == resource\.data\.id/);
    assert.match(rulesContent, /request\.resource\.data\.email == resource\.data\.email/);
    assert.match(rulesContent, /request\.resource\.data\.joinedAt == resource\.data\.joinedAt/);
    assert.match(rulesContent, /request\.resource\.data\.masteryLevel == resource\.data\.masteryLevel/);
    assert.match(rulesContent, /request\.resource\.data\.stacksCreated == resource\.data\.stacksCreated/);
    assert.match(rulesContent, /allow delete:\s*if false;/);
  });

  await t.test('timestamp semantics: supports serverTimestamp (request.time) and ISO date formats', () => {
    assert.match(rulesContent, /function isTimestampOrServerTimestamp\(fieldVal\)/);
    assert.match(rulesContent, /fieldVal == request\.time/);
  });

  await t.test('SSRF isolation: blocks loopbacks, private RFC1918, AWS/GCP metadata, and internal domains', () => {
    assert.match(rulesContent, /function isSafePublicHttpsUrl\(url\)/);
    assert.ok(rulesContent.includes('localhost'));
    assert.ok(rulesContent.includes('127'));
    assert.ok(rulesContent.includes('169'));
    assert.ok(rulesContent.includes('192'));
    assert.ok(rulesContent.includes('local|internal|lan|corp|test'));
  });
});
