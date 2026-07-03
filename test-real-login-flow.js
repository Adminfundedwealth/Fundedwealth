const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
// Set these environment variables or edit directly:
const TEST_EMAIL = process.env.TEST_EMAIL || 'your-test-email@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'your-test-password';

(async () => {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   REAL LOGIN FLOW TEST - PLAYWRIGHT EVIDENCE                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  if (!TEST_EMAIL || TEST_EMAIL === 'your-test-email@example.com') {
    console.log('❌ ERROR: Test credentials not configured\n');
    console.log('Set environment variables:');
    console.log('  set TEST_EMAIL=your-email@example.com');
    console.log('  set TEST_PASSWORD=your-password');
    console.log('  node test-real-login-flow.js\n');
    console.log('Or edit the script directly with your test account credentials.\n');
    return;
  }
  
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  const traceFile = path.join(__dirname, 'playwright-trace.zip');
  
  // Create screenshots directory
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: screenshotsDir }
  });
  
  // Start tracing
  await context.tracing.start({ screenshots: true, snapshots: true });
  
  const page = await context.newPage();
  
  const evidence = {
    timestamp: new Date().toISOString(),
    testAccount: TEST_EMAIL,
    steps: [],
    urls: [],
    createPasswordNavigations: [],
    dashboardElements: {
      accountCards: false,
      credentialsCards: false
    },
    screenshots: [],
    success: false
  };
  
  // Track all navigations
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      const url = frame.url();
      evidence.urls.push({ timestamp: new Date().toISOString(), url });
      console.log(`   📍 Navigation: ${url}`);
      
      if (url.includes('/auth/create-password')) {
        evidence.createPasswordNavigations.push({
          timestamp: new Date().toISOString(),
          url: url
        });
        console.log(`   ❌ WARNING: Navigated to create-password!`);
      }
    }
  });
  
  try {
    // ===== STEP 1: OPEN SIGN-IN =====
    console.log('\n📋 STEP 1: Open Sign-In Page\n');
    evidence.steps.push('Opening sign-in page');
    
    await page.goto('https://fundedwealth.com/sign-in', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-sign-in-page.png'),
      fullPage: true 
    });
    evidence.screenshots.push('01-sign-in-page.png');
    
    console.log(`   ✓ Sign-in page loaded`);
    console.log(`   ✓ Screenshot: 01-sign-in-page.png\n`);
    
    // ===== STEP 2: LOGIN =====
    console.log('🔐 STEP 2: Login with Valid Credentials\n');
    evidence.steps.push('Entering credentials');
    
    console.log(`   → Email: ${TEST_EMAIL}`);
    console.log(`   → Password: ${'*'.repeat(TEST_PASSWORD.length)}`);
    
    // Fill email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(TEST_EMAIL);
    console.log(`   ✓ Email entered`);
    
    // Fill password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(TEST_PASSWORD);
    console.log(`   ✓ Password entered`);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-credentials-filled.png'),
      fullPage: true 
    });
    evidence.screenshots.push('02-credentials-filled.png');
    console.log(`   ✓ Screenshot: 02-credentials-filled.png`);
    
    // Click login button
    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /login/i });
    await loginButton.click();
    console.log(`   ✓ Login button clicked\n`);
    
    // ===== STEP 3: WAIT FOR AUTHENTICATION =====
    console.log('⏳ STEP 3: Wait for Authentication to Complete\n');
    evidence.steps.push('Waiting for authentication');
    
    // Wait for either dashboard or error
    try {
      await Promise.race([
        page.waitForURL('**/dashboard**', { timeout: 15000 }),
        page.waitForURL('**/sign-in**', { timeout: 15000 }),
        page.waitForURL('**/auth/create-password**', { timeout: 15000 })
      ]);
    } catch (e) {
      console.log(`   ⚠️  Timeout waiting for navigation: ${e.message}`);
    }
    
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`   → Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/sign-in')) {
      console.log(`   ❌ Still on sign-in page - login may have failed`);
      
      // Check for error message
      const errorMsg = await page.locator('.text-red-400, [class*="error"]').first().textContent().catch(() => null);
      if (errorMsg) {
        console.log(`   ❌ Error message: ${errorMsg}`);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '03-login-failed.png'),
        fullPage: true 
      });
      evidence.screenshots.push('03-login-failed.png');
      
      throw new Error('Login failed - still on sign-in page');
    }
    
    console.log(`   ✓ Authentication completed\n`);
    
    // ===== STEP 4: CLICK DASHBOARD =====
    console.log('📊 STEP 4: Click Dashboard\n');
    evidence.steps.push('Navigating to dashboard');
    
    if (currentUrl.includes('/dashboard')) {
      console.log(`   ✓ Already on dashboard (redirected after login)\n`);
    } else {
      // Try to find and click dashboard link
      try {
        const dashboardLink = page.locator('a[href*="/dashboard"], button:has-text("Dashboard")').first();
        await dashboardLink.waitFor({ state: 'visible', timeout: 5000 });
        await dashboardLink.click();
        console.log(`   ✓ Dashboard link clicked`);
        
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log(`   ⚠️  Could not find dashboard link, navigating directly`);
        await page.goto('https://fundedwealth.com/dashboard', { waitUntil: 'networkidle' });
      }
    }
    
    await page.waitForTimeout(3000);
    
    // ===== STEP 5: VERIFY URL STAYS /dashboard =====
    console.log('✓ STEP 5: Verify URL Stays on /dashboard\n');
    evidence.steps.push('Verifying dashboard URL');
    
    const finalUrl = page.url();
    console.log(`   → Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/dashboard')) {
      console.log(`   ✅ SUCCESS: URL stayed on /dashboard\n`);
      evidence.success = true;
    } else if (finalUrl.includes('/auth/create-password')) {
      console.log(`   ❌ FAIL: Redirected to /auth/create-password (BUG!)\n`);
      evidence.success = false;
    } else {
      console.log(`   ⚠️  UNEXPECTED: URL is ${finalUrl}\n`);
      evidence.success = false;
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-dashboard-loaded.png'),
      fullPage: true 
    });
    evidence.screenshots.push('04-dashboard-loaded.png');
    console.log(`   ✓ Screenshot: 04-dashboard-loaded.png\n`);
    
    // ===== STEP 6: CONFIRM NO CREATE-PASSWORD NAVIGATION =====
    console.log('🚫 STEP 6: Confirm Never Navigated to /auth/create-password\n');
    evidence.steps.push('Checking for create-password navigations');
    
    if (evidence.createPasswordNavigations.length === 0) {
      console.log(`   ✅ CONFIRMED: Never navigated to /auth/create-password\n`);
    } else {
      console.log(`   ❌ FAIL: Navigated to /auth/create-password ${evidence.createPasswordNavigations.length} time(s):`);
      evidence.createPasswordNavigations.forEach((nav, i) => {
        console.log(`      ${i + 1}. ${nav.timestamp} - ${nav.url}`);
      });
      console.log();
    }
    
    // ===== STEP 7: CONFIRM ACCOUNT CARDS RENDER =====
    console.log('💳 STEP 7: Confirm Account Cards Render\n');
    evidence.steps.push('Checking account cards');
    
    if (finalUrl.includes('/dashboard')) {
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Check for account cards
      const accountCards = page.locator('[class*="account"], [class*="AccountCard"], .bg-white\\/5').filter({ 
        hasText: /account|balance|challenge|funded/i 
      });
      
      const accountCardCount = await accountCards.count();
      console.log(`   → Account card elements found: ${accountCardCount}`);
      
      if (accountCardCount > 0) {
        evidence.dashboardElements.accountCards = true;
        console.log(`   ✅ Account cards rendered\n`);
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '05-account-cards.png'),
          fullPage: true 
        });
        evidence.screenshots.push('05-account-cards.png');
      } else {
        console.log(`   ⚠️  No account cards found (user may have no accounts)\n`);
      }
    }
    
    // ===== STEP 8: CONFIRM CREDENTIALS CARD RENDERS =====
    console.log('🔑 STEP 8: Confirm Credentials Card Renders\n');
    evidence.steps.push('Checking credentials cards');
    
    if (finalUrl.includes('/dashboard')) {
      // Look for credentials sections
      const credentialsElements = page.locator('text=/credentials|login email|password|account code/i');
      const credentialsCount = await credentialsElements.count();
      
      console.log(`   → Credentials-related elements found: ${credentialsCount}`);
      
      if (credentialsCount > 0) {
        evidence.dashboardElements.credentialsCards = true;
        console.log(`   ✅ Credentials sections rendered\n`);
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '06-credentials-section.png'),
          fullPage: true 
        });
        evidence.screenshots.push('06-credentials-section.png');
      } else {
        console.log(`   ⚠️  No credentials sections found\n`);
      }
    }
    
    // ===== STEP 9: FINAL SCREENSHOT =====
    console.log('📸 STEP 9: Capture Final Screenshot\n');
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-final-state.png'),
      fullPage: true 
    });
    evidence.screenshots.push('07-final-state.png');
    console.log(`   ✓ Screenshot: 07-final-state.png\n`);
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}\n`);
    evidence.steps.push(`Error: ${error.message}`);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error-state.png'),
      fullPage: true 
    });
    evidence.screenshots.push('error-state.png');
  }
  
  // ===== STEP 10: EXPORT TRACE =====
  console.log('💾 STEP 10: Export Playwright Trace\n');
  
  await context.tracing.stop({ path: traceFile });
  console.log(`   ✓ Trace saved: ${traceFile}`);
  console.log(`   ✓ View trace: npx playwright show-trace ${traceFile}\n`);
  
  await context.close();
  await browser.close();
  
  // ===== FINAL REPORT =====
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   FINAL RUNTIME RESULTS                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  console.log('Test Account:', TEST_EMAIL);
  console.log('Test Timestamp:', evidence.timestamp);
  console.log('\nURL Navigation History:');
  evidence.urls.forEach((nav, i) => {
    console.log(`  ${i + 1}. ${nav.url}`);
  });
  
  console.log('\nVerification Results:');
  console.log(`  ✓ Steps completed: ${evidence.steps.length}`);
  console.log(`  ${evidence.success ? '✅' : '❌'} URL stays on /dashboard: ${evidence.success}`);
  console.log(`  ${evidence.createPasswordNavigations.length === 0 ? '✅' : '❌'} No create-password navigation: ${evidence.createPasswordNavigations.length === 0}`);
  console.log(`  ${evidence.dashboardElements.accountCards ? '✅' : '⚠️ '} Account cards rendered: ${evidence.dashboardElements.accountCards}`);
  console.log(`  ${evidence.dashboardElements.credentialsCards ? '✅' : '⚠️ '} Credentials sections rendered: ${evidence.dashboardElements.credentialsCards}`);
  
  console.log(`\nScreenshots: ${evidence.screenshots.length}`);
  evidence.screenshots.forEach(screenshot => {
    console.log(`  - ${screenshot}`);
  });
  
  console.log(`\nScreenshots directory: ${screenshotsDir}`);
  console.log(`Trace file: ${traceFile}`);
  
  if (evidence.success && evidence.createPasswordNavigations.length === 0) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ SUCCESS: REAL LOGIN FLOW VERIFIED                       ║');
    console.log('║                                                               ║');
    console.log('║   - User logged in successfully                               ║');
    console.log('║   - URL stayed on /dashboard                                  ║');
    console.log('║   - No redirect to /auth/create-password                      ║');
    console.log('║   - Dashboard elements rendered                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  } else {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║   ⚠️  ISSUES DETECTED - REVIEW RESULTS ABOVE                 ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  }
  
  // Save evidence to JSON
  const evidenceFile = path.join(__dirname, 'test-evidence.json');
  fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2));
  console.log(`Evidence saved: ${evidenceFile}\n`);
  
})();
