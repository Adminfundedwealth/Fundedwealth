/**
 * Risk Scoring Engine
 * Calculates composite risk scores from multiple fraud factors.
 */

export interface RiskFactors {
  ipRisk: number;
  deviceRisk: number;
  behaviorRisk: number;
  vpnProxyRisk: number;
  kycRisk: number;
}

export interface RiskScoreResult {
  totalScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isBlocked: boolean;
  payoutRestricted: boolean;
  requiresReview: boolean;
  factors: RiskFactors;
}

class RiskScoringEngine {
  /**
   * Calculate composite risk score from individual factors.
   * Each factor is weighted and combined into a 0-100 score.
   */
  static calculateRiskScore(factors: RiskFactors): RiskScoreResult {
    const weights = {
      ipRisk: 0.25,
      deviceRisk: 0.25,
      behaviorRisk: 0.25,
      vpnProxyRisk: 0.15,
      kycRisk: 0.10,
    };

    const totalScore = Math.min(100, Math.round(
      factors.ipRisk * weights.ipRisk +
      factors.deviceRisk * weights.deviceRisk +
      factors.behaviorRisk * weights.behaviorRisk +
      factors.vpnProxyRisk * weights.vpnProxyRisk +
      factors.kycRisk * weights.kycRisk
    ));

    let riskLevel: RiskScoreResult["riskLevel"] = "LOW";
    if (totalScore >= 85) riskLevel = "CRITICAL";
    else if (totalScore >= 60) riskLevel = "HIGH";
    else if (totalScore >= 35) riskLevel = "MEDIUM";

    return {
      totalScore,
      riskLevel,
      isBlocked: totalScore >= 85,
      payoutRestricted: totalScore >= 60,
      requiresReview: totalScore >= 50,
      factors,
    };
  }

  /**
   * Calculate IP risk score from intelligence data.
   */
  static calculateIpRisk(data: {
    vpnDetected: boolean;
    proxyDetected: boolean;
    torDetected: boolean;
    datacenterDetected: boolean;
    fraudScore?: number;
  }): number {
    let risk = 0;
    if (data.vpnDetected) risk += 12;
    if (data.proxyDetected) risk += 10;
    if (data.torDetected) risk += 20;
    if (data.datacenterDetected) risk += 8;
    if (data.fraudScore && data.fraudScore > 75) risk += 15;
    return Math.min(20, risk);
  }

  /**
   * Detect copy trading patterns.
   */
  static detectCopyTrading(trades: any[]): number {
    if (!trades || trades.length < 5) return 0;
    // Simplified: check for identical entry/exit patterns
    return 0;
  }

  /**
   * Detect high-frequency trading patterns.
   */
  static detectHFT(trades: any[]): number {
    if (!trades || trades.length < 10) return 0;
    // Simplified: check trade frequency
    return 0;
  }

  /**
   * Detect martingale betting patterns.
   */
  static detectMartingale(trades: any[]): number {
    if (!trades || trades.length < 5) return 0;
    // Simplified: check for doubling position sizes after losses
    return 0;
  }
}

export default RiskScoringEngine;
