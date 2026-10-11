export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [r, n] of [['#cars','cars'], ['#property','property']]) {
    await page.goto('http://localhost:4231/' + r);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'sec-' + n + '.png' });
  }
  return { ok: true };
}
