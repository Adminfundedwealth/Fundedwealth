export interface SupportKnowledgeEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

export const SUPPORT_KNOWLEDGE: SupportKnowledgeEntry[] = [
  {
    id: "rules-daily-dd",
    title: "Daily Drawdown Rule",
    category: "Rules",
    content: "FundedWealth enforces a daily drawdown limit of 5% of the account balance. If your P&L falls below this threshold during a single trading day, the account is considered breached for that session.",
    keywords: ["daily", "dd", "daily dd", "daily drawdown", "loss limit", "breach", "breached"],
  },
  {
    id: "rules-max-dd",
    title: "Maximum Drawdown Rule",
    category: "Rules",
    content: "The maximum drawdown on any account is 10% of the funded capital. If your account equity drops below this line, the account is closed and you must restart from a fresh evaluation or new account.",
    keywords: ["max", "maximum", "dd", "drawdown", "max drawdown", "overall drawdown", "breach", "account closed"],
  },
  {
    id: "rules-consistency",
    title: "Consistency Rule",
    category: "Rules",
    content: "Consistency is judged by how smoothly you achieve profits across multiple trading days. Large one-day spikes are discouraged. Our assistant should explain that consistent winners avoid sudden large positions and maintain steady risk management.",
    keywords: ["consistency", "consistent", "steady", "smooth", "large spikes", "one-day", "discipline"],
  },
  {
    id: "payouts-eligibility",
    title: "Payout Eligibility",
    category: "Payouts",
    content: "Payouts become available once you complete 14 calendar days from funded account activation, record at least one profitable day, and have at least 5 trading days in the cycle. Withdrawals start at ₹2,500 and are paid via INR bank transfer or UPI.",
    keywords: ["payout", "withdrawal", "withdrawals", "first payout", "request payout", "minimum payout", "₹2,500", "bank transfer", "UPI"],
  },
  {
    id: "payouts-rejection",
    title: "Common Payout Rejection Reasons",
    category: "Payouts",
    content: "Payouts can be rejected if your account is under review, if the payout request was made before eligibility, if KYC is incomplete, or if there is a rule breach in the current cycle. The support assistant should cite these reasons and advise next steps.",
    keywords: ["rejected", "rejection", "under review", "payout rejected", "payout status", "kyc incomplete"],
  },
  {
    id: "kyc-requirements",
    title: "KYC Requirements",
    category: "KYC",
    content: "KYC must be completed with a valid government ID, selfie, and bank verification. A pending or rejected KYC can block payouts and funded account access until it is approved.",
    keywords: ["kyc", "verification", "documents", "selfie", "bank verification", "blocked", "pending"],
  },
  {
    id: "referral-program",
    title: "Referral Program",
    category: "Referral",
    content: "FundedWealth referral members earn real commission for every trader they bring in. Refer friends, track conversions, and use your referral code to earn rewards. Eligible members can withdraw referral earnings along with their payouts.",
    keywords: ["referral", "refer", "commission", "affiliate", "referral code", "earnings", "invite"],
  },
  {
    id: "account-types",
    title: "Account Types and Programs",
    category: "Accounts",
    content: "FundedWealth offers Flash Funding, Instant Funding, 1-Step and 2-Step evaluations, plus scaled funded accounts. Flash is fastest, Instant has no profit target, and 1-Step/2-Step use profit targets plus risk limits.",
    keywords: ["flash", "instant", "1-step", "2-step", "account types", "evaluation", "funded account", "programs"],
  },
  {
    id: "dashboard-guides",
    title: "Dashboard Support Features",
    category: "Dashboard",
    content: "The dashboard shows active accounts, payouts, KYC status, referral performance, and notifications. Use quick access buttons for payouts, challenge status, and support from the widget.",
    keywords: ["dashboard", "support", "notifications", "quick access", "challenge status", "account status"],
  },
  {
    id: "violations",
    title: "Rule Violations and Account Closure",
    category: "Rules",
    content: "Violations such as breach of daily DD, maximum drawdown, holding prohibited positions, or using banned strategies can close accounts. When a violation happens, the assistant should point the trader to review the breach details in the dashboard and contact support for appeal.",
    keywords: ["violation", "breach", "closed", "account closed", "prohibited", "appeal", "support"],
  },
  {
    id: "withdrawals",
    title: "Withdrawals and Notification Alerts",
    category: "Payouts",
    content: "Withdrawal requests are processed after payout eligibility is met. Notifications are sent for request receipt, approval, and payout completion. If a payout is under review, the assistant should encourage patience and offer a support ticket if needed.",
    keywords: ["withdrawal", "request", "approved", "under review", "notification", "payout complete", "approved"],
  },
  {
    id: "challenge-progress",
    title: "Challenge Progress and Status",
    category: "Challenge",
    content: "Your challenge progress depends on profit target completion, trading days, and drawdown status. The assistant should be able to explain how far you are, what rules matter next, and how to stay within the daily loss and overall drawdown limits.",
    keywords: ["challenge", "progress", "status", "profit target", "trading days", "drawdown", "daily loss"],
  },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function findRelevantSupportEntries(query: string, limit = 4) {
  const normalized = normalize(query);
  const terms = normalized.split(" ").filter(Boolean);
  const scores = SUPPORT_KNOWLEDGE.map((entry) => {
    const entryText = normalize(`${entry.title} ${entry.category} ${entry.content} ${entry.keywords.join(" ")}`);
    const score = terms.reduce((sum, term) => {
      if (entry.keywords.includes(term)) return sum + 3;
      if (entryText.includes(term)) return sum + 1;
      return sum;
    }, 0);
    return { entry, score };
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}
