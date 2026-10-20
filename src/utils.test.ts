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

  test('older settings retain new editable content defaults', () => {
    const defaults = {
      sectionVisibility: { cards: true, faq: true },
      content: {
        ctaTitle: { ar: 'عنوان افتراضي', en: 'Default title' },
        faqItems: [{ id: 'faq', question: { ar: 'سؤال', en: 'Question' }, answer: { ar: 'إجابة', en: 'Answer' } }],
        stats: [{ id: 'stat', value: 'AR · EN', label: { ar: 'لغتان', en: 'Two languages' } }],
        agencyProjects: [{ id: 'project', title: { ar: 'مشروع', en: 'Project' } }],
      },
    };
    const merged = mergeSettings(defaults, {
      sectionVisibility: { cards: false },
      content: { ctaTitle: { ar: 'عنوان محفوظ', en: 'Saved title' } },
    });

    assert.equal(merged.sectionVisibility.cards, false);
    assert.equal(merged.sectionVisibility.faq, true);
    assert.equal(merged.content.faqItems.length, 1);
    assert.equal(merged.content.stats.length, 1);
    assert.equal(merged.content.agencyProjects.length, 1);
    assert.deepEqual(merged.content.ctaTitle, { ar: 'عنوان محفوظ', en: 'Saved title' });
  });
});
