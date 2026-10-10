import { strict as assert } from 'node:assert';
import test from 'node:test';
import { ADMIN_PASSWORD_FALLBACK, resolveAdminPassword } from './utils.ts';

// The project has no test runner wired up yet, but the pure helpers in utils.ts
// can be exercised with the Node.js built-in test runner (no dependencies):
//   node --experimental-strip-types --test src/utils.test.ts
test('resolveAdminPassword falls back when VITE_ADMIN_PASSWORD is undefined', () => {
  assert.equal(resolveAdminPassword(undefined), ADMIN_PASSWORD_FALLBACK);
});

test('resolveAdminPassword falls back when the env value is blank or whitespace', () => {
  assert.equal(resolveAdminPassword(''), ADMIN_PASSWORD_FALLBACK);
  assert.equal(resolveAdminPassword('   '), ADMIN_PASSWORD_FALLBACK);
});

test('resolveAdminPassword uses the configured env value', () => {
  assert.equal(resolveAdminPassword('s3cret-studio'), 's3cret-studio');
});
