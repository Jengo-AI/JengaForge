import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS_REGISTRY, FEATURED_STACKS } from '../constants';

test('Registry: Data Integrity and October 2026 Ground Truth', async (t) => {
  await t.test('all tools have required schema properties', () => {
    assert.ok(TOOLS_REGISTRY.length > 20, 'Should have rich tool library');

    for (const tool of TOOLS_REGISTRY) {
      assert.ok(tool.id && typeof tool.id === 'string', `Tool ID missing: ${JSON.stringify(tool)}`);
      assert.ok(tool.name && typeof tool.name === 'string', `Tool name missing for ${tool.id}`);
      assert.ok(tool.category, `Category missing for ${tool.id}`);
      assert.ok(['Free', 'Freemium', 'Paid', 'Enterprise'].includes(tool.pricing), `Invalid pricing for ${tool.id}`);
      assert.ok(typeof tool.rating === 'number' && tool.rating >= 1 && tool.rating <= 5, `Invalid rating for ${tool.id}`);
      assert.ok(tool.status === 'Active' || tool.status === 'Watch' || tool.status === 'Deprecated', `Invalid status for ${tool.id}`);
      assert.equal(tool.lastVerified, 'October 2026', `Stale lastVerified for ${tool.id}`);
      assert.ok(tool.specs, `Specs missing for ${tool.id}`);
      assert.ok(typeof tool.specs.power === 'number');
      assert.ok(typeof tool.specs.easeOfUse === 'number');
    }
  });

  await t.test('all featured stacks reference existing canonical tool IDs', () => {
    const canonicalIds = new Set(TOOLS_REGISTRY.map(t => t.id));

    for (const stack of FEATURED_STACKS) {
      assert.ok(stack.id);
      assert.ok(stack.name);
      assert.ok(Array.isArray(stack.tools) && stack.tools.length > 0);

      for (const toolId of stack.tools) {
        assert.ok(
          canonicalIds.has(toolId),
          `Featured stack "${stack.name}" references non-existent tool "${toolId}"`
        );
      }
    }
  });

  await t.test('deprecated tools are correctly labeled and not recommended as active', () => {
    const sora = TOOLS_REGISTRY.find(t => t.id === 'sora-interactive');
    assert.ok(sora, 'Sora entry should be cataloged for historical tracking');
    assert.equal(sora.status, 'Deprecated');
    assert.ok(sora.deprecatedReason && sora.deprecatedReason.includes('Discontinued'));

    // Verify no active stack includes deprecated tools
    for (const stack of FEATURED_STACKS) {
      assert.equal(
        stack.tools.includes('sora-interactive'),
        false,
        `Stack "${stack.name}" must not recommend deprecated Sora`
      );
    }
  });
});
