const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Launching Headless Browser...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 } // iPhone 12 Pro dimensions
  });
  const page = await browser.newPage();

  // Create images directory in the case study folder
  const imagesDir = path.join(__dirname, '../laundry-case-study/images');
  if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
  }

  console.log('🌐 Navigating to Netlify app...');
  await page.goto('https://pureloppapp.netlify.app/');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('📸 Capturing Splash Screen...');
  await page.screenshot({ path: path.join(imagesDir, 'v2-splash.png') });
  console.log('✅ Saved ../laundry-case-study/images/v2-splash.png');

  await new Promise(r => setTimeout(r, 3000));
  
  console.log('📸 Capturing Onboarding Screen...');
  await page.screenshot({ path: path.join(imagesDir, 'v2-onboarding.png') });
  console.log('✅ Saved ../laundry-case-study/images/v2-onboarding.png');

  await browser.close();
  console.log('🎉 Done! Your V2 screenshots are ready in the case study folder.');
})();
