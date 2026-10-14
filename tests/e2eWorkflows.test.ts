import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { TOOLS_REGISTRY } from '../constants';
import { chatWithGemini } from '../services/geminiService';

test('Integration & Production Flows Verification', async (t) => {
  const rulesPath = resolve(process.cwd(), 'firestore.rules');
  const rulesContent = readFileSync(rulesPath, 'utf8');

  let testEnv: RulesTestEnvironment | null = null;
  const canonicalTool = TOOLS_REGISTRY[0].id;
  const canonicalTool2 = TOOLS_REGISTRY[1]?.id || canonicalTool;

  try {
    testEnv = await initializeTestEnvironment({
      projectId: 'jengaforge-e2e-test',
      firestore: {
        rules: rulesContent,
        host: '127.0.0.1',
        port: 8085,
      },
    });
  } catch {
    console.warn('Firestore emulator not running or unreachable on 127.0.0.1:8085. Skipping live emulator assertion block.');
  }

  if (testEnv) {
    const user1 = testEnv.authenticatedContext('user_creator_01', { email: 'creator1@test.com' }).firestore();
    const user2 = testEnv.authenticatedContext('user_reviewer_02', { email: 'reviewer2@test.com' }).firestore();
    const anon = testEnv.unauthenticatedContext().firestore();

    await t.test('1. Tool Submission -> Moderation -> Publication Lifecycle Flow', async () => {
      const submissionId = 'sub_e2e_cursor_pro';

      // Step A: User 1 submits a new tool
      await assertSucceeds(
        setDoc(doc(user1, 'toolSubmissions', submissionId), {
          id: 'cursor-pro-agent',
          name: 'Cursor Pro Agent',
          category: 'Development',
          pricing: 'Paid',
          description: 'AI-first code editor autonomous workflow environment.',
          websiteUrl: 'https://cursor.com',
          tags: ['ide', 'agentic', 'code'],
          submittedBy: 'user_creator_01',
          status: 'PENDING_REVIEW',
          createdAt: serverTimestamp(),
        })
      );

      // Step B: User 1 cannot self-approve their own submission (status must remain PENDING_REVIEW)
      await assertFails(
        updateDoc(doc(user1, 'toolSubmissions', submissionId), {
          status: 'APPROVED',
        })
      );

      // Step C: Unauthenticated users cannot modify submissions
      await assertFails(
        updateDoc(doc(anon, 'toolSubmissions', submissionId), {
          name: 'Hacked Submission',
        })
      );
    });

    await t.test('2. Multi-User Reviews & Upvote Independence Matrix', async () => {
      // Step A: User 1 casts an upvote for canonical tool
      const user1VoteId = `${canonicalTool}_user_creator_01`;
      await assertSucceeds(
        setDoc(doc(user1, 'toolUpvotes', user1VoteId), {
          toolId: canonicalTool,
          userId: 'user_creator_01',
          createdAt: serverTimestamp(),
        })
      );

      // Step B: User 2 also casts an upvote for the same canonical tool
      const user2VoteId = `${canonicalTool}_user_reviewer_02`;
      await assertSucceeds(
        setDoc(doc(user2, 'toolUpvotes', user2VoteId), {
          toolId: canonicalTool,
          userId: 'user_reviewer_02',
          createdAt: serverTimestamp(),
        })
      );

      // Step C: User 2 CANNOT delete or modify User 1's upvote
      await assertFails(
        deleteDoc(doc(user2, 'toolUpvotes', user1VoteId))
      );

      // Step D: User 1 submits review
      const user1ReviewId = `user_creator_01_${canonicalTool}`;
      await assertSucceeds(
        setDoc(doc(user1, 'reviews', user1ReviewId), {
          toolId: canonicalTool,
          userId: 'user_creator_01',
          userName: 'Creator One',
          rating: 5,
          text: 'Exceptional tool in my daily workflow.',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      // Step E: User 2 submits their independent review on the same tool
      const user2ReviewId = `user_reviewer_02_${canonicalTool}`;
      await assertSucceeds(
        setDoc(doc(user2, 'reviews', user2ReviewId), {
          toolId: canonicalTool,
          userId: 'user_reviewer_02',
          userName: 'Reviewer Two',
          rating: 4,
          text: 'Solid performance, good documentation.',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      // Step F: User 1 CANNOT tamper with User 2's review
      await assertFails(
        updateDoc(doc(user1, 'reviews', user2ReviewId), {
          text: 'Vandalized review by user 1',
          updatedAt: serverTimestamp(),
        })
      );

      // Step G: Unauthenticated user can read reviews
      await assertSucceeds(
        getDoc(doc(anon, 'reviews', user1ReviewId))
      );
    });

    await t.test('3. Stack CRUD Lifecycle & Strict Cross-User Ownership Boundaries', async () => {
      const stackId = 'stack_creator_01_core';

      // Step A: User 1 creates stack
      await assertSucceeds(
        setDoc(doc(user1, 'stacks', stackId), {
          id: stackId,
          userId: 'user_creator_01',
          name: 'Creator 1 Full-Stack Arsenal',
          toolIds: [canonicalTool, canonicalTool2],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      // Step B: Anyone (including unauthenticated users) can read the public stack
      await assertSucceeds(
        getDoc(doc(anon, 'stacks', stackId))
      );

      // Step C: User 1 updates their stack
      await assertSucceeds(
        updateDoc(doc(user1, 'stacks', stackId), {
          name: 'Creator 1 Updated Arsenal',
          toolIds: [canonicalTool],
          updatedAt: serverTimestamp(),
        })
      );

      // Step D: User 2 tries to update User 1 stack -> DENIED
      await assertFails(
        updateDoc(doc(user2, 'stacks', stackId), {
          name: 'Hijacked Stack',
          updatedAt: serverTimestamp(),
        })
      );

      // Step E: User 2 tries to delete User 1 stack -> DENIED
      await assertFails(
        deleteDoc(doc(user2, 'stacks', stackId))
      );

      // Step F: User 1 deletes their own stack -> ALLOWED
      await assertSucceeds(
        deleteDoc(doc(user1, 'stacks', stackId))
      );
    });

    await testEnv.cleanup();
  }

  await t.test('4. Gemini BYOK Resilient Error Path Handling', async () => {
    // Test that when an invalid BYOK key is in localStorage, chatWithGemini handles error gracefully
    // Mock localStorage environment
    const storage: Record<string, string> = {
      'USER_GEMINI_API_KEY': 'AIza_fake_invalid_user_key_999999999'
    };
    (globalThis as any).localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
    };

    const response = await chatWithGemini('Recommend an AI stack for Next.js');
    assert.ok(typeof response === 'string', 'Should return a user-friendly string response');
    assert.ok(
      response.includes('invalid') || response.includes('Profile Settings') || response.includes('BYOK Error') || response.includes('unable'),
      'Should return friendly BYOK error notification without crashing'
    );
  });

  await t.test('5. AI Workflow Suggestion Whitelist & Task Boundary Invariants', async () => {
    const { buildWorkflowSystemInstruction } = await import('../server/services/aiService');
    const instruction = buildWorkflowSystemInstruction();

    // 1. Must explicitly enforce task constraint (suggesting workflows only)
    assert.ok(
      instruction.includes('YOUR SINGLE EXCLUSIVE TASK: You suggest step-by-step AI workflow toolchains'),
      'Instruction must constrain task strictly to workflow toolchains'
    );
    assert.ok(
      instruction.includes('Reject any non-workflow questions'),
      'Instruction must explicitly mandate rejection of non-workflow questions'
    );

    // 2. Must explicitly enforce canonical whitelist boundary
    assert.ok(
      instruction.includes('STRICTLY FORBIDDEN from suggesting, inventing, or referencing any model or tool NOT present in the JengaForge catalog'),
      'Instruction must forbid external models and tools'
    );

    // 3. Verify all canonical tool IDs are embedded in the prompt whitelist
    const allRepoToolIds = TOOLS_REGISTRY.filter(t => t.status === "Active").map(t => t.id);
    for (const id of allRepoToolIds) {
      assert.ok(instruction.includes(`"${id}"`), `Tool ID ${id} must be included in the whitelist`);
    }
  });
});

