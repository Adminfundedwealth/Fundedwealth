# Fraud Detection System - Quick Integration Guide

## 🚀 5-Minute Integration Steps

### Step 1: Import Component
Add to `artifacts/fundedwealth/src/pages/admin.tsx` at the top:

```typescript
import FraudAdminPanel from "@/components/FraudAdminPanel";
```

### Step 2: Add Fraud Tab Type
Update the `Tab` type to include "fraud":

```typescript
type Tab = "overview" | "traders" | "payouts" | "risk" | "kyc" | "support" | "certificates" | "rules" | "notifications" | "audit" | "blog" | "fraud";
```

### Step 3: Add Tab Navigation Button
Find the tab navigation section (around line 500+) and add:

```typescript
<button
  onClick={() => setTab("fraud")}
  className={`px-4 py-2 rounded-lg transition-colors ${
    tab === "fraud"
      ? "bg-purple-500/20 text-purple-400"
      : "hover:bg-white/5 text-white/70"
  }`}
>
  <Shield className="w-4 h-4 inline mr-2" />
  Fraud Control
</button>
```

### Step 4: Add Tab Content
Find the section where tabs are rendered (around line 700+) and add:

```typescript
{tab === "fraud" && (
  <FraudAdminPanel />
)}
```

### Step 5: Ensure Icon Import
Make sure `Shield` is imported from lucide-react:

```typescript
import {
  // ... existing imports ...
  Shield,
} from "lucide-react";
```

---

## 🛠 Complete Admin.tsx Example

Here's a minimal example of the modified admin.tsx structure:

```typescript
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { Shield, // ... other imports } from "lucide-react";
import FraudAdminPanel from "@/components/FraudAdminPanel";

type Tab = "overview" | "traders" | "payouts" | "risk" | "kyc" | "support" | "certificates" | "rules" | "notifications" | "audit" | "blog" | "fraud";

export default function Admin() {
  const { isSignedIn, getToken } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  // ... existing state ...

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "overview", label: "Overview" },
          { id: "traders", label: "Traders" },
          { id: "payouts", label: "Payouts" },
          { id: "fraud", label: "Fraud Control", icon: Shield },
          // ... other tabs ...
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              tab === t.id
                ? "bg-purple-500/20 text-purple-400"
                : "hover:bg-white/5 text-white/70"
            }`}
          >
            {t.icon && <t.icon className="w-4 h-4 inline mr-2" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && <OverviewSection />}
      {tab === "traders" && <TradersSection />}
      {tab === "payouts" && <PayoutsSection />}
      {tab === "fraud" && <FraudAdminPanel />}
      {/* ... other tabs ... */}
    </div>
  );
}
```

---

## 🗄 Database Migration

### Option 1: Using Supabase Dashboard
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy-paste the entire content from `lib/db/migrations/001_fraud_detection_system.sql`
4. Click **Run**

### Option 2: Using Command Line
```bash
# If using PostgreSQL locally
psql -U your_username -d your_database_name -f lib/db/migrations/001_fraud_detection_system.sql

# If using Supabase (requires psql installed)
psql -h db.supabase.co -U postgres -d postgres -f lib/db/migrations/001_fraud_detection_system.sql
```

### Option 3: Drizzle Migrate
```bash
cd lib/db
pnpm drizzle-kit migrate
```

---

## 📦 Build & Deploy

### Build Backend
```bash
cd artifacts/api-server
pnpm build
# Output: dist/index.mjs
```

### Build Frontend
```bash
cd artifacts/fundedwealth
pnpm build
# Output: dist/
```

### Deploy to Vercel/Production
```bash
# Backend
vercel deploy --prod

# Frontend
vercel deploy --prod
```

---

## ✅ Verification Checklist

After integration, verify:

- [ ] Admin page loads without errors
- [ ] Fraud tab appears in navigation
- [ ] Clicking Fraud tab shows dashboard
- [ ] Dashboard loads statistics (may show 0 initially)
- [ ] High-risk users section renders
- [ ] Recent events feed shows data
- [ ] No console errors in browser DevTools
- [ ] API endpoints respond correctly

### Test API Endpoints
```bash
# Test fraud dashboard (requires admin auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5173/api/fraud/dashboard

# Test risk score calculation
curl -X POST http://localhost:5173/api/fraud/calculate-risk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ipRisk": 10,
    "deviceRisk": 5,
    "behaviorRisk": 15,
    "vpnProxyRisk": 0,
    "kycRisk": 5
  }'
```

---

## 🔧 Configuration Options

### Risk Thresholds
Edit `artifacts/api-server/src/lib/fraud-detection-service.ts`:

```typescript
// Adjust blocking threshold
if (riskScore.totalScore >= 85) { // Change this value
  riskScore.isBlocked = true;
}

// Adjust payout restriction
if (riskScore.totalScore >= 70) { // Change this value
  riskScore.payoutRestricted = true;
}
```

### Risk Factor Weights
Edit `artifacts/api-server/src/lib/risk-scoring-engine.ts`:

```typescript
static calculateRiskScore(factors: RiskFactors): RiskScoreResult {
  const totalScore = Math.min(
    100,
    factors.ipRisk +           // 0-20 (change multiplier)
    factors.deviceRisk +       // 0-20
    factors.behaviorRisk +     // 0-30
    factors.vpnProxyRisk +     // 0-15
    factors.kycRisk +          // 0-15
    (factors.referralRisk || 0) +  // 0-10
    (factors.tradingRisk || 0)     // 0-10
  );
}
```

### Dashboard Refresh Rate
Edit `FraudAdminPanel.tsx`:

```typescript
useEffect(() => {
  // ... existing code ...
  const interval = setInterval(() => {
    fetchDashboard();
  }, 30000); // Change to any milliseconds (e.g., 60000 = 1 minute)
  return () => clearInterval(interval);
}, [fetchDashboard, fetchHighRiskUsers]);
```

---

## 🐛 Troubleshooting

### Issue: FraudAdminPanel component not found
**Solution:** Ensure import path is correct
```typescript
import FraudAdminPanel from "@/components/FraudAdminPanel";
// or
import FraudAdminPanel from "../components/FraudAdminPanel";
```

### Issue: API returns 401 Unauthorized
**Solution:** Check Clerk token and admin role
```typescript
// In browser console, check:
console.log(await getToken());
// Verify user has role: "admin" in database
```

### Issue: No data showing on dashboard
**Solution:** May need to run fraud detection first
```bash
# Trigger fraud detection on a user
curl -X POST http://localhost:5173/api/fraud/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": 1,
    "ipAddress": "192.168.1.1",
    "deviceFingerprint": "test123",
    "country": "US",
    "kycStatus": "approved"
  }'
```

### Issue: Dashboard loading forever
**Solution:** Check browser network tab for failed API calls
- Verify BASE URL is correct in environment
- Check database connection
- Ensure backend server is running

---

## 📞 Next Steps

1. **Database Migration**: Run SQL migration
2. **Integration**: Add component to admin.tsx
3. **Testing**: Verify all endpoints work
4. **Customization**: Adjust risk thresholds
5. **Deployment**: Build and deploy to production
6. **Monitoring**: Set up email/SMS alerts
7. **Training**: Educate admins on using fraud panel

---

## 🔐 Security Reminders

- ✅ Only admins can access fraud endpoints
- ✅ All data changes are audit logged
- ✅ RLS policies enforce row-level security
- ✅ API rate limiting prevents abuse
- ✅ Fraud events linked to specific admin who resolved them

---

## 📚 Additional Resources

- **Fraud Detection Guide**: `FRAUD_DETECTION_GUIDE.md`
- **API Documentation**: `artifacts/api-server/src/routes/fraud.ts`
- **Component Code**: `artifacts/fundedwealth/src/components/FraudAdminPanel.tsx`
- **Database Schema**: `lib/db/src/schema/fraud-*.ts`
- **Risk Engine**: `artifacts/api-server/src/lib/risk-scoring-engine.ts`

---

**Ready to integrate?** Start with Step 1! 🚀
