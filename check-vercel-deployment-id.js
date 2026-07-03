const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('=== VERCEL DEPLOYMENT ID ANALYSIS ===\n');
  
  try {
    const response = await page.goto('https://fundedwealth.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const headers = response.headers();
    
    // Extract Vercel deployment ID
    const vercelId = headers['x-vercel-id'];
    console.log(`X-Vercel-Id: ${vercelId}`);
    
    if (vercelId) {
      // Parse deployment ID: region::deployment-timestamp-hash
      const parts = vercelId.split('::');
      if (parts.length === 2) {
        console.log(`  Region: ${parts[0]}`);
        const deploymentParts = parts[1].split('-');
        if (deploymentParts.length >= 2) {
          const timestamp = deploymentParts[1];
          console.log(`  Deployment Timestamp: ${timestamp}`);
          
          // Convert timestamp to readable date
          const date = new Date(parseInt(timestamp));
          console.log(`  Deployment Date: ${date.toISOString()}`);
          console.log(`  Deployment Date (IST): ${date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
        }
      }
    }
    
    console.log(`\nX-Vercel-Cache: ${headers['x-vercel-cache']}`);
    console.log(`\nBundle last-modified: ${headers['last-modified']}`);
    
    // Fetch bundle
    const bundleResp = await page.goto('https://www.fundedwealth.com/assets/App-Bqu-ygss.js');
    const bundleHeaders = bundleResp.headers();
    
    console.log('\n=== BUNDLE METADATA ===');
    console.log(`Last-Modified: ${bundleHeaders['last-modified']}`);
    console.log(`ETag: ${bundleHeaders['etag']}`);
    
    if (bundleHeaders['last-modified']) {
      const bundleDate = new Date(bundleHeaders['last-modified']);
      console.log(`Bundle Build Date: ${bundleDate.toISOString()}`);
      console.log(`Bundle Build Date (IST): ${bundleDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    }
    
  } catch (e) {
    console.log(`\nError: ${e.message}`);
  }
  
  await browser.close();
})();
