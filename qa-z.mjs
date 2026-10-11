export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:4234/#cars');
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 950));
  await page.waitForTimeout(900);
  await page.locator('article').first().screenshot({ path: 'card-car.png' });
  return { ok: true };
}
