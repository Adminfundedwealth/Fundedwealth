# Fraud Detection Integration Examples

## Real-World Integration Points

### Example 1: Check User on Login

In `artifacts/api-server/src/routes/users.ts` or your login route:

```typescript
import FraudDetectionService from "../lib/fraud-detection-service";
import { logger } from "../lib/logger";

router.post("/login", async (req, res) => {
  try {
    const { email, password, ipAddress, deviceFingerprint, userAgent } = req.body;
    
    // Your existing authentication logic...
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // NEW: Run fraud detection
    try {
      const riskProfile = await FraudDetectionService.detectAndScore({
        userId: user.id,
        ipAddress,
        deviceFingerprint,
        country: getCountryFromIP(ipAddress), // Use geoIP service
        userEmail: user.email,
        kycStatus: user.kycStatus,
        accountAge: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      });

      // Check if user should be blocked
      if (riskProfile.isBlocked) {
        logger.warn(`Blocked user ${user.id} - Risk score: ${riskProfile.riskScore}`);
        return res.status(403).json({
          error: "Account has been suspended for security review",
          requiresManualReview: true,
          contactSupport: true,
        });
      }

      // Warn if high risk but not blocked
      if (riskProfile.payoutRestricted) {
        // Proceed with login but flag payout restrictions
        logger.info(`High-risk login for user ${user.id}`);
      }

      // Generate session token
      const token = generateSessionToken(user);
      
      return res.json({
        success: true,
        token,
        user,
        riskFlags: riskProfile.payoutRestricted ? ["payoutRestricted"] : [],
      });
    } catch (fraudError) {
      logger.error(fraudError, "Fraud detection error during login");
      // Continue with login even if fraud detection fails
      const token = generateSessionToken(user);
      return res.json({ success: true, token, user });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

---

### Example 2: Check User on Trade

In `artifacts/api-server/src/routes/trade-journal.ts` or your trade route:

```typescript
import FraudDetectionService from "../lib/fraud-detection-service";
import RiskScoringEngine from "../lib/risk-scoring-engine";

router.post("/trade", clerkAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { entryPrice, exitPrice, quantity, symbol, ipAddress } = req.body;

    // Check user risk profile first
    const riskProfile = await db.query.riskProfiles.findFirst({
      where: eq(riskProfiles.userId, parseInt(userId)),
    });

    // Block trading if account is blocked
    if (riskProfile?.isBlocked) {
      return res.status(403).json({
        error: "Your account is blocked due to fraud investigation",
        blocked: true,
      });
    }

    // Warn if payout restricted but allow trading
    let warnings = [];
    if (riskProfile?.payoutRestricted) {
      warnings.push("payoutRestricted");
    }

    // Place trade normally
    const trade = await createTrade({
      userId: parseInt(userId),
      entryPrice,
      exitPrice,
      quantity,
      symbol,
    });

    // NEW: Async fraud detection on trade pattern
    // Don't block, just log and update risk
    setImmediate(async () => {
      try {
        // Get user's recent trades
        const recentTrades = await getRecentTrades(parseInt(userId), 20);

        // Check for copy trading
        const copyTradingScore = RiskScoringEngine.detectCopyTrading(
          recentTrades.map((t) => ({
            entryPrice: t.entryPrice,
            exitPrice: t.exitPrice,
            quantity: t.quantity,
            timestamp: t.createdAt.getTime(),
          }))
        );

        if (copyTradingScore > 70) {
          logger.warn(
            `Copy trading detected for user ${userId}: ${copyTradingScore}%`
          );
          
          // Log fraud event
          await db.insert(fraudEvents).values({
            userId: parseInt(userId),
            fraudType: "COPY_TRADING",
            severity: "HIGH",
            riskScore: copyTradingScore,
            status: "OPEN",
            details: { probability: copyTradingScore },
          });
        }

        // Check for HFT
        const hftScore = RiskScoringEngine.detectHFT(
          recentTrades.map((t) => ({
            timestamp: t.createdAt.getTime(),
          }))
        );

        if (hftScore > 50) {
          logger.warn(`High-frequency trading detected for user ${userId}`);
          // Log fraud event
        }
      } catch (error) {
        logger.error(error, "Error in async fraud detection");
      }
    });

    return res.json({
      success: true,
      trade,
      warnings,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

---

### Example 3: Check User on Payout Request

In `artifacts/api-server/src/routes/payouts.ts`:

```typescript
import FraudDetectionService from "../lib/fraud-detection-service";

router.post("/request", clerkAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { amount, method, accountDetails } = req.body;

    // Check risk profile
    const riskProfile = await db.query.riskProfiles.findFirst({
      where: eq(riskProfiles.userId, parseInt(userId)),
    });

    // Block payout if account is blocked
    if (riskProfile?.isBlocked) {
      return res.status(403).json({
        error: "Payouts are not available for your account at this time",
        reason: "fraud_investigation",
        contactSupport: true,
      });
    }

    // Restrict payout if high risk (but allow if reviewed)
    if (riskProfile?.payoutRestricted && !riskProfile.requiresManualReview) {
      // Require manual admin approval
      const payoutRequest = await db.insert(payouts).values({
        userId: parseInt(userId),
        amount,
        method,
        status: "PENDING_REVIEW",
        details: { reason: "risk_restriction" },
      });

      // Notify admin
      await notifyAdmins({
        type: "payout_requires_review",
        userId: parseInt(userId),
        amount,
        riskScore: riskProfile.riskScore,
      });

      return res.json({
        success: true,
        payoutId: payoutRequest.id,
        message:
          "Your payout requires manual review due to security checks",
        status: "pending_review",
      });
    }

    // Normal payout flow
    const payout = await createPayout({
      userId: parseInt(userId),
      amount,
      method,
      accountDetails,
      status: "PROCESSING",
    });

    return res.json({
      success: true,
      payout,
      estimatedTime: "2-3 business days",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

---

### Example 4: Check Referral for Fraud

In `artifacts/api-server/src/routes/affiliate.ts`:

```typescript
import FraudDetectionService from "../lib/fraud-detection-service";

router.post("/referral/create", clerkAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const { referredEmail, referredCode, ipAddress } = req.body;

    // Check for self-referral
    const referredUser = await getUserByEmail(referredEmail);
    
    if (referredUser?.id === parseInt(userId)) {
      return res.status(400).json({
        error: "Self-referrals are not allowed",
        fraudDetected: true,
      });
    }

    // NEW: Detect referral fraud
    try {
      await FraudDetectionService.detectReferralFraud(
        parseInt(userId),
        referredUser.id,
        ipAddress,
        req.body.deviceFingerprint || "unknown"
      );
    } catch (error) {
      logger.error(error, "Error in referral fraud detection");
      // Continue with referral
    }

    // Create referral normally
    const referral = await createReferral({
      referrerId: parseInt(userId),
      referredUserId: referredUser.id,
      referredCode,
      status: "PENDING",
    });

    return res.json({
      success: true,
      referral,
      message: "Referral created successfully",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

---

### Example 5: Middleware for Risk Checking

Create `artifacts/api-server/src/middlewares/fraudCheck.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { db, riskProfiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export const fraudCheckMiddleware =
  (blockLevel: "CRITICAL" | "HIGH" = "CRITICAL") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).auth;
      if (!auth?.userId) return next();

      const userId = parseInt(auth.userId);

      // Get risk profile
      const riskProfile = await db.query.riskProfiles.findFirst({
        where: eq(riskProfiles.userId, userId),
      });

      // Store in request for downstream use
      (req as any).riskProfile = riskProfile;

      // Check if should be blocked
      if (riskProfile?.isBlocked && blockLevel === "CRITICAL") {
        logger.warn(`Access denied for blocked user ${userId}`);
        return res.status(403).json({
          error: "Your account has been suspended",
          blocked: true,
        });
      }

      // Check if high risk and block level is HIGH
      if (
        riskProfile?.riskLevel === "HIGH" &&
        blockLevel === "HIGH"
      ) {
        logger.warn(`Access denied for high-risk user ${userId}`);
        return res.status(403).json({
          error: "Your account requires manual review",
          requiresReview: true,
        });
      }

      next();
    } catch (error) {
      logger.error(error, "Error in fraud check middleware");
      next(); // Continue even if check fails
    }
  };
```

Use the middleware:

```typescript
// Protect sensitive routes
router.post("/payout", fraudCheckMiddleware("CRITICAL"), payoutHandler);
router.post("/withdraw", fraudCheckMiddleware("HIGH"), withdrawHandler);
```

---

### Example 6: Client-Side Risk Warning

In `artifacts/fundedwealth/src/hooks/useFraudCheck.ts`:

```typescript
import { useAuth } from "@clerk/react";
import { useState, useEffect } from "react";

export function useFraudCheck() {
  const { getToken } = useAuth();
  const [riskProfile, setRiskProfile] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [payoutRestricted, setPayoutRestricted] = useState(false);

  useEffect(() => {
    const checkFraud = async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/fraud/risk-score/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          setRiskProfile(profile);
          setIsBlocked(profile.isBlocked);
          setPayoutRestricted(profile.payoutRestricted);
        }
      } catch (error) {
        console.error("Error checking fraud profile:", error);
      }
    };

    checkFraud();
  }, [getToken]);

  return { riskProfile, isBlocked, payoutRestricted };
}
```

Use in component:

```typescript
import { useFraudCheck } from "@/hooks/useFraudCheck";

export function PayoutButton() {
  const { isBlocked, payoutRestricted } = useFraudCheck();

  if (isBlocked) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Account Suspended</AlertTitle>
        <AlertDescription>
          Your account has been suspended. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Button disabled={payoutRestricted}>
      {payoutRestricted ? "Payout Pending Review" : "Request Payout"}
    </Button>
  );
}
```

---

## 📊 Testing Integration

### Test Multi-Account Fraud Detection

```bash
# Login as User 1
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.com",
    "password": "test123",
    "ipAddress": "192.168.1.100",
    "deviceFingerprint": "device-abc123"
  }'

# Login as User 2 with same IP
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@test.com",
    "password": "test123",
    "ipAddress": "192.168.1.100",
    "deviceFingerprint": "device-xyz789"
  }'

# Check both users' risk profiles
# Both should have elevated IP risk
```

### Test Payout Restriction

```bash
# Request payout for high-risk user
curl -X POST http://localhost:5000/api/payouts/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "amount": 50000,
    "method": "bank_transfer",
    "accountDetails": {...}
  }'

# Should return: status = "pending_review" with message
```

---

## 🔐 Production Considerations

1. **IP Geolocation**: Use MaxMind or IP2Location API
2. **Device Fingerprinting**: Integrate FingerprintJS
3. **Email Alerts**: Notify admins of critical events
4. **Audit Logging**: Log all admin actions
5. **Rate Limiting**: Prevent API abuse
6. **Caching**: Cache risk profiles for performance
7. **Monitoring**: Set up alerts for anomalies

---

**Ready to deploy?** Follow the FRAUD_DETECTION_QUICK_START.md guide!
