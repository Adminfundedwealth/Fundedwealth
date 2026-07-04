import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  
  test('API health check returns 200', async ({ request }) => {
    const response = await request.get('http://localhost:9010/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log('Health check response:', data);
    expect(data.status).toBe('ok');
  });

  test('Frontend loads homepage', async ({ page }) => {
    await page.goto('http://localhost:5201/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Give React time to hydrate
    
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    
    // Check for main heading or logo
    const content = await page.content();
    expect(content.length).toBeGreaterThan(1000);
    console.log('Homepage loaded, content length:', content.length);
  });

  test('Frontend loads sign-in page', async ({ page }) => {
    await page.goto('http://localhost:5201/sign-in', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // Give React and auth context time
    
    await page.screenshot({ path: 'test-results/02-signin.png', fullPage: true });
    
    // Check for email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    console.log('Sign-in page loaded with email input visible');
  });

});
