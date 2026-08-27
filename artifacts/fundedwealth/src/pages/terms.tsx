import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";
import LegalCTA from "@/components/LegalCTA";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Terms of Service — FundedWealth"
        description="Read FundedWealth's Terms of Service. Understand the rules, obligations, and conditions for using our simulated trading evaluation platform."
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

        <div className="space-y-8 text-white/70 leading-relaxed">

          {/* ─── 1. Acceptance of Terms ─────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and FundedWealth ("we," "us," or "our") governing your access to and use of the FundedWealth platform, website, and related services (collectively, the "Service").</p>
            <p className="mt-3">You accept these Terms by:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Creating an account on the FundedWealth platform</li>
              <li>Purchasing a Challenge or evaluation program</li>
              <li>Checking any agreement or consent checkbox presented during registration or purchase</li>
              <li>Clicking any acceptance, sign-up, or confirmation control</li>
              <li>Accessing or using any part of the Service</li>
            </ul>
            <p className="mt-3">If you do not agree to all of these Terms, you must not use the Service.</p>
            <p className="mt-3">These Terms operate together with the following policies, each of which is incorporated by reference and forms part of your agreement with FundedWealth:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link></li>
              <li><Link href="/rules" className="text-fw-orange hover:underline">Trading Rules</Link></li>
              <li><Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link></li>
              <li>Any risk disclosures or other policies expressly made available by FundedWealth and incorporated by reference into the Service</li>
            </ul>
            <p className="mt-3">In the event of a conflict between these Terms and a specific policy listed above, the more specific policy shall govern with respect to its subject matter.</p>
          </section>

          {/* ─── 2. Eligibility & User Representations ─────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility & User Representations</h2>
            <p>By using the Service, you represent and warrant that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>You are at least 18 years of age</li>
              <li>You are a resident of India or otherwise eligible to use the Service as permitted by FundedWealth</li>
              <li>You have the legal capacity to enter into a binding agreement</li>
              <li>All registration, identity, KYC, and payment information you provide is accurate, current, and complete</li>
              <li>You will promptly update your information if it changes</li>
              <li>You are acting on your own behalf and not impersonating any other person or entity</li>
              <li>Your use of the Service does not violate any applicable law or regulation</li>
            </ul>
            <p className="mt-3">FundedWealth reserves the right to request additional documentation to verify eligibility at any time. Failure to provide requested verification may result in account restriction or closure.</p>
          </section>

          {/* ─── 3. Nature of FundedWealth Service ─────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Nature of FundedWealth Service</h2>
            <p>FundedWealth is a <strong className="text-white/90">simulated trading and evaluation platform</strong> designed to assess trading skill, discipline, risk management, and consistency through structured evaluation programs.</p>
            <p className="mt-3">By using the Service, you acknowledge and agree to the following:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>All trading evaluations and challenges on the FundedWealth platform take place within a simulated trading environment. Trading activity is simulated.</li>
              <li>Account balances displayed on the platform are simulated balances. They do not represent customer-owned funds, deposits, or investments.</li>
              <li>Simulated profit and loss (P&L) figures are not customer-owned money. Users do not acquire ownership of simulated account balances.</li>
              <li>Evaluation orders do not represent customer-owned live brokerage orders and are not sent to live exchanges or order books.</li>
              <li>FundedWealth is not a stock broker, investment adviser, portfolio manager, or financial intermediary. FundedWealth does not provide investment advice, portfolio management, or brokerage services.</li>
              <li>FundedWealth does not provide regulated financial services. The Service is not an investment product.</li>
              <li>Performance within the simulated evaluation environment does not guarantee actual-market profits, investment returns, or future financial outcomes.</li>
              <li>No guaranteed profit, guaranteed income, funding arrangement, or investment return is offered by the Service.</li>
              <li>All information on the platform is for educational and skill-assessment purposes only and is not intended to constitute financial advice.</li>
            </ul>
          </section>

          {/* ─── 4. Account Registration & Account Security ────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Account Registration & Account Security</h2>
            <p>To access the Service, you must create an account. By registering, you agree to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the confidentiality of your account credentials (email, password, and any multi-factor authentication methods)</li>
              <li>Accept responsibility for all activities that occur under your account, whether or not authorized by you</li>
              <li>Not share your account credentials or grant access to any other person</li>
              <li>Notify FundedWealth support immediately at support@fundedwealth.com if you suspect any unauthorized access to or use of your account</li>
              <li>Maintain only one account per individual identity, unless a specific program or written authorization from FundedWealth permits otherwise</li>
            </ul>
            <p className="mt-3">FundedWealth is not liable for any loss or damage arising from your failure to maintain the security of your account credentials. Unauthorized access resulting from your negligence remains your responsibility.</p>
          </section>

          {/* ─── 5. Privacy, Data & KYC ────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Privacy, Data & KYC</h2>
            <p>FundedWealth collects, processes, and stores personal information in accordance with the <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link> and applicable law. The Privacy Policy explains the purposes and applicable legal basis for different types of processing.</p>
            <p className="mt-3">FundedWealth may collect and process information necessary for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Account creation and ongoing account operation</li>
              <li>Fraud prevention and security monitoring</li>
              <li>Compliance with applicable laws and regulatory requirements</li>
              <li>Identity verification and KYC procedures</li>
              <li>Payout verification and processing</li>
              <li>Customer support and dispute handling</li>
              <li>Platform improvement and analytics</li>
            </ul>
            <p className="mt-3">You must provide truthful and accurate information when completing any verification, KYC, or identity process. Submission of false, misleading, or fraudulent documents or information is a material breach of these Terms and may result in immediate account termination and forfeiture of pending payouts.</p>
          </section>

          {/* ─── 6. Trading Challenges & Evaluation ────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Trading Challenges & Evaluation</h2>
            <p>FundedWealth offers structured evaluation programs ("Challenges") designed to assess a user's trading competence. Available Challenge types include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Flash</strong> — a time-limited evaluation account</li>
              <li><strong className="text-white/80">Instant</strong> — immediate access to the applicable simulated funded program</li>
              <li><strong className="text-white/80">1-Step</strong> — a single-phase evaluation before funded status</li>
              <li><strong className="text-white/80">2-Step</strong> — a two-phase evaluation before funded status</li>
            </ul>
            <p className="mt-3">By purchasing and participating in a Challenge, you agree to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Comply with all applicable <Link href="/rules" className="text-fw-orange hover:underline">Trading Rules</Link> for your selected plan</li>
              <li>Observe daily loss limits, maximum drawdown thresholds, and any other risk parameters specified for your plan</li>
              <li>Meet minimum trading day requirements where applicable</li>
              <li>Refrain from engaging in prohibited trading practices as defined in the Trading Rules</li>
              <li>Accept that the evaluation is conducted in a simulated environment and outcomes reflect simulated performance only</li>
            </ul>
            <p className="mt-3">A breach of applicable Trading Rules may result in account restriction, suspension, or termination in accordance with the Trading Rules and the <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link>. The specific consequences of a rule breach are described in those documents.</p>
            <p className="mt-3">FundedWealth reserves the right to update Trading Rules for future Challenges. Material changes to rules applicable to active accounts will be communicated through reasonable channels before taking effect, except where immediate action is required to protect platform integrity.</p>
          </section>

          {/* ─── 7. Simulated Accounts & Account Balances ──────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Simulated Accounts & Account Balances</h2>
            <p>All accounts provided through the Service operate in a simulated environment. You acknowledge and agree that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Simulated Account:</strong> An account provided for the purpose of trading evaluation. All trades executed within it are simulated and do not interact with live financial markets.</li>
              <li><strong className="text-white/80">Simulated Balance:</strong> The account balance displayed represents virtual capital allocated for evaluation purposes. It is not a customer deposit, investment, or real monetary balance.</li>
              <li><strong className="text-white/80">Simulated Equity:</strong> The equity figure shown reflects the simulated account value including unrealized positions. It does not represent real financial assets.</li>
              <li><strong className="text-white/80">Simulated P&L:</strong> Profit and loss figures are calculated within the simulated environment. They represent evaluation metrics, not actual financial gains or losses.</li>
            </ul>
            <p className="mt-3">You do not receive ownership of, or any proprietary right to, the simulated balance or any virtual capital displayed in your account. The simulated balance exists solely for the purpose of conducting the trading evaluation and determining eligibility for performance-based rewards.</p>
          </section>

          {/* ─── 8. Performance Rewards & Payouts ──────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Performance Rewards & Payouts</h2>
            <p>Users who successfully meet the requirements of their evaluation program may become eligible for performance-based rewards ("Payouts"). The following terms apply:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Payout eligibility is governed by the applicable program rules and Trading Rules for your specific plan, including profit thresholds, consistency requirements, and minimum trading day conditions</li>
              <li>KYC verification must be completed before the first payout is processed</li>
              <li>Payout requests are reviewed for compliance with all applicable rules before approval</li>
              <li>Trading rule violations, prohibited conduct, or incomplete verification may affect payout eligibility</li>
              <li>Payout timing is subject to verification procedures, compliance review, and applicable processing timelines</li>
              <li>Profit split ratios are specified in the applicable plan documentation (typically 70–90% to the trader, depending on the plan)</li>
              <li>Payout methods include UPI, bank transfer, and other methods as made available by FundedWealth</li>
            </ul>
            <p className="mt-3">No reward is guaranteed simply because a User purchases a Challenge. Eligibility for payouts is contingent on successfully meeting all program requirements, maintaining rule compliance, and completing applicable verification.</p>
            <p className="mt-3">FundedWealth reserves the right to withhold, delay, or reverse payouts where a rule violation, fraudulent activity, or verification failure is identified, whether before or after the payout request is submitted.</p>
          </section>

          {/* ─── 9. Challenge Fees, Refunds & Cancellation ─────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Challenge Fees, Refunds & Cancellation</h2>
            <p>The payment made when purchasing a Challenge is a <strong className="text-white/90">service fee</strong> for access to the evaluation program. It is not:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>An investment or deposit</li>
              <li>Trading capital provided to the User</li>
              <li>A payment into a brokerage or investment account</li>
            </ul>
            <p className="mt-3">The Challenge fee grants access to the simulated evaluation environment and the opportunity to demonstrate trading competence under the applicable program rules.</p>
            <p className="mt-3">Refund eligibility for Challenge purchases is determined under the current <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link> and applicable law. You are encouraged to review the Refund Policy in full before making any purchase. Key provisions include a pre-trading refund window and conditions under which refunds are not available.</p>
            <p className="mt-3">FundedWealth does not make refund promises in these Terms that differ from or exceed those stated in the Refund Policy. In the event of any perceived inconsistency, the Refund Policy governs refund-related matters.</p>
          </section>

          {/* ─── 10. Prohibited Activities ─────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Prohibited Activities</h2>
            <p>You agree not to engage in any of the following activities in connection with the Service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Account sharing — allowing any other person to access or trade on your account without authorization</li>
              <li>Creating or using multiple accounts or identities to evade trading limits, circumvent rules, or gain unfair advantage</li>
              <li>Using unauthorized bots, automated scripts, or trading tools not expressly permitted by the Trading Rules</li>
              <li>Copy trading from other FundedWealth accounts or engaging in prohibited copy-trading arrangements</li>
              <li>Manipulating or exploiting platform vulnerabilities, software bugs, data-feed errors, or latency arbitrage</li>
              <li>Submitting false, misleading, or fraudulent KYC documents or identity information</li>
              <li>Engaging in fraudulent activity, including but not limited to fabricating trading records, chargebacks for services validly consumed, or referral abuse</li>
              <li>Using the Service for any unlawful purpose or in violation of applicable laws and regulations</li>
              <li>Attempting to circumvent, disable, or interfere with risk management rules, kill-switches, or position limits</li>
              <li>Abusing platform APIs, including excessive automated requests, scraping, or unauthorized data extraction</li>
              <li>Reverse engineering, decompiling, or disassembling any part of the platform software, except as expressly permitted by applicable law</li>
              <li>Engaging in conduct constituting market manipulation, including but not limited to spoofing, layering, or wash trading within the simulated environment where such conduct is used to artificially inflate performance metrics</li>
              <li>Group hedging, reverse trading across accounts, or coordinated strategies intended to guarantee outcomes across multiple accounts</li>
            </ul>
            <p className="mt-3">This list is not exhaustive. Conduct not explicitly listed above may still constitute a violation if it contravenes the spirit of fair evaluation or the applicable <Link href="/rules" className="text-fw-orange hover:underline">Trading Rules</Link>.</p>
          </section>

          {/* ─── 11. Suspension & Termination ──────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Suspension & Termination</h2>
            <p><strong className="text-white/80">FundedWealth-Initiated Actions:</strong> FundedWealth may suspend, restrict, or terminate your access to the Service, in whole or in part, at its reasonable discretion, for reasons including but not limited to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Violation of these Terms</li>
              <li>Violation of the Trading Rules</li>
              <li>Fraudulent or deceptive conduct</li>
              <li>Submission of false or misleading information</li>
              <li>Security threats or suspicious account activity</li>
              <li>Abuse of the platform, its features, or other users</li>
              <li>Unlawful conduct or conduct harmful to the integrity of the platform</li>
              <li>Failure to complete required verification when requested</li>
            </ul>
            <p className="mt-3">Where feasible and not detrimental to platform security, FundedWealth will provide notice of suspension or termination along with the reason. However, FundedWealth is not obligated to provide advance notice in cases involving fraud, security threats, or unlawful activity.</p>

            <p className="mt-4"><strong className="text-white/80">User-Initiated Account Closure:</strong> You may request closure of your account at any time by contacting FundedWealth support at support@fundedwealth.com. Upon receiving and verifying your request, we will process the closure in accordance with applicable procedures.</p>
            <p className="mt-3">Account closure does not automatically create refund eligibility. Refund conditions remain governed by the <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link>.</p>

            <p className="mt-4"><strong className="text-white/80">Effect of Termination:</strong> Upon termination or closure of your account:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Your right to access the Service ceases immediately</li>
              <li>Any pending evaluation is ended</li>
              <li>Outstanding obligations (including unresolved disputes or verified violations) survive termination</li>
              <li>Handling, retention, and deletion of your personal data following closure is governed by the <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link></li>
            </ul>
          </section>

          {/* ─── 12. Intellectual Property ─────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Intellectual Property</h2>
            <p>All content, features, functionality, software, interfaces, design elements, branding, graphics, documentation, reports, and proprietary systems available through the Service are owned by FundedWealth or its licensors and are protected by copyright, trademark, trade secret, and other intellectual property laws.</p>
            <p className="mt-3">Subject to your compliance with these Terms, FundedWealth grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for its intended purpose — participating in trading evaluations and related activities as a registered user.</p>
            <p className="mt-3">You may not:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Copy, reproduce, modify, or create derivative works of the platform or its content</li>
              <li>Distribute, publicly display, or commercially exploit any part of the Service without prior written consent</li>
              <li>Use FundedWealth trademarks, logos, or branding without express authorization</li>
              <li>Remove or alter any proprietary notices, labels, or marks on the Service</li>
            </ul>
          </section>

          {/* ─── 13. Disclaimer of Warranties & Service Availability ─────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Disclaimer of Warranties & Service Availability</h2>
            <p>The Service is provided on an <strong className="text-white/90">"as is"</strong> and <strong className="text-white/90">"as available"</strong> basis without warranties of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
            <p className="mt-3">FundedWealth does not warrant or guarantee:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Uninterrupted, continuous, or error-free operation of the Service</li>
              <li>Accuracy, completeness, or timeliness of market data, price feeds, or simulated executions</li>
              <li>That the simulated environment will replicate live market conditions in all respects</li>
              <li>Any specific trading outcome, evaluation result, or payout</li>
              <li>Availability of third-party services integrated with the platform</li>
            </ul>
            <p className="mt-3">The Service may experience interruptions due to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Scheduled or unscheduled maintenance</li>
              <li>Platform outages or server failures</li>
              <li>Data-feed issues from third-party providers</li>
              <li>Network connectivity problems</li>
              <li>Third-party service outages beyond FundedWealth's control</li>
              <li>Force majeure events (natural disasters, pandemics, government actions, civil unrest, or other events beyond reasonable control)</li>
            </ul>
            <p className="mt-3">FundedWealth will make reasonable efforts to restore service availability promptly but does not guarantee any specific uptime or recovery timeline.</p>
          </section>

          {/* ─── 14. Limitation of Liability ───────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>FundedWealth shall not be liable for any indirect, incidental, special, consequential, or punitive damages, however caused and regardless of the theory of liability</li>
              <li>FundedWealth shall not be liable for loss of profits, loss of revenue, loss of data, loss of trading opportunities (whether simulated or otherwise), or any other intangible losses arising from your use of or inability to use the Service</li>
              <li>FundedWealth's total cumulative liability to you for all claims arising out of or relating to these Terms or the Service shall not exceed the total amount of Challenge fees actually paid by you to FundedWealth in the twelve (12) months preceding the event giving rise to the claim</li>
            </ul>
            <p className="mt-3">These limitations apply regardless of whether FundedWealth has been advised of the possibility of such damages. Some jurisdictions do not allow the exclusion or limitation of certain damages; in such jurisdictions, FundedWealth's liability shall be limited to the maximum extent permitted by law.</p>
            <p className="mt-3">Nothing in these Terms shall exclude or limit liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited under applicable law.</p>
          </section>

          {/* ─── 15. Indemnification ───────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless FundedWealth, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Your violation of these Terms or any applicable policy</li>
              <li>Your unlawful conduct in connection with the Service</li>
              <li>Any fraudulent, false, or misleading information you provide</li>
              <li>Your misuse of the Service or any feature thereof</li>
              <li>Your infringement of any third-party rights, including intellectual property rights</li>
              <li>Any dispute between you and a third party arising from your use of the Service</li>
            </ul>
            <p className="mt-3">This indemnification obligation survives termination of your account and these Terms.</p>
          </section>

          {/* ─── 16. Dispute Resolution ────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Dispute Resolution</h2>
            <p><strong className="text-white/80">Step 1 — Written Notice:</strong> Before initiating any formal legal proceedings, you agree to contact FundedWealth at support@fundedwealth.com with a clear written description of your dispute or concern, including relevant details such as your account information, the nature of the issue, and the resolution you are seeking.</p>
            <p className="mt-3"><strong className="text-white/80">Step 2 — Informal Resolution:</strong> Upon receiving your notice, FundedWealth will make reasonable efforts to resolve the matter informally within thirty (30) days. Both parties agree to engage in good faith during this informal resolution period.</p>
            <p className="mt-3"><strong className="text-white/80">Step 3 — Formal Proceedings:</strong> If a dispute cannot be resolved informally within the period described above, either party may pursue formal resolution through the courts of competent jurisdiction as described in the Governing Law section below.</p>
            <p className="mt-3">Nothing in this section prevents either party from seeking urgent interim or injunctive relief from a court of competent jurisdiction where necessary to prevent irreparable harm.</p>
          </section>

          {/* ─── 17. Modifications, Severability & Survival ────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Modifications, Severability & Survival</h2>
            <p><strong className="text-white/80">Modifications:</strong> FundedWealth reserves the right to modify these Terms at any time. Material changes will be communicated through reasonable channels, which may include email notification, platform notification, or prominent notice on the website. The updated Terms will indicate a revised "Last updated" date at the top of this page. Your continued use of the Service after the effective date of any modification constitutes acceptance of the modified Terms, to the extent permitted by applicable law.</p>
            <p className="mt-3"><strong className="text-white/80">Severability:</strong> If any provision of these Terms is held invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the parties' original intent.</p>
            <p className="mt-3"><strong className="text-white/80">Survival:</strong> Provisions of these Terms that by their nature should survive termination shall survive, including but not limited to: intellectual property rights (Section 12), disclaimers (Section 13), limitation of liability (Section 14), indemnification (Section 15), dispute resolution (Section 16), and governing law (Section 18).</p>
          </section>

          {/* ─── 18. Governing Law & Contact ───────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">18. Governing Law & Contact</h2>
            <p><strong className="text-white/80">Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict-of-law principles.</p>
            <p className="mt-3"><strong className="text-white/80">Jurisdiction:</strong> Subject to the dispute resolution process described in Section 16, any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
            <p className="mt-3"><strong className="text-white/80">Contact:</strong> For questions, concerns, or notices relating to these Terms, contact us at:</p>
            <div className="mt-2 space-y-1 text-white/60">
              <p>Email: <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a></p>
              <p>Website: <Link href="/" className="text-fw-orange hover:underline">fundedwealth.com</Link></p>
            </div>
          </section>

        </div>
      </div>

      <LegalCTA />
    </div>
  );
}
