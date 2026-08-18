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
        <p className="text-white/40 text-sm mb-10">Last updated: August 18, 2026</p>

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
            <h2 className="text-xl font-bold text-white mb-3">3. Nature of FundedWealth Service</h2>
            <p>FundedWealth is a proprietary trading evaluation and skill-assessment platform. By using this Service, you acknowledge and agree to the following:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>All trading evaluations and challenges on the FundedWealth platform run inside a simulated trading environment. Evaluation orders do not represent live retail brokerage execution and do not hit live exchange order books.</li>
              <li>FundedWealth is not a stock broker, investment advisor, portfolio manager, or financial intermediary. FundedWealth does not provide investment advice, portfolio management, or brokerage services.</li>
              <li>FundedWealth is not a SEBI-registered entity and does not provide regulated financial services.</li>
              <li>The Service is designed to evaluate and assess trading skill. Performance within the evaluation environment should not be interpreted as a guarantee of real-market profits, investment returns, or future financial outcomes.</li>
              <li>No guaranteed profit, funding arrangement, or investment return is offered by the Service. Any capital made available to qualified traders under funded account programs is subject to program rules and compliance requirements.</li>
              <li>All information on the platform is for educational and skill-assessment purposes only and is not intended to constitute financial advice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Account Registration</h2>
            <p>To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Privacy & Data</h2>
            <p>FundedWealth collects and handles personal information as described in our <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>. The processing of personal information in connection with the Service is governed by applicable privacy and data protection laws.</p>
            <p className="mt-3">Please review the Privacy Policy for details regarding the collection, use, sharing, retention, and security of your information, as well as your data rights (including access, correction, and deletion). The Privacy Policy forms part of your relationship with FundedWealth.</p>
            <p className="mt-3">Where applicable, you may be required to provide identity verification (KYC) information for account verification and payout processing. You agree to provide accurate and truthful information when completing any verification process.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Trading Challenges & Evaluation</h2>
            <p>FundedWealth offers proprietary trading evaluation programs ("Challenges"). By purchasing a Challenge, you agree to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Abide by all trading rules specified for your chosen plan (Flash, Instant, 1-Step, or 2-Step)</li>
              <li>Not exceed the daily loss limit or maximum drawdown thresholds</li>
              <li>Meet the minimum trading days requirement</li>
              <li>Not engage in prohibited trading practices (news trading within restricted windows, weekend holding where not permitted, etc.)</li>
              <li>Accept that violation of any trading rule may result in account termination without refund, as described in the Refund Policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Funded Accounts</h2>
            <p>Upon successfully completing a Challenge, you may be offered a funded trading account. Funded accounts are subject to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Ongoing compliance with all trading rules</li>
              <li>Profit split ratios as specified in your plan (70-90%)</li>
              <li>Scaling eligibility based on consistent performance</li>
              <li>KYC verification before first payout</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Payouts</h2>
            <p>Payouts are processed within 12 hours of a verified payout request. You must complete KYC verification before your first payout. FundedWealth reserves the right to withhold payouts if trading rule violations are detected or if KYC verification is incomplete. Payout methods include UPI, bank transfer, and other methods as available.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Refund & Cancellation</h2>
            <p>Refund eligibility for Challenge purchases is governed by the FundedWealth <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link>. You are encouraged to review the Refund Policy before making any purchase.</p>
            <p className="mt-3">The Refund Policy sets out the conditions under which refunds may be issued, including applicable time limits, eligibility criteria, and non-refundable situations. In the event of account termination due to trading rule violations, the refund conditions described in the Refund Policy shall apply.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Use automated trading bots or scripts unless explicitly permitted</li>
              <li>Engage in account sharing or allow others to trade on your account</li>
              <li>Manipulate or exploit platform vulnerabilities</li>
              <li>Use multiple accounts to circumvent trading rules</li>
              <li>Engage in any form of market manipulation</li>
              <li>Provide false, misleading, or fraudulent information during registration, KYC, or any other process</li>
              <li>Use the Service for any unlawful purpose or in violation of applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Account Termination & Suspension</h2>
            <p>FundedWealth may suspend or terminate your account, at its discretion, for reasons including but not limited to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Violation of these Terms or the Trading Rules</li>
              <li>Engagement in prohibited activities</li>
              <li>Providing fraudulent or misleading information</li>
              <li>Misuse of the platform or its features</li>
              <li>Security or fraud concerns</li>
              <li>Any other conduct that FundedWealth reasonably determines is harmful to the platform, other users, or the business</li>
            </ul>
            <p className="mt-3"><strong className="text-white/80">User-Initiated Account Closure:</strong> You may request closure of your account at any time by contacting FundedWealth support at support@fundedwealth.com. Upon receiving your request, we will process the closure in accordance with applicable procedures.</p>
            <p className="mt-3"><strong className="text-white/80">Effect of Termination:</strong> Upon termination or closure of your account, your right to access the Service will cease. Any outstanding obligations (including unpaid fees or unresolved disputes) shall survive termination. The handling, retention, and deletion of your personal data following account closure are governed by the <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>.</p>
            <p className="mt-3"><strong className="text-white/80">Survival:</strong> The provisions of these Terms relating to intellectual property, disclaimers, limitation of liability, governing law, and dispute resolution shall survive termination of your account or these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Intellectual Property</h2>
            <p>All content, features, and functionality on the FundedWealth platform are owned by FundedWealth and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied. FundedWealth does not guarantee uninterrupted access, error-free operation, or specific trading outcomes. Trading involves risk, and past performance does not guarantee future results. No representation is made that the simulated evaluation environment will replicate live market conditions in all respects.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, FundedWealth shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Dispute Resolution</h2>
            <p><strong className="text-white/80">Informal Resolution:</strong> Before initiating any formal legal proceedings, you agree to first contact FundedWealth at support@fundedwealth.com with a written description of your dispute or concern. FundedWealth will make reasonable efforts to resolve the matter informally within thirty (30) days of receiving your notice. You agree to engage in good faith during this informal resolution period.</p>
            <p className="mt-3"><strong className="text-white/80">Formal Proceedings:</strong> If a dispute cannot be resolved informally within the period described above, either party may pursue formal resolution through the courts as described in the Governing Law section below.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Modifications</h2>
            <p>FundedWealth reserves the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India. Subject to the dispute resolution process described in Section 15, any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">18. Contact</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p className="mt-2 text-white/60">Email: support@fundedwealth.com</p>
            <p className="text-white/60">Website: <Link href="/" className="text-fw-orange hover:underline">fundedwealth.com</Link></p>
          </section>
        </div>
      </div>
    </div>
  );
}
