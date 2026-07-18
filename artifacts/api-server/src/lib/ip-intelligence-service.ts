/**
 * IP Intelligence Service — ProxyCheck.io Integration (Free Tier)
 *
 * Production-grade VPN, proxy, TOR, and datacenter IP detection.
 * Free tier: 1,000 queries/day (no credit card required).
 *
 * API: https://proxycheck.io/api/
 * Includes in-memory + DB caching to stay within free limits.
 */

import { db } from "@workspace/db";
import { ipHistory } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { logger } from "./logger";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProxyCheckResponse {
    status: "ok" | "error" | "warning" | "denied";
    message?: string;
    [ip: string]: {
        asn: string;
        provider: string;
        continent: string;
        country: string;
        isocode: string;
        region: string;
        regioncode: string;
        city: string;
        latitude: number;
        longitude: number;
        proxy: "yes" | "no";
        type: string; // VPN, TOR, SOCKS, HTTP, etc.
        risk: number; // 0-100
        port?: string;
        last_seen?: string;
        operator?: {
            name: string;
            url: string;
        };
    } | any;
}

export interface IPIntelligenceResult {
    ip: string;
    vpnDetected: boolean;
    proxyDetected: boolean;
    torDetected: boolean;
    datacenterDetected: boolean;
    fraudScore: number;
    country: string;
    region: string;
    city: string;
    isp: string;
    asn: number;
    organization: string;
    connectionType: string;
    abuseVelocity: string;
    recentAbuse: boolean;
    isCrawler: boolean;
    mobile: boolean;
    lookupSuccess: boolean;
    lookupSource: "api" | "cache_memory" | "cache_db" | "unavailable";
    rawResponse?: any;
    error?: string;
}

// ─── In-Memory Cache ─────────────────────────────────────────────────────────

interface CacheEntry {
    result: IPIntelligenceResult;
    expiresAt: number;
}

const MEMORY_CACHE = new Map<string, CacheEntry>();
const MEMORY_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (aggressive caching for free tier)
const DB_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (very aggressive for free tier)
const MAX_MEMORY_CACHE_SIZE = 10000;

// ─── Service ─────────────────────────────────────────────────────────────────

export class IPIntelligenceService {
    private static readonly API_BASE = "https://proxycheck.io/v2";

    /**
     * Main lookup — memory cache → DB cache → ProxyCheck API
     * Never throws.
     */
    static async lookup(ip: string): Promise<IPIntelligenceResult> {
        if (this.isPrivateIp(ip)) {
            return this.createUnavailableResult(ip, "private_ip");
        }

        // 1. Memory cache
        const memoryCached = this.getFromMemoryCache(ip);
        if (memoryCached) {
            return { ...memoryCached, lookupSource: "cache_memory" };
        }

        // 2. DB cache (7 day TTL for free tier conservation)
        const dbCached = await this.getFromDbCache(ip);
        if (dbCached) {
            this.setMemoryCache(ip, dbCached);
            return { ...dbCached, lookupSource: "cache_db" };
        }

        // 3. ProxyCheck.io API
        const apiResult = await this.callProxyCheck(ip);

        if (apiResult.lookupSuccess) {
            this.setMemoryCache(ip, apiResult);
        }

        return apiResult;
    }

    /**
     * Full lookup + store in DB for a specific user.
     */
    static async lookupAndStore(
        ip: string,
        userId: string,
        trigger: "signup" | "login" | "challenge_purchase" | "payout_request"
    ): Promise<IPIntelligenceResult> {
        const result = await this.lookup(ip);

        try {
            await this.storeIpHistory(ip, userId, result);
        } catch (err) {
            logger.error({ err, ip, userId, trigger }, "Failed to store IP history");
        }

        logger.info(
            {
                ip,
                userId,
                trigger,
                vpn: result.vpnDetected,
                proxy: result.proxyDetected,
                tor: result.torDetected,
                datacenter: result.datacenterDetected,
                fraudScore: result.fraudScore,
                source: result.lookupSource,
            },
            "IP intelligence lookup completed"
        );

        return result;
    }

    /**
     * Calculate vpnProxyRisk score (0-15) for the risk scoring engine.
     */
    static calculateVpnProxyRiskScore(result: IPIntelligenceResult): number {
        if (!result.lookupSuccess) return 0;

        let risk = 0;

        if (result.torDetected) risk += 15;
        else if (result.vpnDetected) risk += 12;
        else if (result.proxyDetected) risk += 10;
        else if (result.datacenterDetected) risk += 7;

        // ProxyCheck risk score (0-100) mapped to bonus
        if (result.fraudScore >= 80) risk += 5;
        else if (result.fraudScore >= 60) risk += 3;
        else if (result.fraudScore >= 40) risk += 1;

        return Math.min(15, risk);
    }

    // ─── Private Methods ─────────────────────────────────────────────────────

    private static async callProxyCheck(ip: string): Promise<IPIntelligenceResult> {
        const apiKey = process.env.PROXYCHECK_API_KEY;

        // ProxyCheck works without an API key (100 queries/day)
        // With free key: 1,000 queries/day
        try {
            const params = new URLSearchParams({
                vpn: "1",
                asn: "1",
                risk: "1",
                port: "1",
                seen: "1",
                days: "7",
                tag: "fundedwealth",
            });

            const url = apiKey
                ? `${this.API_BASE}/${encodeURIComponent(ip)}?key=${encodeURIComponent(apiKey)}&${params}`
                : `${this.API_BASE}/${encodeURIComponent(ip)}?${params}`;

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                method: "GET",
                signal: controller.signal,
                headers: { Accept: "application/json" },
            });

            clearTimeout(timeout);

            if (!response.ok) {
                logger.error({ status: response.status, ip }, "ProxyCheck API non-200");
                return this.createUnavailableResult(ip, `api_http_${response.status}`);
            }

            const data = await response.json() as ProxyCheckResponse;

            if (data.status === "error" || data.status === "denied") {
                logger.error({ ip, message: data.message }, "ProxyCheck API error");
                return this.createUnavailableResult(ip, `api_error: ${data.message}`);
            }

            // ProxyCheck returns data keyed by IP
            const ipData = data[ip];
            if (!ipData) {
                return this.createUnavailableResult(ip, "no_data_for_ip");
            }

            const isProxy = ipData.proxy === "yes";
            const proxyType = (ipData.type || "").toLowerCase();

            const vpnDetected = isProxy && (proxyType === "vpn" || proxyType.includes("vpn"));
            const torDetected = isProxy && (proxyType === "tor" || proxyType.includes("tor"));
            const datacenterDetected = isProxy && (
                proxyType === "hosting" ||
                proxyType === "datacenter" ||
                proxyType.includes("server") ||
                proxyType.includes("hosting")
            );
            // Generic proxy: SOCKS, HTTP, etc.
            const proxyDetected = isProxy && !vpnDetected && !torDetected && !datacenterDetected;

            return {
                ip,
                vpnDetected,
                proxyDetected,
                torDetected,
                datacenterDetected,
                fraudScore: ipData.risk ?? 0,
                country: ipData.isocode || ipData.country || "",
                region: ipData.region || "",
                city: ipData.city || "",
                isp: ipData.provider || "",
                asn: parseInt(ipData.asn?.replace("AS", "") || "0") || 0,
                organization: ipData.operator?.name || ipData.provider || "",
                connectionType: ipData.type || "",
                abuseVelocity: ipData.risk >= 80 ? "high" : ipData.risk >= 50 ? "medium" : "low",
                recentAbuse: (ipData.risk ?? 0) >= 66,
                isCrawler: false,
                mobile: false,
                lookupSuccess: true,
                lookupSource: "api",
                rawResponse: data,
            };
        } catch (err: any) {
            if (err.name === "AbortError") {
                logger.error({ ip }, "ProxyCheck API timeout");
                return this.createUnavailableResult(ip, "api_timeout");
            }
            logger.error({ err, ip }, "ProxyCheck API failed");
            return this.createUnavailableResult(ip, `api_exception: ${err.message}`);
        }
    }

    private static getFromMemoryCache(ip: string): IPIntelligenceResult | null {
        const entry = MEMORY_CACHE.get(ip);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            MEMORY_CACHE.delete(ip);
            return null;
        }
        return entry.result;
    }

    private static setMemoryCache(ip: string, result: IPIntelligenceResult): void {
        if (MEMORY_CACHE.size >= MAX_MEMORY_CACHE_SIZE) {
            const firstKey = MEMORY_CACHE.keys().next().value;
            if (firstKey) MEMORY_CACHE.delete(firstKey);
        }
        MEMORY_CACHE.set(ip, { result, expiresAt: Date.now() + MEMORY_CACHE_TTL_MS });
    }

    private static async getFromDbCache(ip: string): Promise<IPIntelligenceResult | null> {
        try {
            const cutoff = new Date(Date.now() - DB_CACHE_TTL_MS);
            const record = await db.query.ipHistory.findFirst({
                where: and(eq(ipHistory.ip, ip), gte(ipHistory.lastSeen, cutoff)),
            });
            if (!record) return null;

            return {
                ip,
                vpnDetected: record.vpnDetected,
                proxyDetected: record.proxyDetected,
                torDetected: record.torDetected,
                datacenterDetected: record.datacenterDetected,
                fraudScore: 0,
                country: record.country || "",
                region: "",
                city: "",
                isp: record.isp || "",
                asn: 0,
                organization: record.organization || "",
                connectionType: "",
                abuseVelocity: "",
                recentAbuse: false,
                isCrawler: false,
                mobile: false,
                lookupSuccess: true,
                lookupSource: "cache_db",
            };
        } catch (err) {
            logger.error({ err, ip }, "Error checking DB cache");
            return null;
        }
    }

    private static async storeIpHistory(
        ip: string,
        userId: string,
        result: IPIntelligenceResult
    ): Promise<void> {
        const existing = await db.query.ipHistory.findFirst({
            where: and(eq(ipHistory.ip, ip), eq(ipHistory.userId, userId)),
        });

        if (existing) {
            await db
                .update(ipHistory)
                .set({
                    vpnDetected: result.vpnDetected,
                    proxyDetected: result.proxyDetected,
                    torDetected: result.torDetected,
                    datacenterDetected: result.datacenterDetected,
                    country: result.country || existing.country,
                    isp: result.isp || existing.isp,
                    organization: result.organization || existing.organization,
                    lastSeen: new Date(),
                })
                .where(eq(ipHistory.id, existing.id));
        } else {
            await db.insert(ipHistory).values({
                userId,
                ip,
                vpnDetected: result.vpnDetected,
                proxyDetected: result.proxyDetected,
                torDetected: result.torDetected,
                datacenterDetected: result.datacenterDetected,
                country: result.country || null,
                isp: result.isp || null,
                organization: result.organization || null,
            });
        }
    }

    private static createUnavailableResult(ip: string, error: string): IPIntelligenceResult {
        return {
            ip,
            vpnDetected: false,
            proxyDetected: false,
            torDetected: false,
            datacenterDetected: false,
            fraudScore: 0,
            country: "",
            region: "",
            city: "",
            isp: "",
            asn: 0,
            organization: "",
            connectionType: "",
            abuseVelocity: "",
            recentAbuse: false,
            isCrawler: false,
            mobile: false,
            lookupSuccess: false,
            lookupSource: "unavailable",
            error,
        };
    }

    private static isPrivateIp(ip: string): boolean {
        if (!ip || ip === "unknown") return true;
        return (
            ip.startsWith("10.") ||
            ip.startsWith("172.16.") || ip.startsWith("172.17.") ||
            ip.startsWith("172.18.") || ip.startsWith("172.19.") ||
            ip.startsWith("172.2") || ip.startsWith("172.30.") || ip.startsWith("172.31.") ||
            ip.startsWith("192.168.") ||
            ip.startsWith("127.") ||
            ip === "::1" || ip === "0.0.0.0"
        );
    }

    static clearMemoryCache(): void {
        MEMORY_CACHE.clear();
    }

    static getCacheStats() {
        return {
            memoryCacheSize: MEMORY_CACHE.size,
            maxSize: MAX_MEMORY_CACHE_SIZE,
            ttlMinutes: MEMORY_CACHE_TTL_MS / 60000,
        };
    }
}

export default IPIntelligenceService;
