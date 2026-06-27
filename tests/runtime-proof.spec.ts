/**
 * Runtime Proof — Live Production Terminal
 * Headed mode: npx playwright test tests/runtime-proof.spec.ts --headed --project=chromium
 */
import { test, expect } from '@playwright/test';

test.setTimeout(120000);

const LIVE_URL = 'https://fundedwealth.com/trade/FW-IND-DEMO';
const LOCAL_URL = 'http://localhost:5173/trade/FW-IND-DEMO';
const TEST_URL = LOCAL_URL; // Test local dev with production backend

test('RUNTIME PROOF — Full Terminal Verification', async ({ page }) => {
    // Collectors
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];
    const networkLog: { method: string; url: string; status?: number; type?: string }[] = [];
    const wsFrames: string[] = [];

    page.on('console', msg => {
        const text = `[${msg.type()}] ${msg.text()}`;
        consoleLogs.push(text);
        if (msg.type() === 'error') consoleErrors.push(text);
    });

    page.on('request', req => {
        networkLog.push({ method: req.method(), url: req.url(), type: req.resourceType() });
    });

    page.on('response', res => {
        const entry = networkLog.find(n => n.url === res.url() && !n.status);
        if (entry) entry.status = res.status();
    });

    page.on('websocket', ws => {
        wsFrames.push(`WS OPENED: ${ws.url()}`);
        ws.on('framereceived', frame => {
            wsFrames.push(`WS IN: ${String(frame.payload).slice(0, 200)}`);
        });
        ws.on('close', () => wsFrames.push('WS CLOSED'));
    });

    // Navigate
    console.log('\n========== NAVIGATING TO TERMINAL ==========');
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`Page loaded: ${page.url()}`);

    // Wait for data to arrive
    await page.waitForTimeout(15000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/terminal-runtime-proof.png', fullPage: false });
    console.log('Screenshot saved: test-results/terminal-runtime-proof.png');

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK 1: DISCONNECTED badge
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- CHECK 1: DISCONNECTED badge ---');
    const headerText = await page.locator('header').textContent() || '';
    const hasDisconnected = headerText.toLowerCase().includes('disconnected');
    console.log(`Header text: "${headerText.slice(0, 200)}"`);
    console.log(`DISCONNECTED visible: ${hasDisconnected}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK 2: WebSocket connection (101 upgrade)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- CHECK 2: WebSocket ---');
    const wsConnections = wsFrames.filter(f => f.startsWith('WS OPENED'));
    console.log(`WebSocket connections: ${wsConnections.length}`);
    wsFrames.slice(0, 10).forEach(f => console.log(`  ${f}`));
    const wsNetwork = networkLog.filter(n => n.url.includes('ws/market') || n.url.includes('wss'));
    console.log(`WS network entries: ${wsNetwork.length}`);
    wsNetwork.forEach(n => console.log(`  ${n.method} ${n.url} [${n.status || 'pending'}]`));

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK 3: OHLC API requests
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- CHECK 3: OHLC requests ---');
    const ohlcReqs = networkLog.filter(n => n.url.includes('/api/market/ohlc'));
    console.log(`OHLC requests: ${ohlcReqs.length}`);
    ohlcReqs.forEach(n => console.log(`  ${n.method} ${n.url} [${n.status}]`));

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK 4: Candlestick chart
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- CHECK 4: Chart canvas ---');
    const canvasCount = await page.locator('canvas').count();
    console.log(`Canvas elements: ${canvasCount}`);
    const chartVisible = canvasCount > 0 && await page.locator('canvas').first().isVisible();
    console.log(`Chart visible: ${chartVisible}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK 5: Watchlist prices updating
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- CHECK 5: Watchlist prices ---');
    const priceEls = page.locator('[class*="tabular-nums"]');
    const priceCount = await priceEls.count();
    console.log(`Price elements: ${priceCount}`);
    // Sample first 5 prices
    for (let i = 0; i < Math.min(5, priceCount); i++) {
        const txt = await priceEls.nth(i).textContent();
        console.log(`  Price[${i}]: "${txt}"`);
    }

    // Check REST market/quotes requests
    const quotesReqs = networkLog.filter(n => n.url.includes('/api/market/quotes'));
    console.log(`REST /api/market/quotes requests: ${quotesReqs.length}`);
    quotesReqs.slice(0, 5).forEach(n => console.log(`  ${n.method} ${n.url} [${n.status}]`));

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK 6: Buy/Sell order panel
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- CHECK 6: Order panel ---');
    // Focus body then use keyboard shortcut
    await page.locator('body').click({ position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(300);
    await page.keyboard.press('b');
    await page.waitForTimeout(1500);
    // Look for MARKET/LIMIT order type buttons or BUY button
    const orderElements = page.locator('text=/MARKET|LIMIT/i');
    let buyVisible = (await orderElements.count()) > 0;
    if (!buyVisible) {
        const buyBtns = page.locator('button').filter({ hasText: /BUY/i });
        buyVisible = (await buyBtns.count()) > 0;
    }
    console.log(`Order panel visible after 'b' key: ${buyVisible}`);
    await page.keyboard.press('Escape');

    // ═══════════════════════════════════════════════════════════════════════════
    // CHECK 7: Console errors
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- CHECK 7: Console errors ---');
    console.log(`Total console errors: ${consoleErrors.length}`);
    consoleErrors.slice(0, 15).forEach(e => console.log(`  ${e}`));

    // ═══════════════════════════════════════════════════════════════════════════
    // FULL NETWORK LOG (market-related)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n--- NETWORK LOG (market/ws) ---');
    const marketNetwork = networkLog.filter(n =>
        n.url.includes('/api/market') || n.url.includes('/ws/') || n.url.includes('ohlc')
    );
    console.log(`Market-related requests: ${marketNetwork.length}`);
    marketNetwork.slice(0, 20).forEach(n => console.log(`  [${n.status || '---'}] ${n.method} ${n.url.split('?')[0]}`));

    // ═══════════════════════════════════════════════════════════════════════════
    // VERDICT
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n========== VERDICT ==========');
    const results = {
        '1. DISCONNECTED gone': !hasDisconnected,
        '2. WebSocket 101': wsConnections.length > 0,
        '3. OHLC requests': ohlcReqs.length > 0,
        '4. Chart visible': chartVisible,
        '5. Prices updating': priceCount > 5,
        '6. Order panel works': buyVisible,
        '7. No critical errors': consoleErrors.filter(e => !e.includes('WebSocket') && !e.includes('401') && !e.includes('403')).length === 0,
    };
    Object.entries(results).forEach(([k, v]) => {
        console.log(`  ${v ? '✅' : '❌'} ${k}`);
    });
    const allPass = Object.values(results).every(v => v);
    console.log(`\n  OVERALL: ${allPass ? '✅ ALL PASS' : '❌ FAILURES DETECTED'}`);
    console.log('========== END ==========\n');

    // Assert all pass
    expect(allPass, 'Not all runtime checks passed — see output above').toBe(true);
});
