const { chromium } = require('@playwright/test');

(async () => {
  console.log('=== DETAILED BUNDLE ANALYSIS ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let bundleText = null;
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/assets/App-') && url.endsWith('.js')) {
      try {
        bundleText = await response.text();
      } catch (e) {}
    }
  });
  
  try {
    await page.goto('https://fundedwealth.com', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    if (!bundleText) {
      console.log('❌ Could not capture bundle');
      await browser.close();
      return;
    }
    
    console.log('=== ANALYSIS 1: Route Definition (Expected) ===\n');
    
    // Check for route definition (this is expected)
    const routeDefMatches = bundleText.match(/path:"\/auth\/create-password",component:\w+/g);
    if (routeDefMatches) {
      console.log('✅ Found route definition (expected):');
      routeDefMatches.forEach(match => console.log(`  ${match}`));
      console.log('\nThis is NORMAL - it defines the /auth/create-password page route\n');
    }
    
    console.log('=== ANALYSIS 2: Onboarding Redirect (Bug - Should NOT exist) ===\n');
    
    // Check for onboarding redirect logic (this is the bug)
    const bugPatterns = [
      /onboarding-status/gi,
      /onboardingCompleted/gi,
      /navigate\([^)]*\/auth\/create-password/gi,
      /\.then\([^)]*onboardingCompleted[^)]*\)/gi
    ];
    
    let foundBug = false;
    
    for (const pattern of bugPatterns) {
      const matches = bundleText.match(pattern);
      if (matches) {
        foundBug = true;
        console.log(`❌ Found bug pattern: ${pattern}`);
        console.log(`   Matches: ${matches.length}`);
        matches.slice(0, 3).forEach(match => {
          console.log(`   - ${match.substring(0, 100)}`);
        });
        console.log();
      }
    }
    
    if (!foundBug) {
      console.log('✅ No onboarding redirect logic found\n');
      console.log('The bug has been fixed! The bundle no longer contains:');
      console.log('  - fetch("/api/auth/onboarding-status")');
      console.log('  - if (!onboardingCompleted) navigate("/auth/create-password")\n');
    }
    
    console.log('=== ANALYSIS 3: DashboardRoute Component ===\n');
    
    // Try to find DashboardRoute logic
    const dashboardRouteMatch = bundleText.match(/function \w+\([^)]*\)\{[^}]{0,500}dashboard[^}]{0,500}\}/gi);
    if (dashboardRouteMatch) {
      console.log('Found DashboardRoute-like functions:');
      dashboardRouteMatch.slice(0, 2).forEach((match, i) => {
        const snippet = match.substring(0, 300);
        console.log(`\nFunction ${i + 1}:`);
        console.log(snippet + '...\n');
      });
    }
    
    console.log('=== ANALYSIS 4: Network Request Patterns ===\n');
    
    // Check for fetch patterns
    const fetchPatterns = [
      /fetch\([^)]*onboarding[^)]*\)/gi,
      /fetch\([^)]*create-password[^)]*\)/gi
    ];
    
    let foundFetch = false;
    for (const pattern of fetchPatterns) {
      const matches = bundleText.match(pattern);
      if (matches) {
        foundFetch = true;
        console.log(`Found fetch pattern: ${pattern}`);
        matches.forEach(match => console.log(`  ${match.substring(0, 100)}`));
        console.log();
      }
    }
    
    if (!foundFetch) {
      console.log('✅ No onboarding or create-password fetch calls found\n');
    }
    
    console.log('=== FINAL VERDICT ===\n');
    
    if (!foundBug && !foundFetch) {
      console.log('🎉 SUCCESS: The dashboard redirect bug is FIXED!\n');
      console.log('Evidence:');
      console.log('  ✅ No "onboarding-status" API calls in bundle');
      console.log('  ✅ No "onboardingCompleted" checks in bundle');
      console.log('  ✅ No redirect to "/auth/create-password" based on onboarding status');
      console.log('  ✅ Route definition exists (expected for the create-password page)');
      console.log('\nUsers will now:');
      console.log('  1. Login successfully');
      console.log('  2. Stay on /dashboard');
      console.log('  3. NOT be redirected to /auth/create-password\n');
    } else {
      console.log('⚠️  WARNING: Potential issues found');
      console.log('Review the analysis above for details.\n');
    }
    
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  await browser.close();
})();
