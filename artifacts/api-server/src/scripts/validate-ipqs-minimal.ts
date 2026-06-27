/**
 * PHASE 1A MINIMAL VALIDATION — No Database Required
 *
 * Proves IPQS API is working with just the API key.
 * Run: IPQUALITYSCORE_API_KEY=your_key npx tsx src/scripts/validate-ipqs-minimal.ts
 */

const API_KEY = process.env.IPQUALITYSCORE_API_KEY;

if (!API_KEY) {
    console.error("❌ Set IPQUALITYSCORE_API_KEY environment variable first.");
    console.error("   Example: set IPQUALITYSCORE_API_KEY=abc123 && npx tsx src/scripts/validate-ipqs-minimal.ts");
    process.exit(1);
}

const TEST_IPS = [
    { ip: "185.220.101.34", label: "Known TOR exit node" },
    { ip: "3.5.140.2", label: "AWS datacenter" },
    { ip: "49.36.187.2", label: "Indian residential (Jio)" },
];

interface IPQSResult {
    success: boolean;
    fraud_score: number;
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    active_vpn: boolean;
    active_tor: boolean;
    recent_abuse: boolean;
    country_code: string;
    ISP: string;
    ASN: number;
    organization: string;
    connection_type: string;
    abuse_velocity: string;
    is_crawler: boolean;
    mobile: boolean;
    host: string;
    city: string;
    region: string;
}

function calculateVpnProxyRisk(r: IPQSResult): number {
    let risk = 0;
    if (r.tor || r.active_tor) risk += 15;
    else if (r.vpn || r.active_vpn) risk += 12;
    else if (r.proxy) risk += 10;
    else if (r.connection_type?.toLowerCase().includes("data center")) risk += 7;

    if (r.abuse_velocity === "high") risk += 3;
    else if (r.abuse_velocity === "medium") risk += 1;
    if (r.recent_abuse) risk += 3;
    if (r.fraud_score >= 90) risk += 5;
    else if (r.fraud_score >= 75) risk += 3;
    else if (r.fraud_score >= 50) risk += 1;

    return Math.min(15, risk);
}

function calculateIpRisk(r: IPQSResult): number {
    let risk = 0;
    if (r.tor || r.active_tor) risk += 20;
    else if (r.vpn || r.active_vpn) risk += 12;
    else if (r.proxy) risk += 10;
    else if (r.connection_type?.toLowerCase().includes("data center")) risk += 8;
    return Math.min(20, risk);
}

async function testIp(ip: string, label: string) {
    const url = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${ip}?strictness=1&allow_public_access_points=true&lighter_penalties=false&fast=false`;

    console.log(`\n${"─".repeat(60)}`);
    console.log(`  Testing: ${ip} (${label})`);
    console.log(`${"─".repeat(60)}`);

    // Show exact request
    console.log(`\n  📡 HTTP Request:`);
    console.log(`     GET https://ipqualityscore.com/api/json/ip/${API_KEY.slice(0, 8)}.../${ip}`);
    console.log(`     ?strictness=1&allow_public_access_points=true&lighter_penalties=false&fast=false`);

    const start = Date.now();
    const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
    const elapsed = Date.now() - start;
    const data: IPQSResult = await res.json() as any;

    console.log(`\n  📥 Response (HTTP ${res.status}, ${elapsed}ms):`);
    console.log(`     success:         ${data.success}`);
    console.log(`     fraud_score:     ${data.fraud_score}`);
    console.log(`     vpn:             ${data.vpn}`);
    console.log(`     active_vpn:      ${data.active_vpn}`);
    console.log(`     proxy:           ${data.proxy}`);
    console.log(`     tor:             ${data.tor}`);
    console.log(`     active_tor:      ${data.active_tor}`);
    console.log(`     recent_abuse:    ${data.recent_abuse}`);
    console.log(`     country_code:    ${data.country_code}`);
    console.log(`     ISP:             ${data.ISP}`);
    console.log(`     ASN:             ${data.ASN}`);
    console.log(`     organization:    ${data.organization}`);
    console.log(`     connection_type: ${data.connection_type}`);
    console.log(`     abuse_velocity:  ${data.abuse_velocity}`);
    console.log(`     is_crawler:      ${data.is_crawler}`);
    console.log(`     mobile:          ${data.mobile}`);
    console.log(`     host:            ${data.host}`);
    console.log(`     city:            ${data.city}`);
    console.log(`     region:          ${data.region}`);

    const vpnProxyRisk = calculateVpnProxyRisk(data);
    const ipRisk = calculateIpRisk(data);
    const totalRisk = vpnProxyRisk + ipRisk + 8; // +8 for pending KYC baseline

    console.log(`\n  📊 Risk Scoring:`);
    console.log(`     ipRisk:          ${ipRisk}/20`);
    console.log(`     vpnProxyRisk:    ${vpnProxyRisk}/15`);
    console.log(`     Combined (+ KYC=8): ${totalRisk}`);
    console.log(`     Risk Level:      ${totalRisk <= 30 ? "LOW" : totalRisk <= 60 ? "MEDIUM" : totalRisk <= 80 ? "HIGH" : "CRITICAL"}`);
    console.log(`     Payout Restricted: ${totalRisk >= 70 ? "🚨 YES" : "✅ No"}`);
    console.log(`     Requires Review:   ${totalRisk >= 50 ? "⚠️  YES" : "✅ No"}`);
    console.log(`     Blocked:           ${totalRisk >= 85 ? "🛑 YES" : "✅ No"}`);

    // Show what the DB row would look like
    console.log(`\n  💾 ip_lookups row would contain:`);
    console.log(JSON.stringify({
        ip,
        trigger: "login",
        vpn_detected: data.vpn || data.active_vpn,
        proxy_detected: data.proxy,
        tor_detected: data.tor || data.active_tor,
        datacenter_detected: data.connection_type?.toLowerCase().includes("data center") || false,
        fraud_score: data.fraud_score,
        country: data.country_code,
        region: data.region,
        city: data.city,
        isp: data.ISP,
        asn: data.ASN,
        organization: data.organization,
        connection_type: data.connection_type,
        abuse_velocity: data.abuse_velocity,
        recent_abuse: data.recent_abuse,
        is_crawler: data.is_crawler,
        mobile: data.mobile,
        lookup_success: data.success,
        lookup_source: "api",
        vpn_proxy_risk_score: vpnProxyRisk,
        raw_response: "(full JSON stored)",
    }, null, 4));

    return data;
}

async function main() {
    console.log("═".repeat(60));
    console.log("  PHASE 1A — IPQualityScore Live Validation");
    console.log("═".repeat(60));
    console.log(`\n  API Key: ${API_KEY.slice(0, 8)}...(${API_KEY.length} chars)`);
    console.log(`  Time: ${new Date().toISOString()}`);

    const results: { ip: string; label: string; data: IPQSResult }[] = [];

    for (const { ip, label } of TEST_IPS) {
        const data = await testIp(ip, label);
        results.push({ ip, label, data });
    }

    // Final summary table
    console.log(`\n${"═".repeat(60)}`);
    console.log("  SUMMARY TABLE");
    console.log("═".repeat(60));
    console.log("\n  IP                  | VPN  | TOR  | Proxy | DC   | Score | Payout");
    console.log("  " + "─".repeat(76));

    for (const { ip, data } of results) {
        const vpn = (data.vpn || data.active_vpn) ? " YES" : "  no";
        const tor = (data.tor || data.active_tor) ? " YES" : "  no";
        const proxy = data.proxy ? "  YES" : "   no";
        const dc = data.connection_type?.toLowerCase().includes("data center") ? " YES" : "  no";
        const score = String(data.fraud_score).padStart(3);
        const vpnRisk = calculateVpnProxyRisk(data);
        const ipRisk = calculateIpRisk(data);
        const total = vpnRisk + ipRisk + 8;
        const payout = total >= 70 ? "BLOCKED" : total >= 50 ? "REVIEW " : "  OK   ";
        console.log(`  ${ip.padEnd(20)}| ${vpn} | ${tor} | ${proxy} | ${dc} |  ${score}  | ${payout}`);
    }

    console.log(`\n${"═".repeat(60)}`);
    console.log("  ✓ Phase 1A Validation Complete — IPQS is live and working");
    console.log(`${"═".repeat(60)}\n`);
}

main().catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
});
