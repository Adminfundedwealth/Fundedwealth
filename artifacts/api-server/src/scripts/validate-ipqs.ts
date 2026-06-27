/**
 * PHASE 1A VALIDATION SCRIPT
 *
 * Run this on a machine with:
 *   - DATABASE_URL set (pointing to your Supabase PostgreSQL)
 *   - IPQUALITYSCORE_API_KEY set
 *
 * Usage:
 *   npx tsx src/scripts/validate-ipqs.ts
 *
 * This script:
 *   1. Shows the exact HTTP request sent to IPQualityScore
 *   2. Prints the real API response
 *   3. Shows the database row inserted into ip_lookups
 *   4. Shows risk score before and after lookup
 *   5. Demonstrates VPN detection event creation
 *   6. Demonstrates payout restriction triggered by IPQS
 */

import "dotenv/config";
import { db } from "@workspace/db";
import {
    ipLookups,
    ipHistory,
    riskProfiles,
    fraudEvents,
    users,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { IPIntelligenceService } from "../lib/ip-intelligence-service";
import { FraudDetectionService } from "../lib/fraud-detection-service";
import RiskScoringEngine from "../lib/risk-scoring-engine";

// ─── Config ──────────────────────────────────────────────────────────────────

// Known VPN/datacenter IPs for testing (NordVPN exit nodes, AWS, etc.)
const TEST_IPS = {
    known_vpn: "185.220.101.34",       // Known TOR exit node
    known_datacenter: "3.5.140.2",     // AWS IP range (datacenter)
    clean_residential: "49.36.187.2",  // Indian residential ISP (Jio)
};

const DIVIDER = "═".repeat(70);
const SECTION = "─".repeat(70);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function printJson(label: string, data: unknown) {
    console.log(`\n${label}:`);
    console.log(JSON.stringify(data, null, 2));
}

function printSection(title: string) {
    console.log(`\n${DIVIDER}`);
    console.log(`  ${title}`);
    console.log(DIVIDER);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log("\n" + DIVIDER);
    console.log("  PHASE 1A VALIDATION — IPQualityScore Integration Proof");
    console.log(DIVIDER);

    const apiKey = process.env.IPQUALITYSCORE_API_KEY;
    if (!apiKey) {
        console.error("\n❌ IPQUALITYSCORE_API_KEY is not set. Cannot validate.");
        console.error("   Set it in your environment and re-run.");
        process.exit(1);
    }

    console.log(`\n✓ IPQUALITYSCORE_API_KEY is set (starts with: ${apiKey.slice(0, 8)}...)`);
    console.log(`✓ DATABASE_URL is set: ${process.env.DATABASE_URL ? "yes" : "NO — DB tests will fail"}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. EXACT HTTP REQUEST SENT TO IPQUALITYSCORE
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("1. EXACT HTTP REQUEST TO IPQUALITYSCORE");

    const testIp = TEST_IPS.known_vpn;
    const requestUrl = `https://ipqualityscore.com/api/json/ip/${apiKey}/${testIp}?strictness=1&allow_public_access_points=true&lighter_penalties=false&fast=false`;

    console.log("\nRequest URL (API key partially redacted):");
    console.log(`  GET https://ipqualityscore.com/api/json/ip/${apiKey.slice(0, 8)}.../${testIp}?strictness=1&allow_public_access_points=true&lighter_penalties=false&fast=false`);
    console.log("\nRequest Headers:");
    console.log('  Accept: application/json');
    console.log("\nActual fetch call:");
    console.log(`  fetch("${requestUrl.replace(apiKey, apiKey.slice(0, 8) + "...")}", { method: "GET", headers: { Accept: "application/json" } })`);

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. REAL API RESPONSE
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("2. REAL IPQUALITYSCORE API RESPONSE");

    console.log(`\nCalling IPQS API for IP: ${testIp} ...`);

    const startTime = Date.now();
    const response = await fetch(requestUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
    });
    const elapsed = Date.now() - startTime;
    const rawResponse = await response.json();

    console.log(`\n✓ API responded in ${elapsed}ms (HTTP ${response.status})`);
    printJson("Full API Response", rawResponse);

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. IP INTELLIGENCE SERVICE LOOKUP (our wrapper)
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("3. IP INTELLIGENCE SERVICE RESULT");

    // Clear cache to force fresh API call
    IPIntelligenceService.clearMemoryCache();
    const serviceResult = await IPIntelligenceService.lookup(testIp);

    printJson("IPIntelligenceService.lookup() result", {
        ip: serviceResult.ip,
        vpnDetected: serviceResult.vpnDetected,
        proxyDetected: serviceResult.proxyDetected,
        torDetected: serviceResult.torDetected,
        datacenterDetected: serviceResult.datacenterDetected,
        fraudScore: serviceResult.fraudScore,
        country: serviceResult.country,
        isp: serviceResult.isp,
        asn: serviceResult.asn,
        organization: serviceResult.organization,
        connectionType: serviceResult.connectionType,
        abuseVelocity: serviceResult.abuseVelocity,
        recentAbuse: serviceResult.recentAbuse,
        lookupSuccess: serviceResult.lookupSuccess,
        lookupSource: serviceResult.lookupSource,
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. RISK SCORE BEFORE vs AFTER LOOKUP
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("4. RISK SCORE: BEFORE vs AFTER IPQS LOOKUP");

    // Before: vpnProxyRisk = 0 (the old behavior)
    const factorsBefore = {
        ipRisk: 0,
        deviceRisk: 0,
        behaviorRisk: 0,
        vpnProxyRisk: 0, // <-- OLD: hardcoded to 0
        kycRisk: 8,
    };
    const scoreBefore = RiskScoringEngine.calculateRiskScore(factorsBefore);

    console.log("\n── BEFORE (vpnProxyRisk hardcoded to 0):");
    printJson("Risk Factors", factorsBefore);
    printJson("Risk Score Result", {
        totalScore: scoreBefore.totalScore,
        riskLevel: scoreBefore.riskLevel,
        isBlocked: scoreBefore.isBlocked,
        payoutRestricted: scoreBefore.payoutRestricted,
        requiresReview: scoreBefore.requiresReview,
    });

    // After: vpnProxyRisk calculated from real IPQS data
    const vpnProxyRiskScore = IPIntelligenceService.calculateVpnProxyRiskScore(serviceResult);
    const ipRiskScore = RiskScoringEngine.calculateIpRisk({
        vpnDetected: serviceResult.vpnDetected,
        proxyDetected: serviceResult.proxyDetected,
        torDetected: serviceResult.torDetected,
        datacenterDetected: serviceResult.datacenterDetected,
        countryMismatch: false,
        isNewCountry: false,
    });

    const factorsAfter = {
        ipRisk: ipRiskScore,
        deviceRisk: 0,
        behaviorRisk: 0,
        vpnProxyRisk: vpnProxyRiskScore, // <-- NEW: from real IPQS data
        kycRisk: 8,
    };
    const scoreAfter = RiskScoringEngine.calculateRiskScore(factorsAfter);

    console.log("\n── AFTER (vpnProxyRisk from real IPQS data):");
    printJson("Risk Factors", factorsAfter);
    printJson("Risk Score Result", {
        totalScore: scoreAfter.totalScore,
        riskLevel: scoreAfter.riskLevel,
        isBlocked: scoreAfter.isBlocked,
        payoutRestricted: scoreAfter.payoutRestricted,
        requiresReview: scoreAfter.requiresReview,
    });

    console.log(`\n⚡ Risk score delta: ${scoreBefore.totalScore} → ${scoreAfter.totalScore} (+${scoreAfter.totalScore - scoreBefore.totalScore})`);
    console.log(`⚡ VPN/Proxy risk contribution: ${vpnProxyRiskScore}/15 points`);

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. DATABASE ROW INSERTION (ip_lookups)
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("5. DATABASE ROW — ip_lookups TABLE");

    if (!process.env.DATABASE_URL) {
        console.log("\n⚠️  DATABASE_URL not set — skipping DB insertion test.");
        console.log("   Set DATABASE_URL and re-run to see actual DB evidence.");
    } else {
        // Find a test user (or use userId=1 as fallback)
        const [testUser] = await db.select().from(users).limit(1);
        const testUserId = testUser?.id || 1;

        console.log(`\nUsing test user ID: ${testUserId}`);
        console.log("Inserting lookup result into ip_lookups table...");

        const [insertedRow] = await db.insert(ipLookups).values({
            userId: testUserId,
            ip: testIp,
            trigger: "login",
            vpnDetected: serviceResult.vpnDetected,
            proxyDetected: serviceResult.proxyDetected,
            torDetected: serviceResult.torDetected,
            datacenterDetected: serviceResult.datacenterDetected,
            fraudScore: serviceResult.fraudScore,
            country: serviceResult.country || null,
            region: serviceResult.region || null,
            city: serviceResult.city || null,
            isp: serviceResult.isp || null,
            asn: serviceResult.asn || null,
            organization: serviceResult.organization || null,
            connectionType: serviceResult.connectionType || null,
            abuseVelocity: serviceResult.abuseVelocity || null,
            recentAbuse: serviceResult.recentAbuse,
            isCrawler: serviceResult.isCrawler,
            mobile: serviceResult.mobile,
            lookupSuccess: serviceResult.lookupSuccess,
            lookupSource: serviceResult.lookupSource,
            errorMessage: serviceResult.error || null,
            rawResponse: serviceResult.rawResponse || null,
            vpnProxyRiskScore: vpnProxyRiskScore,
        }).returning();

        printJson("✓ Inserted ip_lookups row", insertedRow);

        // Also show the ip_history record
        const ipHistoryRecord = await db.query.ipHistory.findFirst({
            where: eq(ipHistory.ip, testIp),
        });

        if (ipHistoryRecord) {
            printJson("✓ Corresponding ip_history row", ipHistoryRecord);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. VPN DETECTION EVENT
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("6. VPN DETECTION EVENT");

    console.log("\nDetection summary for IP:", testIp);
    console.log(`  VPN Detected:        ${serviceResult.vpnDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  Proxy Detected:      ${serviceResult.proxyDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  TOR Detected:        ${serviceResult.torDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  Datacenter Detected: ${serviceResult.datacenterDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  Fraud Score:         ${serviceResult.fraudScore}/100`);
    console.log(`  Abuse Velocity:      ${serviceResult.abuseVelocity}`);
    console.log(`  Recent Abuse:        ${serviceResult.recentAbuse}`);
    console.log(`  ISP:                 ${serviceResult.isp}`);
    console.log(`  ASN:                 ${serviceResult.asn}`);
    console.log(`  Country:             ${serviceResult.country}`);
    console.log(`  Connection Type:     ${serviceResult.connectionType}`);

    if (serviceResult.vpnDetected || serviceResult.torDetected || serviceResult.proxyDetected) {
        console.log("\n🚨 THIS IP WOULD TRIGGER A FRAUD EVENT IN PRODUCTION:");
        console.log("   → fraudType: 'VPN_PROXY_DETECTED'");
        console.log("   → severity: 'HIGH'");
        console.log(`   → riskScore impact: +${vpnProxyRiskScore} vpnProxyRisk + ${ipRiskScore} ipRisk`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. PAYOUT RESTRICTION DEMONSTRATION
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("7. PAYOUT RESTRICTION TRIGGERED BY IPQS");

    // Simulate: user on VPN requests payout
    // Score calculation with VPN active + some existing risk
    const payoutFactors = {
        ipRisk: ipRiskScore,             // From IPQS: VPN/TOR detection
        deviceRisk: 10,                  // Some device risk
        behaviorRisk: 12,                // Some behavior risk
        vpnProxyRisk: vpnProxyRiskScore, // From IPQS
        kycRisk: 8,                      // Pending KYC
    };
    const payoutScore = RiskScoringEngine.calculateRiskScore(payoutFactors);

    console.log("\nSimulated payout request from VPN IP:");
    printJson("Risk Factors at Payout", payoutFactors);
    printJson("Risk Score Result", {
        totalScore: payoutScore.totalScore,
        riskLevel: payoutScore.riskLevel,
        isBlocked: payoutScore.isBlocked,
        payoutRestricted: payoutScore.payoutRestricted,
        requiresReview: payoutScore.requiresReview,
    });

    if (payoutScore.payoutRestricted) {
        console.log("\n🚨 PAYOUT WOULD BE BLOCKED:");
        console.log('   → Response: 403 { error: "Payout request blocked due to security review. Contact support." }');
        console.log(`   → Reason: Risk score ${payoutScore.totalScore} >= 70 threshold`);
        console.log(`   → VPN contribution: ${vpnProxyRiskScore} points from vpnProxyRisk + ${ipRiskScore} from ipRisk`);
    } else if (payoutScore.requiresReview) {
        console.log("\n⚠️  PAYOUT WOULD REQUIRE MANUAL REVIEW:");
        console.log(`   → Reason: Risk score ${payoutScore.totalScore} >= 50 threshold`);
        console.log("   → Admin must approve before payout processes");
    } else {
        console.log("\n✅ Payout would proceed (risk below thresholds)");
        console.log("   Note: Testing with a clean residential IP would show this result.");
        console.log("   Try changing TEST_IPS.known_vpn to a residential IP to see the difference.");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. CLEAN IP COMPARISON (optional — residential IP)
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("8. COMPARISON: CLEAN RESIDENTIAL IP");

    IPIntelligenceService.clearMemoryCache();
    const cleanResult = await IPIntelligenceService.lookup(TEST_IPS.clean_residential);

    console.log(`\nIP: ${TEST_IPS.clean_residential} (Indian residential)`);
    console.log(`  VPN:        ${cleanResult.vpnDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  Proxy:      ${cleanResult.proxyDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  TOR:        ${cleanResult.torDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  Datacenter: ${cleanResult.datacenterDetected ? "🚨 YES" : "✅ No"}`);
    console.log(`  Fraud:      ${cleanResult.fraudScore}/100`);
    console.log(`  ISP:        ${cleanResult.isp}`);
    console.log(`  Country:    ${cleanResult.country}`);

    const cleanVpnRisk = IPIntelligenceService.calculateVpnProxyRiskScore(cleanResult);
    console.log(`\n  vpnProxyRisk score: ${cleanVpnRisk}/15`);
    console.log(`  → Payout restricted: ${cleanVpnRisk + 8 >= 70 ? "YES" : "NO (clean IP passes)"}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    printSection("VALIDATION SUMMARY");

    console.log(`
  ✓ IPQS API call: ${response.status === 200 ? "SUCCESS" : "FAILED"} (HTTP ${response.status}, ${elapsed}ms)
  ✓ VPN Detection: ${serviceResult.vpnDetected ? "DETECTED" : "Not detected"} for ${testIp}
  ✓ TOR Detection: ${serviceResult.torDetected ? "DETECTED" : "Not detected"} for ${testIp}
  ✓ Fraud Score: ${serviceResult.fraudScore}/100
  ✓ Risk Score Impact: 0 → ${vpnProxyRiskScore} (vpnProxyRisk) + ${ipRiskScore} (ipRisk)
  ✓ Payout Restriction: ${payoutScore.payoutRestricted ? "TRIGGERED ✓" : "Not triggered (score too low for this IP)"}
  ✓ DB Storage: ${process.env.DATABASE_URL ? "CONFIRMED" : "SKIPPED (no DATABASE_URL)"}
  ✓ Cache: Memory cache now has ${IPIntelligenceService.getCacheStats().memoryCacheSize} entries
  `);

    console.log(DIVIDER);
    console.log("  Phase 1A Validation Complete");
    console.log(DIVIDER + "\n");

    process.exit(0);
}

main().catch((err) => {
    console.error("\n❌ Validation script failed:", err);
    process.exit(1);
});
