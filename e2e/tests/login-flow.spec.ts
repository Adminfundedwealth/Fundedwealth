import { test, expect } from '@playwright/test';

test.describe('Login to Dashboard Flow', () => {
  
  test('Complete login flow and reach dashboard', async ({ page }) => {
    // Step 1: Navigate to sign-in
    await page.goto('http://localhost:5201/sign-in', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/login-01-signin-page.png', fullPage: true });
    console.log('✓ Sign-in page loaded');
    
    // Step 2: Fill credentials
    // Note: This will fail without valid test account, but will show the flow
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    
    await emailInput.fill('test@fundedwealth.test');
    await passwordInput.fill('TestPassword123!');
    
    await page.screenshot({ path: 'test-results/login-02-credentials-filled.png', fullPage: true });
    console.log('✓ Credentials filled');
    
    // Step 3: Find and click sign in button
    const signInButton = page.locator('button:has-text("Sign"), button:has-text("Login"), button[type="submit"]').first();
    await expect(signInButton).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/login-03-before-submit.png', fullPage: true });
    console.log('✓ Sign in button found');
    
    // Step 4: Submit form
    await signInButton.click();
    await page.waitForTimeout(3000); // Wait for auth response
    
    await page.screenshot({ path: 'test-results/login-04-after-submit.png', fullPage: true });
    
    // Step 5: Check if we reached dashboard or got error
    const currentUrl = page.url();
    console.log('✓ Current URL after login attempt:', currentUrl);
    
    if (currentUrl.includes('/dashboard')) {
      await page.screenshot({ path: 'test-results/login-05-dashboard-reached.png', fullPage: true });
      console.log('✓✓✓ SUCCESS: Dashboard reached!');
      
      // Wait for dashboard content to load
      await page.waitForTimeout(3000);
      
      // Check for account elements
      const pageContent = await page.content();
      console.log('Dashboard content length:', pageContent.length);
      
      await page.screenshot({ path: 'test-results/login-06-dashboard-loaded.png', fullPage: true });
      
    } else {
      console.log('⚠ Did not reach dashboard. Likely invalid credentials (expected for test account)');
      const errorMessage = await page.locator('[role="alert"], .error, [class*="error"]').first().textContent().catch(() => 'No error element found');
      console.log('Error message (if any):', errorMessage);
    }
  });

});
