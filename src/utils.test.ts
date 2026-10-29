import { strict as assert } from 'node:assert';
import test from 'node:test';
import { DEFAULT_LOCALE, formatNumber, mergeSettings, money } from './utils.ts';

// Pure helpers are exercised with Node's built-in test runner (no extra dependencies):
//   node --experimental-strip-types --test src/utils.test.ts
test('mergeSettings preserves new defaults and stored nested settings', () => {
  const defaults = { title: 'Store', theme: { primary: '#000', radius: 12 }, enabled: true };
  assert.deepEqual(mergeSettings(defaults, { theme: { primary: '#abc' }, enabled: false }), {
    title: 'Store', theme: { primary: '#abc', radius: 12 }, enabled: false,
  });
});

test('locale and currency helpers keep prices stable in both languages', () => {
  assert.equal(DEFAULT_LOCALE, 'ar');
  assert.equal(formatNumber(1250000), '1,250,000');
  assert.equal(money(1250, 'eg', 'ar'), '1,250 جم');
  assert.equal(money(1250, 'ksa', 'en'), '1,250 SAR');
});
