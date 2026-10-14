import { strict as assert } from 'node:assert';
import test from 'node:test';
import { mergeSettings } from './utils.ts';

// The project has no test runner wired up yet, but the pure helpers in utils.ts
// can be exercised with the Node.js built-in test runner (no dependencies):
//   node --experimental-strip-types --test src/utils.test.ts
test('mergeSettings preserves new defaults and stored nested settings', () => {
  const defaults = { title: 'Store', theme: { primary: '#000', radius: 12 }, enabled: true };
  assert.deepEqual(mergeSettings(defaults, { theme: { primary: '#abc' }, enabled: false }), {
    title: 'Store', theme: { primary: '#abc', radius: 12 }, enabled: false,
  });
});
