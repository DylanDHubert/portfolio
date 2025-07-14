const puppeteer = require('puppeteer');
const path = require('path');

async function generateOGImage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to standard OG image size
  await page.setViewport({ width: 1200, height: 630 });
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, 'public/images/og/generate-og.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for fonts to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Take screenshot
  await page.screenshot({
    path: path.join(__dirname, 'public/images/og/home.jpg'),
    type: 'jpeg',
    quality: 90
  });
  
  await browser.close();
  console.log('OG image generated successfully!');
}

generateOGImage().catch(console.error); 