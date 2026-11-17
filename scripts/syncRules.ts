import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { TOOLS_REGISTRY } from '../constants';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');

export function syncFirestoreRules(): void {
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  const startMarker = '// CANONICAL_TOOL_IDS_START';
  const endMarker = '// CANONICAL_TOOL_IDS_END';

  const startIndex = rulesContent.indexOf(startMarker);
  const endIndex = rulesContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Markers ${startMarker} and ${endMarker} not found in firestore.rules`);
  }

  const idsFormatted = TOOLS_REGISTRY.map(t => `        '${t.id}'`).join(',\n');
  const replacement = `${startMarker}\n    function canonicalToolIds() {\n      return [\n${idsFormatted}\n      ];\n    }\n    ${endMarker}`;

  const currentSegment = rulesContent.substring(startIndex, endIndex + endMarker.length);
  if (currentSegment === replacement) {
    console.log('[syncRules] firestore.rules canonicalToolIds already synchronized with TOOLS_REGISTRY.');
    return;
  }

  const updatedRules = rulesContent.substring(0, startIndex) + replacement + rulesContent.substring(endIndex + endMarker.length);
  fs.writeFileSync(rulesPath, updatedRules, 'utf-8');
  console.log(`[syncRules] Successfully synchronized ${TOOLS_REGISTRY.length} canonical tools to firestore.rules.`);
}

// Execute only when run directly from CLI
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  syncFirestoreRules();
}
