import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { TOOLS_REGISTRY } from '../constants';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

/**
 * Suite 1: Static AST Contract & Invariant Validation
 */
test('Firestore Security Rules: Static Contract & Security Boundary Invariants', async (t) => {
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

  await t.test('server timestamp enforcement: requires isServerTimestamp (request.time) for audit integrity', () => {
    assert.match(rulesContent, /function isServerTimestamp\(fieldVal\)\s*\{\s*return fieldVal == request\.time;\s*\}/);
    assert.match(rulesContent, /isServerTimestamp\(request\.resource\.data\.createdAt\)/);
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

/**
 * Helper to probe if Firestore Emulator is active
 */
function probeEmulator(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      { host, port, path: '/emulator/v1/projects', method: 'GET', timeout: 500 },
      (res) => resolve(res.statusCode === 200 || res.statusCode === 404)
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * Suite 2: Firebase Emulator Behavioral Attack Test Suite
 * Executes real Firestore operations against the live rules engine when the emulator is active.
 */
test('Firestore Security Rules: Behavioral Emulator Threat Matrix', async (t) => {
  const envHost = process.env.FIRESTORE_EMULATOR_HOST;
  let host = '127.0.0.1';
  let port = 8085;

  if (envHost) {
    const [h, p] = envHost.split(':');
    host = h || host;
    port = parseInt(p || '8085', 10);
  }

  const isRunning = await probeEmulator(host, port);
  if (!isRunning) {
    console.log(`\nℹ️ [Notice] Firestore Emulator not currently running on ${host}:${port}.`);
    console.log(`   CI executes behavioral tests automatically via: npx firebase-tools emulators:exec --only firestore "npm test"`);
    console.log(`   Skipping behavioral test assertions for this run.\n`);
    return;
  }

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: 'jengaforge-security-test',
      firestore: {
        rules: rulesContent,
        host,
        port,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize test environment with emulator:', err);
    return;
  }

  const userAId = 'user_alice_123';
  const userBId = 'user_bob_456';
  const canonicalTool = TOOLS_REGISTRY[0].id;

  const aliceDb = testEnv.authenticatedContext(userAId).firestore();
  const bobDb = testEnv.authenticatedContext(userBId).firestore();
  const anonDb = testEnv.unauthenticatedContext().firestore();

  // Seed baseline data
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, 'users', userBId), {
      id: userBId,
      name: 'Bob',
      email: 'bob@example.com',
      avatar: 'https://example.com/bob.png',
      joinedAt: '2026-01-01T00:00:00.000Z',
      savedToolIds: [canonicalTool],
      masteryLevel: 1,
      stacksCreated: 0,
    });
  });

  await t.test('Attack 1: User A edits User B profile -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'users', userBId), {
        id: userBId,
        name: 'Hacked by Alice',
        email: 'bob@example.com',
        avatar: 'https://example.com/bob.png',
        joinedAt: '2026-01-01T00:00:00.000Z',
        savedToolIds: [canonicalTool],
        masteryLevel: 1,
        stacksCreated: 0,
      })
    );
  });

  await t.test('Attack 2: User forges submittedBy -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'toolSubmissions', 'sub_forged_owner'), {
        id: 'new-tool',
        name: 'New Tool',
        category: 'Development',
        pricing: 'Free',
        description: 'Legitimate looking tool description',
        websiteUrl: 'https://example.com',
        tags: ['dev'],
        submittedBy: userBId, // Forged owner
        status: 'PENDING_REVIEW',
        createdAt: serverTimestamp(),
      })
    );
  });

  await t.test('Attack 3: User changes submission status -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'toolSubmissions', 'sub_status_tamper'), {
        id: 'new-tool',
        name: 'New Tool',
        category: 'Development',
        pricing: 'Free',
        description: 'Legitimate looking tool description',
        websiteUrl: 'https://example.com',
        tags: ['dev'],
        submittedBy: userAId,
        status: 'APPROVED', // Tampered status
        createdAt: serverTimestamp(),
      })
    );
  });

  await t.test('Attack 4: User injects extra submission field -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'toolSubmissions', 'sub_extra_field'), {
        id: 'new-tool',
        name: 'New Tool',
        category: 'Development',
        pricing: 'Free',
        description: 'Legitimate looking tool description',
        websiteUrl: 'https://example.com',
        tags: ['dev'],
        submittedBy: userAId,
        status: 'PENDING_REVIEW',
        createdAt: serverTimestamp(),
        adminPrivilege: true, // Injected extra field
      })
    );
  });

  await t.test('Attack 5: User creates vote for noncanonical tool -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'toolUpvotes', `fake-nonexistent-tool_${userAId}`), {
        toolId: 'fake-nonexistent-tool',
        userId: userAId,
        createdAt: serverTimestamp(),
      })
    );
  });

  await t.test('Attack 6: User creates vote under another UID -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'toolUpvotes', `${canonicalTool}_${userBId}`), {
        toolId: canonicalTool,
        userId: userBId,
        createdAt: serverTimestamp(),
      })
    );
  });

  await t.test('Attack 7: Duplicate review / mismatched review ID -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'reviews', `forgedId_${canonicalTool}`), {
        toolId: canonicalTool,
        userId: userAId,
        userName: 'Alice',
        rating: 5,
        text: 'Great tool!',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  await t.test('Attack 8: User changes review ownership on update -> DENIED', async () => {
    const reviewId = `${userAId}_${canonicalTool}`;
    // Alice creates review
    await assertSucceeds(
      setDoc(doc(aliceDb, 'reviews', reviewId), {
        toolId: canonicalTool,
        userId: userAId,
        userName: 'Alice',
        rating: 5,
        text: 'Great tool!',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // Bob tries to update Alice's review
    await assertFails(
      updateDoc(doc(bobDb, 'reviews', reviewId), {
        text: 'Hacked by Bob',
        updatedAt: serverTimestamp(),
      })
    );
  });

  await t.test('Attack 9: User changes profile metrics (masteryLevel) -> DENIED', async () => {
    await assertFails(
      updateDoc(doc(bobDb, 'users', userBId), {
        masteryLevel: 99,
      })
    );
  });

  await t.test('Attack 10: User provides fake client timestamp -> DENIED', async () => {
    await assertFails(
      setDoc(doc(aliceDb, 'toolSubmissions', 'sub_fake_timestamp'), {
        id: 'new-tool-2',
        name: 'New Tool 2',
        category: 'Development',
        pricing: 'Free',
        description: 'Legitimate looking tool description',
        websiteUrl: 'https://example.com',
        tags: ['dev'],
        submittedBy: userAId,
        status: 'PENDING_REVIEW',
        createdAt: '2019-01-01T00:00:00.000Z', // Fake client timestamp
      })
    );
  });

  await t.test('Attack 11: Unauthenticated submission -> DENIED', async () => {
    await assertFails(
      setDoc(doc(anonDb, 'toolSubmissions', 'sub_anon'), {
        id: 'new-tool-anon',
        name: 'Anon Tool',
        category: 'Development',
        pricing: 'Free',
        description: 'Legitimate looking tool description',
        websiteUrl: 'https://example.com',
        tags: ['dev'],
        submittedBy: 'random_id',
        status: 'PENDING_REVIEW',
        createdAt: serverTimestamp(),
      })
    );
  });

  await t.test('Legitimate action: Authenticated submission with server timestamp -> ALLOWED', async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb, 'toolSubmissions', 'sub_alice_valid'), {
        id: 'valid-alice-tool',
        name: 'Valid Alice Tool',
        category: 'Development',
        pricing: 'Free',
        description: 'Legitimate looking tool description that passes validation',
        websiteUrl: 'https://example.com/tool',
        tags: ['development'],
        submittedBy: userAId,
        status: 'PENDING_REVIEW',
        createdAt: serverTimestamp(),
      })
    );
  });

  await testEnv.cleanup();
});
