import { test, expect, request } from '@playwright/test';

const API_BASE = 'https://api.fundedwealth.com';
const FRONTEND_BASE = 'https://www.fundedwealth.com';

// ============================================================
// 1. INCIDENTS ENDPOINT - UNAUTHENTICATED ACCESS
// ============================================================
test.describe('Incidents Endpoint Auth', () => {
    test('GET /api/incidents without auth returns 401', async () => {
        const ctx = await request.newContext();
        const res = await ctx.get(`${API_BASE}/api/incidents`);
        console.log(`[Incidents No Auth] Status: ${res.status()}`);
        console.log(`[Incidents No Auth] Body: ${await res.text()}`);
        // Should be 401 if fix is deployed, or 200 if vulnerability still exists
        test.info().annotations.push({ type: 'status', description: `${res.status()}` });
        expect([401, 403]).toContain(res.status());
    });

    test('GET /api/incidents with invalid token returns 401', async () => {
        const ctx = await request.newContext();
        const res = await ctx.get(`${API_BASE}/api/incidents`, {
            headers: { Authorization: 'Bearer invalid_token_12345' },
        });
        console.log(`[Incidents Bad Token] Status: ${res.status()}`);
        console.log(`[Incidents Bad Token] Body: ${await res.text()}`);
        expect([401, 403]).toContain(res.status());
    });
});

// ============================================================
// 2. ADMIN ROUTE SECURITY
// ============================================================
test.describe('Admin Route Security', () => {
    const adminRoutes = [
        '/api/admin/overview',
        '/api/admin/traders',
        '/api/admin/audit',
        '/api/fraud/dashboard',
        '/api/fraud/high-risk-users',
        '/api/admin/kyc/submissions',
    ];

    for (const route of adminRoutes) {
        test(`${route} without auth returns 401/403`, async () => {
            const ctx = await request.newContext();
            const res = await ctx.get(`${API_BASE}${route}`);
            console.log(`[Admin ${route}] Status: ${res.status()}`);
            console.log(`[Admin ${route}] Body: ${(await res.text()).slice(0, 200)}`);
            expect([401, 403]).toContain(res.status());
        });
    }
});

// ============================================================
// 3. CORS VALIDATION
// ============================================================
test.describe('CORS Validation', () => {
    test('OPTIONS from unauthorized origin is rejected', async () => {
        const ctx = await request.newContext();
        const res = await ctx.fetch(`${API_BASE}/api/health`, {
            method: 'OPTIONS',
            headers: {
                Origin: 'https://evil-attacker.com',
                'Access-Control-Request-Method': 'GET',
            },
        });
        console.log(`[CORS Evil Origin] Status: ${res.status()}`);
        const headers = res.headers();
        console.log(`[CORS Evil Origin] Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || 'NOT SET'}`);
        // If CORS fix is deployed, this should NOT have the evil origin reflected
        const allowOrigin = headers['access-control-allow-origin'] || '';
        expect(allowOrigin).not.toBe('https://evil-attacker.com');
    });

    test('OPTIONS from fundedwealth.com is allowed', async () => {
        const ctx = await request.newContext();
        const res = await ctx.fetch(`${API_BASE}/api/health`, {
            method: 'OPTIONS',
            headers: {
                Origin: 'https://www.fundedwealth.com',
                'Access-Control-Request-Method': 'GET',
            },
        });
        console.log(`[CORS Legit Origin] Status: ${res.status()}`);
        const headers = res.headers();
        console.log(`[CORS Legit Origin] Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || 'NOT SET'}`);
        const allowOrigin = headers['access-control-allow-origin'] || '';
        expect(['https://www.fundedwealth.com', '*', '']).toContain(allowOrigin);
    });

    test('GET from unauthorized origin with credentials is rejected', async () => {
        const ctx = await request.newContext();
        const res = await ctx.get(`${API_BASE}/api/health`, {
            headers: {
                Origin: 'https://malicious-site.com',
            },
        });
        console.log(`[CORS GET Malicious] Status: ${res.status()}`);
        const headers = res.headers();
        const allowOrigin = headers['access-control-allow-origin'] || '';
        console.log(`[CORS GET Malicious] Access-Control-Allow-Origin: ${allowOrigin}`);
        // Should NOT reflect the malicious origin
        expect(allowOrigin).not.toBe('https://malicious-site.com');
    });
});

// ============================================================
// 4. SECURITY HEADERS
// ============================================================
test.describe('Security Headers', () => {
    test('Frontend has proper security headers', async ({ page }) => {
        const response = await page.goto(FRONTEND_BASE);
        const headers = response!.headers();

        console.log('[Headers] X-Frame-Options:', headers['x-frame-options'] || 'MISSING');
        console.log('[Headers] X-Content-Type-Options:', headers['x-content-type-options'] || 'MISSING');
        console.log('[Headers] Strict-Transport-Security:', headers['strict-transport-security'] || 'MISSING');
        console.log('[Headers] Referrer-Policy:', headers['referrer-policy'] || 'MISSING');
        console.log('[Headers] Content-Security-Policy:', headers['content-security-policy']?.slice(0, 100) || 'MISSING');
        console.log('[Headers] X-XSS-Protection:', headers['x-xss-protection'] || 'MISSING');
        console.log('[Headers] Permissions-Policy:', headers['permissions-policy'] || 'MISSING');

        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['x-frame-options']).toBeTruthy();
        expect(headers['strict-transport-security']).toBeTruthy();
    });

    test('API has proper security headers', async () => {
        const ctx = await request.newContext();
        const res = await ctx.get(`${API_BASE}/api/health`);
        const headers = res.headers();

        console.log('[API Headers] X-Frame-Options:', headers['x-frame-options'] || 'MISSING');
        console.log('[API Headers] X-Content-Type-Options:', headers['x-content-type-options'] || 'MISSING');
        console.log('[API Headers] Strict-Transport-Security:', headers['strict-transport-security'] || 'MISSING');
        console.log('[API Headers] Content-Security-Policy:', headers['content-security-policy']?.slice(0, 100) || 'MISSING');

        expect(headers['x-content-type-options']).toBe('nosniff');
    });
});

// ============================================================
// 5. SECRET EXPOSURE - CLIENT SIDE
// ============================================================
test.describe('Secret Exposure Validation', () => {
    test('No secrets in page source or JS bundles', async ({ page }) => {
        const consoleMessages: string[] = [];
        page.on('console', msg => consoleMessages.push(msg.text()));

        await page.goto(FRONTEND_BASE, { waitUntil: 'networkidle' });

        const pageContent = await page.content();

        // Check for known secret patterns
        const secretPatterns = [
            'MbfUd51SVuj7Y9YlFc7NZiec',           // Razorpay secret
            'sb_secret_pXxBClMpDcs5czNf37mHpg',    // Supabase service role
            '8m56JQWMxKag9zCj',                     // DB password
            'YGQBBPXXZOJURRRNWSKDYDBG6M',          // Angel TOTP
            'sk_test_i0RLZPGMjyW2JvYRExkby52f0e92A8JHc5K2ElQD1s', // Clerk secret
            'AIzaSyDRKWZZuUTm8DslYqQb_rDTllFscuc7Yho', // Gemini key
            '6NGOJO-GHZHZK-QTI57P-BVZBMK',        // OxaPay key
            'Rozerpayx@1',                          // Webhook secret
            'fw_admin_setup_2026_xK9mPqR7vNcW',    // Admin setup secret
        ];

        for (const secret of secretPatterns) {
            const found = pageContent.includes(secret);
            console.log(`[Secret Check] ${secret.slice(0, 10)}...: ${found ? 'EXPOSED!' : 'Not found'}`);
            expect(found, `Secret ${secret.slice(0, 10)}... found in page source`).toBe(false);
        }

        // Check localStorage and sessionStorage
        const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
        const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));

        for (const secret of secretPatterns) {
            expect(localStorage.includes(secret), `Secret in localStorage`).toBe(false);
            expect(sessionStorage.includes(secret), `Secret in sessionStorage`).toBe(false);
        }

        console.log(`[Console Messages] Count: ${consoleMessages.length}`);
        const errorMessages = consoleMessages.filter(m => m.toLowerCase().includes('error'));
        console.log(`[Console Errors] ${errorMessages.length} errors found`);
        errorMessages.forEach(m => console.log(`  - ${m.slice(0, 200)}`));
    });
});

// ============================================================
// 6. AUTHENTICATION FLOW
// ============================================================
test.describe('Authentication Flow', () => {
    test('Protected route /dashboard redirects unauthenticated users', async ({ page }) => {
        await page.goto(`${FRONTEND_BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        const url = page.url();
        console.log(`[Auth Redirect] /dashboard → ${url}`);
        // Should redirect to sign-in
        expect(url).toContain('sign-in');
    });

    test('Protected route /admin accessible without proper redirects', async ({ page }) => {
        await page.goto(`${FRONTEND_BASE}/admin`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        const url = page.url();
        console.log(`[Admin Access] /admin → ${url}`);
        // Check if admin UI is visible without auth (the data won't load but shell might render)
        const pageText = await page.textContent('body');
        console.log(`[Admin Page] Contains admin text: ${pageText?.includes('Admin') || false}`);
    });

    test('Sign-in page loads correctly', async ({ page }) => {
        const response = await page.goto(`${FRONTEND_BASE}/sign-in`);
        expect(response!.status()).toBe(200);
        await page.waitForTimeout(2000);
        const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count();
        const hasPasswordInput = await page.locator('input[type="password"]').count();
        console.log(`[Sign-in] Email input: ${hasEmailInput > 0}, Password input: ${hasPasswordInput > 0}`);
    });
});

// ============================================================
// 7. OWNERSHIP VULNERABILITY - API LEVEL
// ============================================================
test.describe('Ownership Vulnerability', () => {
    test('PATCH /api/orders/:id without auth returns 401', async () => {
        const ctx = await request.newContext();
        const res = await ctx.patch(`${API_BASE}/api/orders/1`, {
            data: { status: 'closed', exitPrice: 100, positionId: 999 },
        });
        console.log(`[Orders PATCH No Auth] Status: ${res.status()}`);
        console.log(`[Orders PATCH No Auth] Body: ${await res.text()}`);
        expect([401, 403]).toContain(res.status());
    });

    test('PATCH /api/orders/:id with invalid token returns 401', async () => {
        const ctx = await request.newContext();
        const res = await ctx.patch(`${API_BASE}/api/orders/1`, {
            headers: { Authorization: 'Bearer fake_token_attempt' },
            data: { status: 'closed', exitPrice: 100, positionId: 999 },
        });
        console.log(`[Orders PATCH Bad Token] Status: ${res.status()}`);
        console.log(`[Orders PATCH Bad Token] Body: ${await res.text()}`);
        expect([401, 403, 404]).toContain(res.status());
    });
});

// ============================================================
// 8. PAYMENT UPLOAD VALIDATION
// ============================================================
test.describe('Payment Upload Validation', () => {
    test('Payment proof upload rejects without auth', async () => {
        const ctx = await request.newContext();
        const res = await ctx.post(`${API_BASE}/api/payments/manual-bank-transfer`, {
            multipart: {
                reference: '123456789012',
                amount: '999',
                planType: 'flash',
                proof: {
                    name: 'test.jpg',
                    mimeType: 'image/jpeg',
                    buffer: Buffer.from('fake image content'),
                },
            },
        });
        console.log(`[Upload No Auth] Status: ${res.status()}`);
        console.log(`[Upload No Auth] Body: ${(await res.text()).slice(0, 200)}`);
        // This endpoint allows guest checkout with billing email, so it may return 400 rather than 401
        expect([400, 401, 403]).toContain(res.status());
    });
});
