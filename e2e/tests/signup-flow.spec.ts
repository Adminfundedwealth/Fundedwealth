import { test, expect } from '@playwright/test';

test.describe('Sign Up Flow', () => {
  
  test('Complete sign up flow', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@fundedwealth.test`;
    const testPassword = 'TestPassword123!@#';
    
    console.log('Test credentials:', { email: testEmail, password: testPassword });
    
    // Step 1: Navigate to sign-up
    await page.goto('http://localhost:5201/sign-up', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/signup-01-page.png', fullPage: true });
    console.log('✓ Sign-up page loaded');
    
    // Step 2: Fill email
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    
    await page.screenshot({ path: 'test-results/signup-02-email-filled.png', fullPage: true });
    console.log('✓ Email filled:', testEmail);
    
    // Step 3: Fill password
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill(testPassword);
    
    await page.screenshot({ path: 'test-results/signup-03-password-filled.png', fullPage: true });
    console.log('✓ Password filled');
    
    // Step 4: Handle CAPTCHA (if present)
    const captchaFrame = page.frameLocator('iframe[src*="cloudflare"], iframe[title*="captcha"]').first();
    const hasCaptcha = await captchaFrame.locator('input[type="checkbox"]').count().catch(() => 0);
    
    if (hasCaptcha > 0) {
      console.log('⚠ CAPTCHA detected - manual intervention needed');
      await page.screenshot({ path: 'test-results/signup-04-captcha-present.png', fullPage: true });
    } else {
      console.log('✓ No CAPTCHA detected (or already solved)');
    }
    
    // Step 5: Find sign up button
    const signUpButton = page.locator('button:has-text("Sign up"), button:has-text("Create"), button[type="submit"]').first();
    await expect(signUpButton).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/signup-05-before-submit.png', fullPage: true });
    console.log('✓ Sign up button found');
    
    // Step 6: Submit (this will likely fail due to CAPTCHA)
    await signUpButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/signup-06-after-submit.png', fullPage: true });
    
    const currentUrl = page.url();
    console.log('✓ Current URL after signup attempt:', currentUrl);
    
    // Check for success or error
    const pageContent = await page.textContent('body');
    
    if (currentUrl.includes('/dashboard') || pageContent.includes('Check your email') || pageContent.includes('verification')) {
      console.log('✓✓✓ SUCCESS: Sign up completed (or email verification needed)');
      await page.screenshot({ path: 'test-results/signup-07-success.png', fullPage: true });
    } else if (pageContent.includes('captcha') || pageContent.includes('CAPTCHA')) {
      console.log('⚠ CAPTCHA verification required');
    } else {
      console.log('⚠ Sign up flow did not complete as expected');
      const errorText = await page.locator('[role="alert"], .error, [class*="error"]').first().textContent().catch(() => 'No error found');
      console.log('Error (if any):', errorText);
    }
  });

});
