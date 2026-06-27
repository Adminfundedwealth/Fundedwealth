import { test, expect } from '@playwright/test';

test('Discover API endpoints from live frontend network traffic', async ({ page }) => {
    const apiRequests: { url: string; method: string; status?: number }[] = [];

    page.on('request', req => {
        const url = req.url();
        if (url.includes('/api/') || url.includes('api.fundedwealth') || url.includes('onrender') || url.includes('supabase')) {
            apiRequests.push({ url, method: req.method() });
        }
    });

    page.on('response', res => {
        const url = res.url();
        if (url.includes('/api/') || url.includes('api.fundedwealth') || url.includes('onrender') || url.includes('supabase')) {
            const existing = apiRequests.find(r => r.url === url);
            if (existing) existing.status = res.status();
        }
    });

    // Load homepage
    await page.goto('https://www.fundedwealth.com', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('[Homepage] API requests:', JSON.stringify(apiRequests, null, 2));

    // Navigate to checkout (triggers payment API config)
    await page.goto('https://www.fundedwealth.com/checkout', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('[Checkout] API requests:', JSON.stringify(apiRequests, null, 2));

    // Navigate to sign-in (triggers Supabase auth)
    await page.goto('https://www.fundedwealth.com/sign-in', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('[Sign-in] API requests:', JSON.stringify(apiRequests, null, 2));

    // Try dashboard (will redirect but may trigger API call first)
    await page.goto('https://www.fundedwealth.com/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('[Dashboard] API requests:', JSON.stringify(apiRequests, null, 2));

    // Summary
    console.log('=== ALL API REQUESTS DETECTED ===');
    console.log(JSON.stringify(apiRequests, null, 2));
    console.log(`Total API requests: ${apiRequests.length}`);

    // Extract unique base URLs
    const baseUrls = [...new Set(apiRequests.map(r => {
        try { const u = new URL(r.url); return `${u.protocol}//${u.host}`; } catch { return r.url; }
    }))];
    console.log('Unique API base URLs:', JSON.stringify(baseUrls));
});
