const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('=== CHECKING PRODUCTION DEPLOYMENT METADATA ===\n');
  
  try {
    await page.goto('https://fundedwealth.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check for Vercel deployment headers
    const headers = await page.evaluate(() => {
      return {
        xVercelId: document.querySelector('meta[name="x-vercel-id"]')?.content,
        xVercelCache: document.querySelector('meta[name="x-vercel-cache"]')?.content,
      };
    });
    
    console.log('Meta tags:');
    console.log(`  x-vercel-id: ${headers.xVercelId || 'not found'}`);
    console.log(`  x-vercel-cache: ${headers.xVercelCache || 'not found'}`);
    
    // Check response headers for deployment info
    const response = await page.goto('https://fundedwealth.com', { waitUntil: 'domcontentloaded' });
    const responseHeaders = response.headers();
    
    console.log('\nResponse headers:');
    Object.keys(responseHeaders)
      .filter(k => k.includes('vercel') || k.includes('x-') || k === 'server' || k === 'via')
      .forEach(k => {
        console.log(`  ${k}: ${responseHeaders[k]}`);
      });
    
    // Check if there's a deployment info in the page
    const deploymentInfo = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      for (const script of scripts) {
        if (script.textContent.includes('VERCEL') || script.textContent.includes('deployment')) {
          return script.textContent.substring(0, 500);
        }
      }
      return null;
    });
    
    if (deploymentInfo) {
      console.log('\nDeployment info in scripts:');
      console.log(deploymentInfo);
    }
    
    // Fetch the bundle and check for build metadata
    console.log('\n=== CHECKING BUNDLE BUILD INFO ===\n');
    
    const bundleResponse = await page.goto('https://www.fundedwealth.com/assets/App-Bqu-ygss.js');
    const bundleHeaders = bundleResponse.headers();
    
    console.log('Bundle headers:');
    Object.keys(bundleHeaders)
      .filter(k => k.includes('etag') || k.includes('last-modified') || k.includes('date') || k.includes('cache'))
      .forEach(k => {
        console.log(`  ${k}: ${bundleHeaders[k]}`);
      });
    
    // Check bundle content for any git hash or build metadata
    const bundleText = await bundleResponse.text();
    const gitHashMatch = bundleText.match(/[a-f0-9]{7,40}/g);
    if (gitHashMatch) {
      console.log('\nPotential git hashes in bundle (first 10):');
      gitHashMatch.slice(0, 10).forEach(hash => console.log(`  ${hash}`));
    }
    
    // Look for build timestamp or version info
    const buildInfoMatch = bundleText.match(/(build|version|commit|date):?\s*["']?([^"'\s,}]+)/gi);
    if (buildInfoMatch) {
      console.log('\nBuild info found in bundle:');
      buildInfoMatch.slice(0, 5).forEach(info => console.log(`  ${info}`));
    }
    
  } catch (e) {
    console.log(`\nError: ${e.message}`);
  }
  
  await browser.close();
  
  console.log('\n=== CHECKING LOCAL GIT HISTORY ===\n');
})();
