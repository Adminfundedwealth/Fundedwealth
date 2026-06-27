/**
 * PHASE 1B VALIDATION SCRIPT — Backend Portion
 *
 * This script validates:
 *   - device_history storage
 *   - Multi-account detection (two users, one fingerprint)
 *   - Fraud event generation
 *   - Risk score before/after fingerprint
 *   - Admin dashboard cluster output
 *
 * Prerequisites:
 *   - DATABASE_URL set (Supabase PostgreSQL)
 *
 * Usage:
 *   npx tsx src/scripts/validate-fingerprint.ts
 *
 * NOTE: The browser-side FingerprintJS Pro validation (real visitorId generation,
 * real API response) must be done in the browser console after deployment.
 * See BROWSER VALIDATION STEPS at the bottom of this script.
 */

import "dotenv/config";
import { db } from "@workspace/db";
import { deviceHistory, users, fraudEvents, riskProfiles } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { DeviceFingerprintService } from "../lib/device-fingerprint-service";
import RiskScoringEngine from "../lib/risk-scoring-engine";

const DIVIDER = "═".repeat(70);
const SECTION = "─".repeat(70);

function printJson(label: string, data: unknown) {
    console.log(`\n${label}:`);
    console.log(JSON.stringify(data, null, 2));
}

function printSection(title: string) {
    console.log(`\n${DIVIDER}`);
    console.log(`  ${title}`);
    console.log(DIVIDER);
}

async function main() {
    console.log("\n" + DIVIDER);
    console.log("  PHASE 1B VALIDATION — FingerprintJS Pro Integration (Backend)");
    console.log(DIVIDER);

    if (!process.env.DATABASE_URL) {
        console.error("\n❌ DATABASE_URL not set. Cannot validate.");
        process.exit(1);
    }
    console.log("\n✓ DATABASE_URL is set");

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. SIMULATE A REAL FINGERPRINT REPORT (what the frontend POST sends)
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("1. SIMULATE POST /api/fingerprint/report");

    // Get two test users from the DB
    const testUsers = await db.select().from(users).limit(2);
    if (testUsers.length < 2) {
        console.error("❌ Need at least 2 users in the database to test multi-account detection.");
        console.error("   Create test users first.");
        process.exit(1);
    }

    const user1 = testUsers[0];
    const user2 = testUsers[1];

    console.log(`\n  User 1: id=${user1.id}, email=${user1.email}`);
    console.log(`  User 2: id=${user2.id}, email=${user2.email}`);

    // Simulate a FingerprintJS Pro visitorId (in production, this comes from the browser SDK)
    const testVisitorId = "fpjs_test_" + Date.now().toString(36) + "_validation";

    console.log(`\n  Simulated visitorId: ${testVisitorId}`);
    console.log("  (In production, this is a 20-char alphanumeric string from FingerprintJS Pro)");

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. RECORD FINGERPRINT FOR USER 1
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("2. RECORD FINGERPRINT — USER 1");

    const result1 = await DeviceFingerprintService.recordFingerprint({
        userId: user1.id,
        visitorId: testVisitorId,
        browser: "Chrome 126.0",
        os: "Windows 11",
        timezone: "Asia/Kolkata",
        screenResolution: "1920x1080",
        language: "en-IN",
        incognito: false,
        ip: "49.36.187.100",
        country: "IN",
    });

    printJson("✓ RecordFingerprint result for User 1", result1);

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. SHOW THE ACTUAL device_history ROW
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("3. ACTUAL device_history ROW IN DATABASE");

    const [dbRow1] = await db
        .select()
        .from(deviceHistory)
        .where(
            and(
                eq(deviceHistory.userId, user1.id),
                eq(deviceHistory.deviceFingerprint, testVisitorId)
            )
        )
        .limit(1);

    printJson("✓ device_history row (User 1)", dbRow1);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. RECORD SAME FINGERPRINT FOR USER 2 (triggers multi-account detection)
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("4. RECORD SAME FINGERPRINT — USER 2 (multi-account trigger)");

    const result2 = await DeviceFingerprintService.recordFingerprint({
        userId: user2.id,
        visitorId: testVisitorId,
        browser: "Chrome 126.0",
        os: "Windows 11",
        timezone: "Asia/Kolkata",
        screenResolution: "1920x1080",
        language: "en-IN",
        incognito: false,
        ip: "49.36.187.100",
        country: "IN",
    });

    printJson("✓ RecordFingerprint result for User 2", result2);

    const [dbRow2] = await db
        .select()
        .from(deviceHistory)
        .where(
            and(
                eq(deviceHistory.userId, user2.id),
                eq(deviceHistory.deviceFingerprint, testVisitorId)
            )
        )
        .limit(1);

    printJson("✓ device_history row (User 2 — same fingerprint)", dbRow2);

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. RUN FRAUD DETECTION (should detect multi-account)
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("5. FRAUD DETECTION — MULTI-ACCOUNT DETECTION");

    const fraudResult = await DeviceFingerprintService.detectFraud(
        user2.id,
        testVisitorId,
        "49.36.187.100"
    );

    printJson("✓ Fraud detection result", fraudResult);

    if (fraudResult.multiAccountDetected) {
        console.log("\n  🚨 MULTI-ACCOUNT DETECTED:");
        console.log(`     User ${user2.id} shares fingerprint with users: [${fraudResult.sharedUserIds.join(", ")}]`);
        console.log(`     Risk contribution: ${fraudResult.riskContribution}/20 points`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. SHOW FRAUD EVENT IN DATABASE
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("6. FRAUD EVENT GENERATED");

    const recentFraudEvents = await db
        .select()
        .from(fraudEvents)
        .where(
            and(
                eq(fraudEvents.userId, user2.id),
                eq(fraudEvents.fraudType, "MULTI_ACCOUNT")
            )
        )
        .orderBy(desc(fraudEvents.createdAt))
        .limit(1);

    if (recentFraudEvents.length > 0) {
        printJson("✓ Fraud event row in database", recentFraudEvents[0]);
    } else {
        console.log("  ⚠️ No fraud event found (may have been deduplicated if already exists)");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. RISK SCORE COMPARISON: BEFORE vs AFTER FINGERPRINT
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("7. RISK SCORE: BEFORE vs AFTER FINGERPRINT DATA");

    // BEFORE: using user-agent as fingerprint (old behavior — unique per user)
    const factorsBefore = {
        ipRisk: 0,
        deviceRisk: 0, // user-agent is unique → no shared device detected
        behaviorRisk: 0,
        vpnProxyRisk: 0,
        kycRisk: 8,
    };
    const scoreBefore = RiskScoringEngine.calculateRiskScore(factorsBefore);

    console.log("\n── BEFORE (user-agent as fingerprint — no multi-account detected):");
    printJson("Factors", factorsBefore);
    console.log(`  Total Score: ${scoreBefore.totalScore} | Level: ${scoreBefore.riskLevel}`);
    console.log(`  Payout Restricted: ${scoreBefore.payoutRestricted}`);

    // AFTER: using FingerprintJS visitorId (shared device detected)
    const factorsAfter = {
        ipRisk: 0,
        deviceRisk: fraudResult.riskContribution, // 12-20 points from multi-account
        behaviorRisk: 0,
        vpnProxyRisk: 0,
        kycRisk: 8,
    };
    const scoreAfter = RiskScoringEngine.calculateRiskScore(factorsAfter);

    console.log("\n── AFTER (FingerprintJS visitorId — multi-account detected):");
    printJson("Factors", factorsAfter);
    console.log(`  Total Score: ${scoreAfter.totalScore} | Level: ${scoreAfter.riskLevel}`);
    console.log(`  Payout Restricted: ${scoreAfter.payoutRestricted}`);
    console.log(`\n  ⚡ Risk delta: ${scoreBefore.totalScore} → ${scoreAfter.totalScore} (+${scoreAfter.totalScore - scoreBefore.totalScore})`);

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. ADMIN DASHBOARD: FINGERPRINT CLUSTERS
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("8. ADMIN DASHBOARD — FINGERPRINT CLUSTERS");

    const clusters = await DeviceFingerprintService.getSuspiciousClusters(2);

    console.log(`\n  Found ${clusters.length} suspicious clusters (2+ users per fingerprint):\n`);

    for (const cluster of clusters.slice(0, 5)) {
        console.log(`  Fingerprint: ${cluster.fingerprint}`);
        console.log(`    Users: ${cluster.userCount} | Total visits: ${cluster.totalSeen}`);
        console.log(`    Last activity: ${cluster.lastActivity}`);
        for (const u of cluster.users) {
            console.log(`      - userId=${u.userId}, lastSeen=${u.lastSeen}, browser=${u.browser}`);
        }
        console.log("");
    }

    if (clusters.length === 0) {
        console.log("  (No clusters found — our test data should appear above)");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 9. SUSPICIOUS DEVICE CHECK (admin tool)
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("9. SUSPICIOUS DEVICE CHECK");

    const suspiciousCheck = await DeviceFingerprintService.isDeviceSuspicious(testVisitorId);
    printJson("isDeviceSuspicious() result", suspiciousCheck);

    // ═══════════════════════════════════════════════════════════════════════════
    // CLEANUP — Remove test data
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("CLEANUP");

    await db
        .delete(deviceHistory)
        .where(eq(deviceHistory.deviceFingerprint, testVisitorId));

    await db
        .delete(fraudEvents)
        .where(
            and(
                eq(fraudEvents.userId, user2.id),
                eq(fraudEvents.fraudType, "MULTI_ACCOUNT"),
                sql`details->>'visitorIdPrefix' = ${testVisitorId.slice(0, 12)}`
            )
        );

    console.log("\n  ✓ Test fingerprint data cleaned up from device_history");
    console.log("  ✓ Test fraud events cleaned up");

    // ═══════════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("VALIDATION SUMMARY");

    console.log(`
  ✓ Fingerprint recorded for User 1: ${result1.isNew ? "NEW device" : "Existing device"}
  ✓ Fingerprint recorded for User 2: ${result2.isNew ? "NEW device" : "Existing device"}
  ✓ Multi-account detected: ${fraudResult.multiAccountDetected ? "YES ✓" : "NO"}
  ✓ Shared user IDs: [${fraudResult.sharedUserIds.join(", ")}]
  ✓ Account sharing detected: ${fraudResult.accountSharingDetected ? "YES ✓" : "NO"}
  ✓ Risk contribution: ${fraudResult.riskContribution}/20 device risk points
  ✓ Risk score impact: ${scoreBefore.totalScore} → ${scoreAfter.totalScore}
  ✓ Clusters found: ${clusters.length}
  ✓ Device suspicious: ${suspiciousCheck.suspicious ? "YES" : "NO"} (${suspiciousCheck.linkedAccounts} linked accounts)
  `);

    // ═══════════════════════════════════════════════════════════════════════════
    // BROWSER VALIDATION INSTRUCTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("BROWSER VALIDATION STEPS (run manually after deployment)");

    console.log(`
  After deploying the frontend with VITE_FINGERPRINTJS_API_KEY set:

  1. OPEN BROWSER CONSOLE on your deployed site (https://www.fundedwealth.com)

  2. VERIFY FINGERPRINTJS LOADED:
     > document.querySelectorAll('script[src*="fingerprint"]')
     Should show the FPJS script tag loaded.

  3. GET REAL VISITOR ID (paste in console):
     > import('@fingerprintjs/fingerprintjs-pro').then(FP => 
         FP.load({ apiKey: 'YOUR_KEY', region: 'ap' }).then(agent => 
           agent.get({ extendedResult: true }).then(r => console.log(JSON.stringify(r, null, 2)))
         )
       )

     This will print the REAL FingerprintJS Pro response including:
     - visitorId (20-char unique device ID)
     - confidence.score (0-1)
     - browserName, os, device
     - incognito (boolean)
     - ip, ipLocation

  4. CHECK NETWORK TAB:
     Filter by "fingerprint" or "report" — you should see:
     - Request to https://api.fpjs.io/ (FingerprintJS API)
     - POST to /api/fingerprint/report (your backend)

  5. VERIFY BACKEND STORAGE:
     After logging in, run in your DB:
     SELECT * FROM device_history ORDER BY last_seen DESC LIMIT 5;

  6. TEST MULTI-ACCOUNT:
     - Log in as User A → fingerprint recorded
     - Log out, log in as User B on SAME browser → same visitorId sent
     - Check: SELECT * FROM fraud_events WHERE fraud_type = 'MULTI_ACCOUNT' ORDER BY created_at DESC LIMIT 5;

  7. CHECK ADMIN DASHBOARD:
     GET /api/admin/fingerprints/dashboard (with admin auth)
     GET /api/admin/fingerprints/clusters (shows devices shared by 2+ users)
  `);

    console.log(DIVIDER);
    console.log("  Phase 1B Backend Validation Complete");
    console.log(DIVIDER + "\n");

    process.exit(0);
}

main().catch((err) => {
    console.error("\n❌ Validation failed:", err);
    process.exit(1);
});
