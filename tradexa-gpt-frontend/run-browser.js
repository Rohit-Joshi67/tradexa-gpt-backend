import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173/login');
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'user3@tradexa.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button:has-text("Sign in")');
  
  try {
    await page.waitForSelector('text="Your journal is live"', { timeout: 15000 });
    console.log('SUCCESS!');
  } catch (e) {
    console.log('TIMEOUT');
  }
  
  await new Promise(r => setTimeout(r, 15000));
  await browser.close();
  process.exit(0);
})();
