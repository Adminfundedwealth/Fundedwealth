import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";
import LegalCTA from "@/components/LegalCTA";

export default function AffiliateTerms() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Affiliate Terms — FundedWealth"
        description="Read FundedWealth's Affiliate Terms. Understand the rules and conditions for participating in our referral and affiliate program."
        canonical="/affiliate-terms"
      />
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold">FundedWealth</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-heading font-extrabold mb-2">Affiliate Terms</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: August 26, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
            <p>These Affiliate Terms ("Terms") govern your participation in the FundedWealth Affiliate and Referral Program ("Program"). By enrolling in or participating in the Program, you agree to be bound by these Terms in addition to the <Link href="/terms" className="text-fw-orange hover:underline">Terms of Service</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
            <p>To participate in the Program, you must:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Have a valid FundedWealth account in good standing</li>
              <li>Be at least 18 years of age</li>
              <li>Provide accurate personal and payment information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not be currently suspended or terminated from FundedWealth</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Referral Commissions</h2>
            <p>Affiliates earn commissions on qualifying purchases made by referred users. Commission rates and structures are set by FundedWealth and may be updated from time to time.</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Commissions are earned only on valid, completed purchases</li>
              <li>Self-referrals are not eligible for commissions</li>
              <li>Commissions on refunded or disputed purchases may be reversed</li>
              <li>Commission rates are subject to change with reasonable notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Payout Terms</h2>
            <p>Affiliate commissions are paid according to the following terms:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Minimum payout thresholds may apply</li>
              <li>Payouts are processed on a regular schedule as determined by FundedWealth</li>
              <li>Payment methods are determined by FundedWealth and may include bank transfer, UPI, or other methods</li>
              <li>Affiliates are responsible for any applicable taxes on commissions received</li>
              <li>FundedWealth may withhold payouts pending fraud or compliance review</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Promotional Guidelines</h2>
            <p>When promoting FundedWealth, affiliates must:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Accurately represent the nature of FundedWealth as a simulated trading evaluation platform</li>
              <li>Not make false or misleading claims about guaranteed income, profits, or funding</li>
              <li>Not use FundedWealth trademarks or branding in a misleading manner</li>
              <li>Clearly disclose their affiliate relationship where required by law</li>
              <li>Not engage in spam, unsolicited messaging, or deceptive advertising</li>
              <li>Not bid on FundedWealth branded keywords in paid search without written authorization</li>
              <li>Not create fake reviews, testimonials, or endorsements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Prohibited Activities</h2>
            <p>The following activities are strictly prohibited and may result in immediate termination from the Program:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Cookie stuffing or forced clicks</li>
              <li>Creating multiple accounts to earn referral bonuses</li>
              <li>Using bots, scripts, or automated systems to generate referrals</li>
              <li>Incentivizing sign-ups with unauthorized offers or rebates</li>
              <li>Misrepresenting the simulated nature of the trading environment</li>
              <li>Any form of referral fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Termination</h2>
            <p>FundedWealth may terminate your participation in the Program at any time for any reason, including but not limited to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Violation of these Terms or the Terms of Service</li>
              <li>Fraudulent or abusive activity</li>
              <li>Inactivity for an extended period</li>
              <li>Discontinuation of the Program</li>
            </ul>
            <p className="mt-3">Upon termination, pending commissions may be forfeited if the termination is due to a violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>FundedWealth's total liability to any affiliate under the Program shall not exceed the total commissions actually paid to that affiliate in the preceding 12 months. FundedWealth is not liable for lost referrals, tracking errors, or technical issues that may temporarily affect commission attribution.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Modifications</h2>
            <p>FundedWealth reserves the right to modify these Terms, commission structures, payout schedules, and Program features at any time. Material changes will be communicated via email or platform notification. Continued participation after notification constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>For questions regarding the Affiliate Program:</p>
            <p className="mt-2 text-white/60">support@fundedwealth.com</p>
          </section>

        </div>
      </div>

      <LegalCTA />
    </div>
  );
}
