# Terminal Integration Guide

**For**: Terminal Backend Developers  
**Purpose**: Integrate terminal trading updates with main site dashboard  
**Status**: ✅ **API Endpoints Ready** - Awaiting Terminal Implementation

---

## Overview

The main site dashboard now has endpoints ready to receive trading updates from the terminal. After each trade or periodically, the terminal backend should call these endpoints to sync:

- **Balance updates** (current_balance, peak_balance)
- **Trade statistics** (total trades, win rate, P&L)
- **Risk metrics** (drawdown, daily P&L)
- **Challenge status** (passed, breached, etc.)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 SHARED SUPABASE DATABASE                     │
│  ┌───────────────────────────────────────────────────┐     │
│  │ challenge_accounts                                 │     │
│  │   - current_balance (updated by terminal)         │     │
│  │   - peak_balance (updated by terminal)            │     │
│  │   - status (updated by terminal)                  │     │
│  ├───────────────────────────────────────────────────┤     │
│  │ trading_accounts                                   │     │
│  │   - balance (updated by terminal)                 │     │
│  │   - available_margin (updated by terminal)        │     │
│  ├───────────────────────────────────────────────────┤     │
│  │ session_analytics (NEW)                            │     │
│  │   - trades (updated by terminal)                  │     │
│  │   - win_rate (updated by terminal)                │     │
│  │   - gross_profit/loss (updated by terminal)       │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
      ▲                                        │
      │ READ                                   │ WRITE
      │                                        │
┌─────┴─────────┐                     ┌───────▼───────────┐
│   DASHBOARD   │                     │     TERMINAL      │
│  (main site)  │                     │   (your backend)  │
│               │                     │                   │
│ GET /accounts │                     │ After each trade: │
│ Returns:      │                     │ POST /sync        │
│ - Real Balance│                     │                   │
│ - Real Trades │                     │ Payload:          │
│ - Real Win %  │                     │ - balance         │
│               │                     │ - trades          │
└───────────────┘                     │ - win_rate        │
                                      │ - pnl             │
                                      └───────────────────┘
```

---

## API Endpoints

### 1. POST /api/terminal/sync (Primary Endpoint)

**Purpose**: Sync all trading data (balance, trades, statistics) after trades or periodically

**URL**: `https://fundedwealth.com/api/terminal/sync`

**Authentication**: 
```http
Headers:
  x-sso-api-key: <SSO_API_KEY>
  Content-Type: application/json
```

**Request Body**:
```typescript
{
  // Sync metadata (REQUIRED - NEW)
  syncId: string,                // Unique ID for this sync (UUID recommended) - for idempotency
  timestamp: string,             // ISO timestamp when sync was created - for out-of-order detection
  terminalId: string,            // terminal_traders.id from SSO login - for authorization

  // Account identifiers (REQUIRED)
  tradingAccountId: string,      // UUID from trading_accounts.id
  challengeAccountId: string,    // UUID from challenge_accounts.id

  // Balance updates (REQUIRED)
  currentBalance: number,        // Current account balance in INR
  availableMargin: number,       // Available margin for trading
  peakBalance: number,           // Highest balance reached

  // Trade statistics (REQUIRED)
  totalTrades: number,           // Total number of trades executed
  winningTrades: number,         // Number of winning trades
  losingTrades: number,          // Number of losing trades
  grossProfit: number,           // Total profit from winning trades
  grossLoss: number,             // Total loss from losing trades (positive number)

  // Risk metrics (REQUIRED)
  currentDrawdown: number,       // Current drawdown in INR
  maxDrawdownHit: number,        // Maximum drawdown reached in INR
  dailyPnL: number,              // Today's P&L in INR

  // Session info (OPTIONAL)
  sessionId?: string,            // Unique session ID (default: daily)
  lastTradeAt?: string,          // ISO timestamp of last trade

  // Challenge status (OPTIONAL - calculated automatically if not provided)
  challengeStatus?: "active" | "passed" | "failed" | "breached" | "expired",
  failReason?: string            // Reason if status is failed/breached
}
```

**Example Request**:
```bash
curl -X POST https://fundedwealth.com/api/terminal/sync \
  -H "x-sso-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "syncId": "550e8400-e29b-41d4-a716-446655440999",
    "timestamp": "2026-07-04T14:30:00.000Z",
    "terminalId": "terminal-trader-uuid-here",
    "tradingAccountId": "550e8400-e29b-41d4-a716-446655440000",
    "challengeAccountId": "660e8400-e29b-41d4-a716-446655440001",
    "currentBalance": 512000,
    "availableMargin": 512000,
    "peakBalance": 515000,
    "totalTrades": 15,
    "winningTrades": 11,
    "losingTrades": 4,
    "grossProfit": 18000,
    "grossLoss": 6000,
    "currentDrawdown": 0,
    "maxDrawdownHit": 8000,
    "dailyPnL": 5000,
    "lastTradeAt": "2026-07-04T14:30:00Z"
  }'
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Trading data synced successfully",
  "data": {
    "currentBalance": 512000,
    "totalTrades": 15,
    "winRate": "73.33",
    "status": "active",
    "drawdownPct": "0.00",
    "breached": false
  }
}
```

**Error Responses**:
- `401`: Invalid API key
- `400`: Missing required fields or invalid data
- `404`: Account not found
- `500`: Server error

---

### 2. POST /api/terminal/trade-event (Optional - Real-time Events)

**Purpose**: Send individual trade events for real-time updates and notifications

**URL**: `https://fundedwealth.com/api/terminal/trade-event`

**Authentication**: Same as /sync endpoint

**Request Body**:
```typescript
{
  tradingAccountId: string,
  challengeAccountId: string,
  tradeId: string,               // Unique trade ID
  symbol: string,                // e.g., "BANKNIFTY"
  side: "buy" | "sell",
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  pnl: number,                   // Profit/loss for this trade
  commission: number,            // Commission paid
  enteredAt: string,             // ISO timestamp
  exitedAt: string               // ISO timestamp
}
```

**Example Request**:
```bash
curl -X POST https://fundedwealth.com/api/terminal/trade-event \
  -H "x-sso-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingAccountId": "550e8400-e29b-41d4-a716-446655440000",
    "challengeAccountId": "660e8400-e29b-41d4-a716-446655440001",
    "tradeId": "trade-123",
    "symbol": "BANKNIFTY",
    "side": "buy",
    "entryPrice": 45000,
    "exitPrice": 45500,
    "quantity": 25,
    "pnl": 12500,
    "commission": 50,
    "enteredAt": "2026-07-04T10:15:00Z",
    "exitedAt": "2026-07-04T10:30:00Z"
  }'
```

---

## When to Call /sync

### Recommended Frequency

**Option 1: After Every Trade (Recommended)**
```javascript
// Pseudo-code
async function onTradeClosed(trade) {
  // Update your local state
  updateLocalBalance(trade.pnl);
  
  // Immediately sync to main site
  await callSyncEndpoint({
    currentBalance: getCurrentBalance(),
    totalTrades: getTotalTrades(),
    // ... other fields
  });
}
```

**Option 2: Periodic Sync (Every 30-60 seconds)**
```javascript
// Pseudo-code
setInterval(async () => {
  if (hasActiveTrades() || recentlyTraded()) {
    await callSyncEndpoint({
      currentBalance: getCurrentBalance(),
      totalTrades: getTotalTrades(),
      // ... other fields
    });
  }
}, 30000); // 30 seconds
```

**Option 3: Hybrid (Recommended for Performance)**
```javascript
// Sync immediately on trade close + periodic safety sync
async function onTradeClosed(trade) {
  await callSyncEndpoint(...);
}

setInterval(async () => {
  // Safety sync every 5 minutes
  await callSyncEndpoint(...);
}, 300000);
```

---

## Data Calculations

### Win Rate
```javascript
const winRate = totalTrades > 0 
  ? (winningTrades / totalTrades) * 100 
  : 0;
```

### Drawdown Percentage
```javascript
const drawdownPct = initialBalance > 0
  ? ((initialBalance - currentBalance) / initialBalance) * 100
  : 0;
```

### Net P&L
```javascript
const netPnL = currentBalance - initialBalance;
```

---

## Database Updates (Handled by API)

When you call `/api/terminal/sync`, the main site backend automatically updates:

### 1. challenge_accounts table
```sql
UPDATE challenge_accounts
SET 
  current_balance = <your currentBalance>,
  peak_balance = GREATEST(peak_balance, <your peakBalance>),
  status = <calculated or provided status>,
  updated_at = now()
WHERE id = <challengeAccountId>
```

### 2. trading_accounts table
```sql
UPDATE trading_accounts
SET 
  balance = <your currentBalance>,
  available_margin = <your availableMargin>,
  updated_at = now()
WHERE id = <tradingAccountId>
```

### 3. session_analytics table
```sql
INSERT INTO session_analytics (...)
VALUES (
  <sessionId>,
  <totalTrades>,
  <calculated winRate>,
  <grossProfit>,
  <grossLoss>,
  ...
)
ON CONFLICT (session_id) DO UPDATE SET ...
```

---

## Security

### API Key
- Stored in environment variable: `SSO_API_KEY`
- Same key used for terminal launch SSO
- **Never expose this key to the browser**
- Only terminal backend should have access

### Request Validation
- All numeric fields are validated (must be >= 0)
- Account existence is verified before updates
- Ownership is implicit (terminal backend owns the accounts it syncs)

---

## Error Handling

### Retry Logic
```javascript
async function syncWithRetry(payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://fundedwealth.com/api/terminal/sync', {
        method: 'POST',
        headers: {
          'x-sso-api-key': process.env.SSO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status >= 500) {
        // Server error - retry
        console.error(`Sync failed (attempt ${attempt}/${maxRetries}):`, response.status);
        await sleep(1000 * attempt); // Exponential backoff
        continue;
      }

      // Client error (4xx) - don't retry
      const error = await response.json();
      console.error('Sync failed:', error);
      return null;
    } catch (error) {
      console.error(`Sync error (attempt ${attempt}/${maxRetries}):`, error);
      if (attempt === maxRetries) throw error;
      await sleep(1000 * attempt);
    }
  }
}
```

### Logging
```javascript
// Log all sync attempts for debugging
console.log('[Terminal Sync]', {
  accountId: payload.tradingAccountId,
  balance: payload.currentBalance,
  trades: payload.totalTrades,
  timestamp: new Date().toISOString(),
});
```

---

## Testing

### 1. Test Sync Endpoint
```bash
# Test with curl
curl -X POST https://fundedwealth.com/api/terminal/sync \
  -H "x-sso-api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingAccountId": "test-uuid",
    "challengeAccountId": "test-uuid",
    "currentBalance": 505000,
    "availableMargin": 505000,
    "peakBalance": 505000,
    "totalTrades": 5,
    "winningTrades": 3,
    "losingTrades": 2,
    "grossProfit": 8000,
    "grossLoss": 3000,
    "currentDrawdown": 0,
    "maxDrawdownHit": 0,
    "dailyPnL": 5000
  }'
```

### 2. Verify Dashboard Updates
```bash
# Check dashboard shows updated values
curl https://fundedwealth.com/api/accounts/my \
  -H "Authorization: Bearer <user-jwt>"

# Should return:
{
  "accounts": [{
    "currentBalance": 505000,  // ← Updated
    "totalTrades": 5,          // ← Updated
    "winRate": 60,             // ← Calculated
    ...
  }]
}
```

### 3. Check Database Directly
```sql
-- Verify balance updated
SELECT current_balance, updated_at 
FROM challenge_accounts 
WHERE id = 'your-challenge-id';

-- Verify statistics recorded
SELECT * FROM session_analytics 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC LIMIT 1;
```

---

## Implementation Checklist

### Terminal Backend Tasks

- [ ] **Environment Setup**
  - [ ] Add `MAIN_SITE_API_URL` to terminal `.env`
  - [ ] Confirm `SSO_API_KEY` matches main site
  
- [ ] **Sync Function Implementation**
  - [ ] Create `syncToMainSite()` function
  - [ ] Gather all required fields (balance, trades, etc.)
  - [ ] Make POST request to `/api/terminal/sync`
  - [ ] Handle success/error responses
  - [ ] Add retry logic for failures

- [ ] **Integration Points**
  - [ ] Call sync after every trade close
  - [ ] Call sync on session start
  - [ ] Call sync on session end
  - [ ] Add periodic safety sync (every 5 min)

- [ ] **Error Handling**
  - [ ] Log all sync attempts
  - [ ] Queue failed syncs for retry
  - [ ] Alert on repeated failures

- [ ] **Testing**
  - [ ] Test with staging environment
  - [ ] Verify dashboard updates in real-time
  - [ ] Test failure scenarios
  - [ ] Load test with multiple concurrent users

---

## Example Implementation (Node.js)

```javascript
// terminal-backend/src/services/sync-service.js

const MAIN_SITE_API = process.env.MAIN_SITE_API_URL || 'https://fundedwealth.com';
const SSO_API_KEY = process.env.SSO_API_KEY;

class SyncService {
  async syncTradingData(accountId, challengeId) {
    // 1. Gather current state
    const account = await this.getAccount(accountId);
    const stats = await this.getAccountStats(accountId);
    
    // 2. Build payload
    const payload = {
      tradingAccountId: accountId,
      challengeAccountId: challengeId,
      currentBalance: account.balance,
      availableMargin: account.availableMargin,
      peakBalance: account.peakBalance,
      totalTrades: stats.totalTrades,
      winningTrades: stats.winningTrades,
      losingTrades: stats.losingTrades,
      grossProfit: stats.grossProfit,
      grossLoss: stats.grossLoss,
      currentDrawdown: account.currentDrawdown,
      maxDrawdownHit: account.maxDrawdownHit,
      dailyPnL: stats.todayPnL,
      lastTradeAt: stats.lastTradeTime?.toISOString(),
    };
    
    // 3. Send to main site
    try {
      const response = await fetch(`${MAIN_SITE_API}/api/terminal/sync`, {
        method: 'POST',
        headers: {
          'x-sso-api-key': SSO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[Sync] Success:', result);
      return result;
    } catch (error) {
      console.error('[Sync] Error:', error);
      // Queue for retry
      await this.queueFailedSync(payload);
      throw error;
    }
  }
  
  // Call this after every trade
  async onTradeClosed(trade) {
    await this.syncTradingData(
      trade.tradingAccountId,
      trade.challengeAccountId
    );
  }
}

module.exports = new SyncService();
```

---

## Support

### Questions?
- **Backend Team**: Contact main site backend team for API issues
- **Database**: Check Supabase console for data verification
- **Logs**: Check CloudWatch/server logs for sync failures

### Common Issues

**1. "Unauthorized - invalid API key"**
- Verify `SSO_API_KEY` matches in both `.env` files
- Check header name: `x-sso-api-key`

**2. "Account not found"**
- Verify UUIDs are correct
- Check account exists in `trading_accounts` and `challenge_accounts`

**3. "Invalid currentBalance"**
- Must be a positive number
- Cannot be less than 0

**4. Sync succeeds but dashboard doesn't update**
- Check browser is refreshing data
- Verify API returns updated values: `GET /api/accounts/my`
- Check database directly for updates

---

## Next Steps

1. **Implement sync function** in terminal backend
2. **Test in staging** environment
3. **Monitor logs** for sync success/failures
4. **Deploy to production** after testing
5. **Monitor dashboard** for real-time updates

---

**This completes the terminal integration setup. The main site is ready to receive and display your trading updates!**
