/**
 * Trading Terminal Engine — Integration Test
 * ──────────────────────────────────────────
 * Run in HEADED mode to visually verify:
 *   npx playwright test tests/terminal-engine.spec.ts --headed --project=chromium
 *
 * Tests the live site: https://fundedwealth.com/trade/FW-IND-DEMO
 */

import { test, expect } from '@playwright/test';

test.setTimeout(90000);

const LIVE_URL = 'https://fundedwealth.com/trade/FW-IND-DEMO';

test.describe('Trading Terminal — Live Site', () => {
    test('should load without DISCONNECTED badge', async ({ page }) => {
        await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(10000);

        const disconnected = page.locator('header').locator('text=/disconnected/i');
        const isDisconnected = await disconnected.isVisible({ timeout: 3000 }).catch(() => false);
        console.log(`[LIVE] Disconnected badge visible: ${isDisconnected}`);
        expect(isDisconnected).toBe(false);
    });

    test('should show live prices in watchlist', async ({ page }) => {
        await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(12000);

        const prices = page.locator('[class*="tabular-nums"]');
        const count = await prices.count();
        console.log(`[LIVE] Price elements found: ${count}`);
        expect(count).toBeGreaterThan(5);
    });

    test('should render candlestick chart canvas', async ({ page }) => {
        await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(10000);

        const canvas = page.locator('canvas').first();
        const chartVisible = await canvas.isVisible({ timeout: 10000 }).catch(() => false);
        console.log(`[LIVE] Chart canvas visible: ${chartVisible}`);
        expect(chartVisible).toBe(true);
    });

    test('should make OHLC API requests for chart data', async ({ page }) => {
        const ohlcRequests: string[] = [];
        page.on('request', req => {
            if (req.url().includes('/api/market/ohlc/')) {
                ohlcRequests.push(req.url());
            }
        });

        await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(12000);

        console.log(`[LIVE] OHLC requests: ${ohlcRequests.length}`);
        ohlcRequests.forEach(u => console.log(`  ${u}`));
        expect(ohlcRequests.length).toBeGreaterThan(0);
    });

    test('should have active data feed (WS or REST)', async ({ page }) => {
        const marketRequests: string[] = [];
        page.on('request', req => {
            const url = req.url();
            if (url.includes('/api/market/quotes') || url.includes('/ws/market')) {
                marketRequests.push(`${req.method()} ${url.split('?')[0]}`);
            }
        });

        await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(15000);

        console.log(`[LIVE] Market data requests: ${marketRequests.length}`);
        expect(marketRequests.length).toBeGreaterThan(2);
    });

    test('full evidence collection', async ({ page }) => {
        const consoleLogs: string[] = [];
        page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

        const networkLog: string[] = [];
        page.on('request', req => {
            const url = req.url();
            if (url.includes('/api/market') || url.includes('/ws/') || url.includes('ohlc')) {
                networkLog.push(`${req.method()} ${url.split('?')[0]}`);
            }
        });

        await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(15000);

        console.log('\n=== TERMINAL ENGINE EVIDENCE ===');
        console.log(`URL: ${page.url()}`);
        console.log(`Network (market): ${networkLog.length} requests`);
        networkLog.slice(0, 15).forEach(r => console.log(`  ${r}`));
        const relevant = consoleLogs.filter(l =>
            l.includes('Market') || l.includes('WebSocket') || l.includes('Engine') || l.includes('poll')
        );
        console.log(`Console (relevant): ${relevant.length} entries`);
        relevant.slice(0, 10).forEach(l => console.log(`  ${l}`));
        console.log('=== END EVIDENCE ===\n');

        expect(page.url()).toContain('/trade/');
    });
});
