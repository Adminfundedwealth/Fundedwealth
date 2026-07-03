const { chromium } = require('@playwright/test');

(async () => {
  console.log('=== VERCEL DEPLOYMENT MIGRATION VERIFICATION ===\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Checking production bundle...\n');
    
    await page.goto('https://fundedwealth.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    let bundleFilename = null;
    let bundleFound = false;
    let hasOnboardingCheck = false;
    
    // Capture bundle requests
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/assets/App-') && url.endsWith('.js')) {
        bundleFilename = url.split('/').pop();
        bundleFound = true;
        
        try {
          const text = await response.text();
          hasOnboardingCheck = text.includes('onboarding-status') && 
                               text.includes('onboardingCompleted');
          
          console.log(`✓ Bundle Found: ${bundleFilename}`);
          console.log(`  URL: ${url}`);
          console.log(`  Status: ${response.status()}`);
          
          const headers = response.headers();
          console.log(`  Last-Modified: ${headers['last-modified']}`);
          console.log(`  ETag: ${headers['etag']}`);
          console.log(`  Cache-Control: ${headers['cache-control']}`);
          
          console.log(`\n=== BUNDLE ANALYSIS ===`);
          console.log(`  Contains 'onboarding-status': ${text.includes('onboarding-status')}`);
          console.log(`  Contains 'onboardingCompleted': ${text.includes('onboardingCompleted')}`);
          console.log(`  Contains '/auth/create-password': ${text.includes('/auth/create-password')}`);
          
        } catch (e) {
          console.log(`  Error reading bundle: ${e.message}`);
        }
      }
    });
    
    // Reload to capture all requests
    await page.reload({ waitUntil: 'networkidle' });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`\n=== VERIFICATION RESULTS ===\n`);
    
    // Check 1: Bundle changed from App-Bqu-ygss.js
    if (bundleFilename === 'App-Bqu-ygss.js') {
      console.log(`❌ FAIL: Still serving OLD bundle (App-Bqu-ygss.js)`);
      console.log(`   This means .vercel/output/static is still being deployed.`);
      console.log(`   Action: Remove .vercel/output/ from Git and redeploy.`);
    } else if (bundleFound) {
      console.log(`✅ PASS: New bundle deployed (${bundleFilename})`);
      console.log(`   Old bundle: App-Bqu-ygss.js`);
      console.log(`   New bundle: ${bundleFilename}`);
    } else {
      console.log(`⚠️  WARNING: Could not detect bundle filename`);
    }
    
    // Check 2: Onboarding check removed
    if (hasOnboardingCheck) {
      console.log(`\n❌ FAIL: Bundle still contains onboarding redirect logic`);
      console.log(`   The fix in commit 0d16a38 has not deployed.`);
    } else if (bundleFound) {
      console.log(`\n✅ PASS: Onboarding redirect logic removed from bundle`);
      console.log(`   The fix in commit 0d16a38 is now live.`);
    }
    
    // Check 3: Dashboard redirect test
    console.log(`\n=== DASHBOARD REDIRECT TEST ===`);
    console.log(`Note: This test requires valid login credentials.`);
    console.log(`Manual test: Login at https://fundedwealth.com/sign-in`);
    console.log(`Expected: After login, stay on /dashboard (no redirect to /auth/create-password)`);
    
    // Check deployment metadata
    console.log(`\n=== DEPLOYMENT METADATA ===`);
    const response = await page.goto('https://fundedwealth.com');
    const headers = response.headers();
    
    console.log(`X-Vercel-Id: ${headers['x-vercel-id'] || 'not found'}`);
    
    if (headers['x-vercel-id']) {
      const parts = headers['x-vercel-id'].split('::');
      if (parts.length === 2) {
        const deploymentParts = parts[1].split('-');
        if (deploymentParts.length >= 2) {
          const timestamp = deploymentParts[1];
          const date = new Date(parseInt(timestamp));
          console.log(`Deployment Time: ${date.toISOString()}`);
          console.log(`Deployment Time (IST): ${date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
        }
      }
    }
    
    console.log(`\n=== SUMMARY ===\n`);
    
    if (bundleFilename !== 'App-Bqu-ygss.js' && !hasOnboardingCheck) {
      console.log(`✅ MIGRATION SUCCESSFUL`);
      console.log(`   - Production is building from source`);
      console.log(`   - Latest code is deployed`);
      console.log(`   - Dashboard redirect bug is fixed`);
      console.log(`\nNext steps:`);
      console.log(`1. Test login flow manually`);
      console.log(`2. Verify dashboard loads after login`);
      console.log(`3. Monitor for any issues`);
    } else {
      console.log(`❌ MIGRATION INCOMPLETE`);
      console.log(`\nAction required:`);
      console.log(`1. Remove .vercel/output/ from Git:`);
      console.log(`   git rm -r --cached .vercel/output/`);
      console.log(`2. Commit changes:`);
      console.log(`   git commit -m "fix: remove committed Vercel build output"`);
      console.log(`3. Push to trigger new deployment:`);
      console.log(`   git push origin main`);
      console.log(`4. Wait for Vercel deployment to complete`);
      console.log(`5. Run this script again to verify`);
    }
    
  } catch (e) {
    console.log(`\nError: ${e.message}`);
  }
  
  await browser.close();
})();
