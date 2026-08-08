const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching Headless Browser...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 } // iPhone 12 Pro dimensions
  });
  const page = await browser.newPage();
  const destDir = path.join(__dirname, '../ui-ux-project/public/case-studies/pureloop');

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: path.join(destDir, 'Home screen.png') });
  console.log('Saved Home screen.png');

  // Click provider
  const providers = await page.$$('h4');
  for (const p of providers) {
    const text = await page.evaluate(el => el.textContent, p);
    if (text === 'Wash & Fold Pro') {
      await p.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Click Book Now
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text === 'Book Now') {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(destDir, 'Booking - 1.png') });
  console.log('Saved Booking - 1.png');

  // Add an item to enable checkout
  const plusButtons = await page.$$('button');
  for (const b of plusButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text === '+') {
      await b.click();
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Scroll down to schedule section
  await page.evaluate(() => {
    const container = document.querySelector('.overflow-y-auto');
    if(container) container.scrollBy(0, 400);
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(destDir, 'Booking - 2.png') });
  console.log('Saved Booking - 2.png');

  // Click Checkout
  const checkoutButtons = await page.$$('button');
  for (const b of checkoutButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text === 'Checkout') {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(destDir, 'Payment portal.png') });
  console.log('Saved Payment portal.png');

  // Click Pay
  const payButtons = await page.$$('button');
  for (const b of payButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Pay ₹')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3000)); // wait for processing and transition to tracking

  await page.screenshot({ path: path.join(destDir, 'Live tracking.png') });
  console.log('Saved Live tracking.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
