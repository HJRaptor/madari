import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    devtools: true,
    headless: false, // This makes the browser visible
    defaultViewport: null, // This ensures the viewport is at full window size
    args: ['--start-maximized'], // This starts the browser maximized
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.bringToFront();
  await page.waitForTimeout(10000000);
  await browser.close();
})();
