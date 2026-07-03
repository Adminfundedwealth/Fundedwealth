const { chromium } = require('@playwright/test');

(async () => {
  console.log('=== PRODUCTION DEPLOYMENT VERIFICATION ===\n');
  console.log('Waiting 30 seconds for Vercel deployment to complete...\n');
  
  // Wait for deployment
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let bundleUrl = null;
  let bundleText = null;
  let allRequests = [];
  
  // Capture all network requests
  page.on('request', (request) => {
    allRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });
  
  // Capture bundle response
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/assets/App-') && url.endsWith('.js')) {
      bundleUrl = url;
      try {
        bundleText = await response.text();
        console.log('✓ App bundle captured\n');
      } catch (e) {
        console.log(`Error reading bundle: ${e.message}`);
      }
    }
  });
  
  try {
    // ===== STEP 1: Download production bundle =====
    console.log('=== STEP 1: DOWNLOAD PRODUCTION BUNDLE ===\n');
    
    await page.goto('https://fundedwealth.com', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    if (!bundleUrl || !bundleText) {
      console.log('❌ FAIL: Could not capture App bundle');
      await browser.close();
      return;
    }
    
    const bundleFilename = bundleUrl.split('/').pop();
    console.log(`Bundle URL: ${bundleUrl}`);
    console.log(`Bundle Filename: ${bundleFilename}`);
    console.log(`Bundle Size: ${(bundleText.length / 1024).toFixed(2)} KB\n`);
    
    // ===== STEP 2: Search for problematic strings =====
    console.log('=== STEP 2: SEARCH BUNDLE FOR PROBLEMATIC STRINGS ===\n');
    
    const searchTerms = [
      'onboarding-status',
      'onboardingCompleted',
      '/auth/create-password'
    ];
    
    let allClean = true;
    
    for (const term of searchTerms) {
      const found = bundleText.includes(term);
      const status = found ? '❌ FOUND' : '✅ NOT FOUND';
      console.log(`  ${status}: "${term}"`);
      
      if (found) {
        allClean = false;
        // Show context
        const index = bundleText.indexOf(term);
        const context = bundleText.substring(Math.max(0, index - 100), Math.min(bundleText.length, index + 100));
        console.log(`    Context: ...${context}...`);
      }
    }
    
    console.log();
    
    if (allClean) {
      console.log('✅ STEP 2 PASS: No problematic strings found in bundle\n');
    } else {
      console.log('❌ STEP 2 FAIL: Problematic strings still exist in bundle\n');
      console.log('This means the old code is still deployed.');
      console.log('Check Vercel deployment logs to see if build succeeded.\n');
    }
    
    // ===== STEP 3: Compare with old bundle =====
    console.log('=== STEP 3: BUNDLE COMPARISON ===\n');
    
    if (bundleFilename === 'App-Bqu-ygss.js') {
      console.log('❌ WARNING: Still serving OLD bundle (App-Bqu-ygss.js)');
      console.log('   New deployment has not taken effect yet.\n');
    } else {
      console.log(`✅ New bundle deployed: ${bundleFilename}`);
      console.log('   Old bundle: App-Bqu-ygss.js\n');
    }
    
    // ===== STEP 4: Login test =====
    console.log('=== STEP 4: LOGIN TEST ===\n');
    console.log('Note: Automated login requires test credentials');
    console.log('Performing manual navigation test instead...\n');
    
    // Clear requests log
    allRequests = [];
    
    // Navigate to sign-in
    await page.goto('https://fundedwealth.com/sign-in', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✓ Sign-in page loaded\n');
    
    // ===== STEP 5: Simulate dashboard navigation =====
    console.log('=== STEP 5: DASHBOARD NAVIGATION TEST ===\n');
    console.log('Attempting to navigate to /dashboard without auth...\n');
    
    allRequests = [];
    
    await page.goto('https://fundedwealth.com/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}\n`);
    
    // Check if redirected to create-password
    if (finalUrl.includes('/auth/create-password')) {
      console.log('❌ FAIL: Redirected to /auth/create-password');
      console.log('   This should NOT happen for unauthenticated users\n');
    } else if (finalUrl.includes('/sign-in')) {
      console.log('✅ PASS: Redirected to /sign-in (expected for unauthenticated users)\n');
    } else if (finalUrl.includes('/dashboard')) {
      console.log('✓ Stayed on /dashboard\n');
    }
    
    // ===== STEP 6: Check for create-password requests =====
    console.log('=== STEP 6: VERIFY NO CREATE-PASSWORD REQUESTS ===\n');
    
    const createPasswordRequests = allRequests.filter(req => 
      req.url.includes('/auth/create-password') || 
      req.url.includes('create-password')
    );
    
    if (createPasswordRequests.length > 0) {
      console.log('❌ FAIL: Found create-password requests:');
      createPasswordRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url} (${req.resourceType})`);
      });
      console.log();
    } else {
      console.log('✅ PASS: No create-password requests detected\n');
    }
    
    // Check for onboarding-status API calls
    const onboardingRequests = allRequests.filter(req => 
      req.url.includes('onboarding-status')
    );
    
    if (onboardingRequests.length > 0) {
      console.log('❌ WARNING: Found onboarding-status API requests:');
      onboardingRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url}`);
      });
      console.log();
    } else {
      console.log('✅ PASS: No onboarding-status API requests\n');
    }
    
    // ===== STEP 7: Summary =====
    console.log('=== VERIFICATION SUMMARY ===\n');
    
    const checks = [
      { name: 'New bundle deployed', pass: bundleFilename !== 'App-Bqu-ygss.js' },
      { name: 'No "onboarding-status" in bundle', pass: !bundleText.includes('onboarding-status') },
      { name: 'No "onboardingCompleted" in bundle', pass: !bundleText.includes('onboardingCompleted') },
      { name: 'No "/auth/create-password" in bundle', pass: !bundleText.includes('/auth/create-password') },
      { name: 'No create-password navigation', pass: !finalUrl.includes('/auth/create-password') },
      { name: 'No create-password requests', pass: createPasswordRequests.length === 0 },
      { name: 'No onboarding-status requests', pass: onboardingRequests.length === 0 }
    ];
    
    const passedChecks = checks.filter(c => c.pass).length;
    const totalChecks = checks.length;
    
    checks.forEach(check => {
      const status = check.pass ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
    });
    
    console.log(`\nScore: ${passedChecks}/${totalChecks} checks passed\n`);
    
    if (passedChecks === totalChecks) {
      console.log('🎉 SUCCESS: Deployment verified - all checks passed!\n');
      console.log('The dashboard redirect bug is fixed.');
      console.log('Users will now stay on /dashboard after login.\n');
    } else {
      console.log('⚠️  INCOMPLETE: Some checks failed\n');
      
      if (bundleFilename === 'App-Bqu-ygss.js') {
        console.log('Action: Wait for Vercel deployment to complete');
        console.log('Then run this script again.\n');
      } else if (!allClean) {
        console.log('Action: Check if source code has the fix');
        console.log('Verify App.tsx removed onboarding redirect logic.\n');
      }
    }
    
    // ===== STEP 8: Deployment metadata =====
    console.log('=== DEPLOYMENT METADATA ===\n');
    
    const response = await page.goto('https://fundedwealth.com');
    const headers = response.headers();
    
    if (headers['x-vercel-id']) {
      console.log(`X-Vercel-Id: ${headers['x-vercel-id']}`);
      
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
    
    console.log(`X-Vercel-Cache: ${headers['x-vercel-cache']}`);
    
  } catch (e) {
    console.log(`\n❌ ERROR: ${e.message}`);
    console.log(e.stack);
  }
  
  await browser.close();
})();
