export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:4231/#property');
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(1000);
  const card = page.locator('article').first();
  const b = await card.boundingBox();
  await card.screenshot({ path: 'one-card.png' });
  return { cardH: Math.round(b.height), cardW: Math.round(b.width) };
}
