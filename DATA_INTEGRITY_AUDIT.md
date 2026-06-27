# FundedWealth — Market Data Integrity Audit

**Date:** 2026-06-15  
**Status:** ❌ FAIL — Mock data is being persisted to production database alongside real data

---

## Critical Finding

**RELIANCE OHLC row:**
```json
{"open":2940.07, "high":2948.26, "low":1307, "close":1307, "provider":"mock"}
```

This candle is **impossible** — a stock cannot drop from ₹2940 to ₹1307 within 1 minute. The Mock provider uses `Math.random()` which generated a price of 1307 and that was persisted as the low/close.

---

## Root Cause: ALL provider ticks are persisted, not just the active one

### Code Path

**File:** `artifacts/api-server/src/lib/market-data-service.ts`

**Line 190 (initializeProviders):**
```typescript
provider.on("tick", (tick: Tick) => this.handleTick(tick));
```

Every provider (including Mock) has its `"tick"` event wired to `handleTick()`.

**Line 327 (handleTick):**
```typescript
private async handleTick(tick: Tick) {
  // ... updates cache ...
  this.persistTick(tick).catch(...);  // ← writes to market_ticks table
  this.updateOhlc(tick).catch(...);   // ← writes to market_ohlc table
}
```

**There is NO check for whether the tick's provider is the active/selected one.**

Both Mock and Angel emit ticks simultaneously. Both get persisted. Both update OHLC. The database becomes a mix of real and fake data.

---

## Impact

| Consequence | Severity |
|---|---|
| OHLC candles contain mock price data | 🔴 CRITICAL |
| Chart shows impossible candles (e.g., RELIANCE ₹2940→₹1307) | 🔴 CRITICAL |
| Market ticks table has millions of fake rows | 🟠 HIGH |
| `high`/`low` values in OHLC are corrupted by random walks | 🔴 CRITICAL |
| Volume numbers are `Math.floor(Math.random() * 1000000)` | 🔴 CRITICAL |
| Frontend cannot distinguish real from fake historical data | 🔴 CRITICAL |

---

## Every Code Path That Writes OHLC

| File | Method | What writes | Filters by provider? |
|---|---|---|---|
| `market-data-service.ts` line 329 | `handleTick()` → `updateOhlc()` | All ticks from all providers | ❌ NO |
| `market-data-service.ts` line 389 | `persistOhlc()` | Flushes OHLC accumulator to DB | ❌ NO — uses whatever provider was in the accumulator |
| `market-data-service.ts` line 149 | `stop()` → `persistOhlc()` | Flushes on shutdown | ❌ NO |

---

## Every Code Path That Writes Mock Data

| File | Method | Frequency | Data |
|---|---|---|---|
| `providers/mock.ts` line 76 | `startPriceMovement()` → `emit("tick")` | Every 5 seconds per symbol | Random prices ± 0.2% per tick |
| `market-data-service.ts` line 329 | `handleTick()` → `persistTick()` | Every mock tick | Written to `market_ticks` table |
| `market-data-service.ts` line 329 | `handleTick()` → `updateOhlc()` | Every mock tick | Updates OHLC accumulator → DB |

**With 32 symbols × 1 tick per 5 seconds = 384 mock ticks per minute being persisted to production.**

---

## OHLC Builder Logic Analysis

**File:** `market-data-service.ts` lines 360-385

```typescript
private async updateOhlc(tick: Tick) {
  const key = `${tick.symbol}:1m`;
  const existing = this.ohlcCache.get(key);

  if (!existing || existing.startedAt !== startedAt) {
    // New candle — persist old one and start fresh
    this.ohlcCache.set(key, {
      open: tick.ltP,
      high: tick.ltP,
      low: tick.ltP,
      close: tick.ltP,
      provider: tick.provider, // ← whichever provider fires first owns the candle
    });
    return;
  }

  // Update existing candle
  existing.high = Math.max(existing.high, tick.ltP);
  existing.low = Math.min(existing.low, tick.ltP);
  existing.close = tick.ltP;
}
```

**Problem:** If Mock fires first in a minute, the candle `provider` = "mock" and `open` = mock price. Then Angel fires → `close` = real price. Then Mock fires again with a random price → `low` gets corrupted.

**This is why RELIANCE shows `low: 1307`** — the Mock provider generated a random price of ₹1307 during that minute and `Math.min(existing.low, 1307)` captured it.

---

## Fix Required

### Fix 1: Only persist ticks from the active provider (CRITICAL)

**File:** `market-data-service.ts` — `handleTick()` method

```typescript
private async handleTick(tick: Tick) {
  if (!tick.symbol || !Number.isFinite(tick.ltP) || tick.ltP <= 0) return;

  // ─── CRITICAL: Only process ticks from the active provider ───
  // In production, ignore mock ticks entirely for persistence and broadcast
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && tick.provider === "mock") return;

  // Only persist/broadcast from the currently selected provider
  if (this.activeProviderKey && tick.provider !== this.activeProviderKey) {
    // Still update cache (for failover readiness) but do NOT persist or broadcast
    return;
  }

  // ... rest of handleTick ...
}
```

### Fix 2: Don't run Mock in production at all

**File:** `market-data-service.ts` — `initializeProviders()`

```typescript
private initializeProviders() {
  const isProduction = process.env.NODE_ENV === "production";
  const providers: MarketDataProvider[] = [
    new DhanProvider(),
    new UpstoxProvider(),
    new AngelProvider(),
    new ShoonyaProvider(),
    ...(isProduction ? [] : [new MockMarketDataProvider()]), // Mock ONLY in dev
  ];
  // ...
}
```

### Fix 3: Clean corrupted data from production database

```sql
-- Delete all mock OHLC rows
DELETE FROM market_ohlc WHERE provider = 'mock';

-- Delete all mock tick rows
DELETE FROM market_ticks WHERE provider = 'mock';

-- Verify no mock data remains
SELECT COUNT(*) FROM market_ohlc WHERE provider = 'mock';
SELECT COUNT(*) FROM market_ticks WHERE provider = 'mock';
```

### Fix 4: Filter OHLC queries to exclude mock data (defense in depth)

**File:** `market-data-service.ts` — `getOhlcHistory()`

```typescript
async getOhlcHistory(symbol: string, interval = "1m", limit = 100) {
  return db
    .select()
    .from(marketOhlc)
    .where(and(
      eq(marketOhlc.symbol, symbol),
      eq(marketOhlc.interval, interval),
      // Never return mock data to frontend
      sql`${marketOhlc.provider} != 'mock'`
    ))
    .orderBy(desc(marketOhlc.startedAt))
    .limit(limit);
}
```

---

## Symbol-by-Symbol Verification

| Symbol | Provider in latest OHLC | Data Quality | Issue |
|---|---|---|---|
| NIFTY | `"Angel"` | ✅ Real LTP from Angel | — |
| BANKNIFTY | `"Angel"` | ✅ Real LTP from Angel | — |
| RELIANCE | `"mock"` | ❌ Corrupted (₹2940→₹1307) | Mock random walk |
| FINNIFTY | Unknown | ⚠️ May have mixed data | Needs DB query |
| TCS | Unknown | ⚠️ May have mixed data | Needs DB query |
| INFY | Unknown | ⚠️ May have mixed data | Needs DB query |

**Why NIFTY/BANKNIFTY show Angel but RELIANCE shows mock:** The OHLC query returns the MOST RECENT row. For indices, Angel REST polling delivers ticks every 2 seconds (indices are polled first). For stocks, if the Angel poll hasn't reached RELIANCE yet but Mock already ticked, the most recent row is from Mock.

---

## DATA_INTEGRITY_STATUS: ❌ FAIL

**Reason:** Production database contains mock candles mixed with real data. The OHLC builder accepts ticks from all providers without filtering. Traders would see impossible price movements.

---

## Priority

1. **IMMEDIATE:** Apply Fix 1 (filter handleTick by active provider)
2. **IMMEDIATE:** Apply Fix 2 (remove Mock from production)
3. **AFTER DEPLOY:** Run Fix 3 SQL to clean existing corrupt data
4. **DEFENSE:** Apply Fix 4 (query-level filter)

---

*Mock provider must NEVER write to the production database.*
