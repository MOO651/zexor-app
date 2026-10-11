export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:4232/#property');
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 950));
  await page.waitForTimeout(900);
  await page.locator('article').first().screenshot({ path: 'card-prop.png' });
  await page.goto('http://localhost:4232/#cars');
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, 950));
  await page.waitForTimeout(900);
  await page.locator('article').first().screenshot({ path: 'card-car.png' });
  return { ok: true };
}
