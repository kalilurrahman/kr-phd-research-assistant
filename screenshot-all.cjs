const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const pages = [
    { name: 'home', url: 'https://kr-phd-research-assistant.lovable.app/' },
    { name: 'hub', url: 'https://kr-phd-research-assistant.lovable.app/research-hub' },
    { name: 'resources', url: 'https://kr-phd-research-assistant.lovable.app/resources' },
    { name: 'admin', url: 'https://kr-phd-research-assistant.lovable.app/admin' }
  ];

  for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: theme });

      for (const p of pages) {
          console.log(`Taking screenshot for ${p.name} in ${theme} mode...`);
          await page.goto(p.url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000); // Wait for animations

          // Also try scrolling down slightly to get more content
          await page.screenshot({ path: `screenshots/${p.name}_${theme}.png`, fullPage: false });
      }
  }

  await browser.close();
})();
