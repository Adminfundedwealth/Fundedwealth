import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Terms of Service — FundedWealth"
        description="Read FundedWealth's Terms of Service. Understand the rules, obligations, and conditions for using our prop trading platform."
        canonical="/terms"
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
        <h1 className="text-4xl font-heading font-extrabold mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: April 14, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the FundedWealth platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all the terms and conditions, you must not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years old and a resident of India to use FundedWealth. By using the Service, you represent and warrant that you meet all eligibility requirements. You must provide accurate, current, and complete information during registration and keep your account information updated.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Account Registration</h2>
            <p>To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Trading Challenges & Evaluation</h2>
            <p>FundedWealth offers proprietary trading evaluation programs ("Challenges"). By purchasing a Challenge, you agree to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Abide by all trading rules specified for your chosen plan (Flash, Instant, 1-Step, or 2-Step)</li>
              <li>Not exceed the daily loss limit or maximum drawdown thresholds</li>
              <li>Meet the minimum trading days requirement</li>
              <li>Not engage in prohibited trading practices (news trading within restricted windows, weekend holding where not permitted, etc.)</li>
              <li>Accept that violation of any trading rule may result in account termination without refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Funded Accounts</h2>
            <p>Upon successfully completing a Challenge, you may be offered a funded trading account. Funded accounts are subject to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Ongoing compliance with all trading rules</li>
              <li>Profit split ratios as specified in your plan (70-90%)</li>
              <li>Scaling eligibility based on consistent performance</li>
              <li>KYC verification before first payout</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Payouts</h2>
            <p>Payouts are processed within 12 hours of a verified payout request. You must complete KYC verification before your first payout. FundedWealth reserves the right to withhold payouts if trading rule violations are detected or if KYC verification is incomplete. Payout methods include UPI, bank transfer, and other methods as available.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Use automated trading bots or scripts unless explicitly permitted</li>
              <li>Engage in account sharing or allow others to trade on your account</li>
              <li>Manipulate or exploit platform vulnerabilities</li>
              <li>Use multiple accounts to circumvent trading rules</li>
              <li>Engage in any form of market manipulation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Intellectual Property</h2>
            <p>All content, features, and functionality on the FundedWealth platform are owned by FundedWealth and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind. FundedWealth does not guarantee uninterrupted access, error-free operation, or specific trading outcomes. Trading involves risk, and past performance does not guarantee future results.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, FundedWealth shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Modifications</h2>
            <p>FundedWealth reserves the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Contact</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p className="mt-2 text-white/60">Email: support@fundedwealth.com</p>
            <p className="text-white/60">Website: <Link href="/" className="text-fw-orange hover:underline">fundedwealth.com</Link></p>
          </section>
        </div>
      </div>
    </div>
  );
}
