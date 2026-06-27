/**
 * LOCALHOST TRADING TERMINAL AUDIT
 * Run: npx playwright test tests/localhost-audit.spec.ts --headed --project=chromium
 */
import { test, expect } from '@playwright/test';

test.setTimeout(90000);

const URL = 'http://localhost:5200/trade/FW-IND-DEMO';

test('LOCALHOST TERMINAL AUDIT', async ({ page }) => {
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];
    const network: { method: string; url: string; status?: number }[] = [];
    const wsLog: string[] = [];

    page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('response', res => {
        network.push({ method: res.request().method(), url: res.url(), status: res.status() });
    });
    page.on('websocket', ws => {
        wsLog.push(`OPENED: ${ws.url()}`);
        ws.on('framereceived', f => wsLog.push(`IN: ${String(f.payload).slice(0, 150)}`));
        ws.on('close', () => wsLog.push('CLOSED'));
    });

    // Load terminal
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(15000);

    // Screenshot
    await page.screenshot({ path: 'test-results/localhost-audit.png', fullPage: false });

    // ── RESULTS ──
    console.log('\n============ LOCALHOST AUDIT RESULTS ============');

    // 1. Page loads
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    console.log(`URL: ${page.url()}`);

    // 2. Header / connection status
    const header = await page.locator('header').first().textContent() || '';
    const hasDisconnected = header.toLowerCase().includes('disconnected');
    console.log(`\n[1] DISCONNECTED badge: ${hasDisconnected ? '❌ VISIBLE' : '✅ NOT visible'}`);
    console.log(`    Header: "${header.slice(0, 150)}"`);

    // 3. WebSocket
    const wsOpened = wsLog.filter(l => l.startsWith('OPENED'));
    const wsMarket = wsLog.filter(l => l.includes('ws/market') || l.includes('snapshot') || l.includes('tick'));
    console.log(`\n[2] WebSocket: ${wsOpened.length} connections`);
    wsLog.slice(0, 8).forEach(l => console.log(`    ${l}`));
    // WS is optional — REST polling is the fallback and sufficient for data flow
    const wsConnected = wsMarket.length > 0 || network.some(n => n.url.includes('/api/market/quotes') && n.status === 200);
    console.log(`    Market data active (WS or REST): ${wsConnected ? '✅' : '❌'}`);

    // 4. Market quotes REST
    const quotesReqs = network.filter(n => n.url.includes('/api/market/quotes'));
    console.log(`\n[3] REST /api/market/quotes: ${quotesReqs.length} requests`);
    quotesReqs.slice(0, 3).forEach(n => console.log(`    [${n.status}] ${n.method} ${n.url.split('?')[0]}`));
    const quotesOk = quotesReqs.some(n => n.status === 200);
    console.log(`    Successful: ${quotesOk ? '✅' : '❌'}`);

    // 5. OHLC
    const ohlcReqs = network.filter(n => n.url.includes('/api/market/ohlc'));
    console.log(`\n[4] OHLC /api/market/ohlc: ${ohlcReqs.length} requests`);
    ohlcReqs.forEach(n => console.log(`    [${n.status}] ${n.method} ${n.url.split('?')[0]}`));
    const ohlcOk = ohlcReqs.some(n => n.status === 200);
    console.log(`    Successful: ${ohlcOk ? '✅' : '❌'}`);

    // 6. Chart canvas
    const canvasCount = await page.locator('canvas').count();
    const chartVisible = canvasCount > 0;
    console.log(`\n[5] Chart: ${canvasCount} canvas elements — ${chartVisible ? '✅' : '❌'}`);

    // 7. Watchlist prices
    const priceEls = page.locator('[class*="tabular-nums"]');
    const priceCount = await priceEls.count();
    console.log(`\n[6] Watchlist: ${priceCount} price elements — ${priceCount > 10 ? '✅' : '❌'}`);

    // 8. Order panel
    await page.locator('body').click({ position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(200);
    await page.keyboard.press('b');
    await page.waitForTimeout(1000);
    const orderVisible = (await page.locator('text=/MARKET|LIMIT/i').count()) > 0;
    console.log(`\n[7] Order panel (B key): ${orderVisible ? '✅' : '❌'}`);
    await page.keyboard.press('Escape');

    // 9. Console errors
    const criticalErrors = consoleErrors.filter(e => !e.includes('401') && !e.includes('403') && !e.includes('favicon'));
    console.log(`\n[8] Console errors: ${consoleErrors.length} total, ${criticalErrors.length} critical`);
    criticalErrors.slice(0, 10).forEach(e => console.log(`    ❌ ${e.slice(0, 120)}`));
    console.log(`    ${criticalErrors.length === 0 ? '✅ No critical errors' : '❌ Has errors'}`);

    // ── VERDICT ──
    console.log('\n============ VERDICT ============');
    const checks = {
        'Page loads': true,
        'No DISCONNECTED': !hasDisconnected,
        'WebSocket or REST active': wsConnected,
        'REST quotes 200': quotesOk,
        'OHLC 200': ohlcOk,
        'Chart renders': chartVisible,
        'Watchlist populated': priceCount > 10,
        'Order panel works': orderVisible,
        'No critical errors': criticalErrors.length === 0,
    };
    let allPass = true;
    Object.entries(checks).forEach(([k, v]) => {
        console.log(`  ${v ? '✅' : '❌'} ${k}`);
        if (!v) allPass = false;
    });
    console.log(`\n  OVERALL: ${allPass ? '✅ ALL PASS' : '❌ FAILURES'}`);
    console.log('============ END ============\n');

    expect(allPass).toBe(true);
});
