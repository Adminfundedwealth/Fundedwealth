import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft,
  Instagram,
  Twitter,
  Youtube,
  Building2,
  Globe,
  MapPin,
  Mail,
  FileText,
  Lock,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  Cookie,
  UserCheck,
  Scale,
  Users,
} from "lucide-react";

export default function AcceptableUse() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <SEOHead
        title="Prohibited Activities & Acceptable Use Policy — FundedWealth"
        description="Read FundedWealth's Prohibited Activities & Acceptable Use Policy. Understand what conduct is permitted and prohibited on our platform."
        canonical="/acceptable-use"
      />

      {/* ─── Top Navigation Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold text-gray-900">FundedWealth</span>
          </Link>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto px-4 py-14 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-2">
          Prohibited Activities &amp; Acceptable Use Policy
        </h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: August 26, 2026</p>

        <div className="space-y-10 text-gray-600 leading-relaxed text-[15px]">

          {/* Intro */}
          <p>
            This Policy explains activities that are not permitted on the FundedWealth platform. The purpose is to protect platform security, evaluation integrity, fair treatment of participants, and the reliability of the simulated trading environment.
          </p>
          <p>
            This Policy should be read together with the FundedWealth{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>,{" "}
            <Link href="/rules" className="text-indigo-600 hover:underline">Trading Rules</Link>,{" "}
            <Link href="/risk-disclosure" className="text-indigo-600 hover:underline">Risk Disclosure</Link>,{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, and{" "}
            <Link href="/refund" className="text-indigo-600 hover:underline">Refund Policy</Link>.
          </p>

          {/* ─── 1. Platform Integrity ──────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Platform Integrity</h2>
            <p>
              FundedWealth is a simulated trading and evaluation platform. Users must use the platform in good faith and must not attempt to obtain an unfair evaluation advantage through technical exploitation, identity abuse, coordinated activity, unauthorized automation, or other prohibited conduct.
            </p>
          </section>

          {/* ─── 2. Prohibited Activities ───────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Prohibited Activities</h2>
            <p>
              The following activities are prohibited where they are intended to circumvent the program rules, manipulate evaluation results, interfere with platform systems, or obtain an unfair advantage.
            </p>

            {/* 2.1 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.1 Market-Data or Technology Exploitation</h3>
            <p className="mb-2">Examples may include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Deliberately exploiting stale or incorrect displayed data</li>
              <li>Exploiting known latency or synchronization problems</li>
              <li>Manipulating race conditions</li>
              <li>Exploiting software defects or platform vulnerabilities</li>
              <li>Attempting to obtain an advantage from incorrect account or pricing states</li>
              <li>Intentionally generating abnormal requests to interfere with platform services</li>
            </ul>
            <p className="mt-3">Users must report material platform vulnerabilities rather than attempting to exploit them.</p>

            {/* 2.2 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.2 Account Sharing and Coordinated Account Abuse</h3>
            <p className="mb-2">Users must not:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Allow another person to operate their account</li>
              <li>Trade on behalf of another participant</li>
              <li>Share account credentials</li>
              <li>Coordinate multiple accounts to circumvent risk limits</li>
              <li>Mirror positions between accounts for the purpose of bypassing evaluation controls</li>
              <li>Use related accounts to manufacture artificial evaluation outcomes</li>
            </ul>

            {/* 2.3 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.3 Identity and KYC Abuse</h3>
            <p className="mb-2">The following are prohibited:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Providing false identity information</li>
              <li>Using another person's identity</li>
              <li>Creating accounts under multiple identities</li>
              <li>Submitting altered or fraudulent KYC documents</li>
              <li>Using payment information that does not belong to the authorized user where ownership verification is required</li>
              <li>Attempting to bypass identity or account-verification controls</li>
            </ul>

            {/* 2.4 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.4 Unauthorized Automation</h3>
            <p className="mb-2">Users must comply with the automation requirements applicable to their program. Unless expressly permitted, users must not use:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Unauthorized trading bots</li>
              <li>Automated order-entry systems</li>
              <li>Scripts designed to bypass platform controls</li>
              <li>Unauthorized Expert Advisors or automated execution tools</li>
              <li>Software designed to exploit execution or data-processing behaviour</li>
            </ul>
            <p className="mt-3">Where a program permits automation subject to restrictions, the user remains responsible for ensuring that the automation complies with the applicable Trading Rules.</p>

            {/* 2.5 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.5 Copy Trading and Signal-Based Abuse</h3>
            <p className="mb-2">Users must not use external services or coordinated activity to artificially reproduce another participant's trading activity for the purpose of passing an evaluation or circumventing program restrictions. This may include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Unauthorized copy-trading systems</li>
              <li>Synchronized trading between participants</li>
              <li>Coordinated signal execution intended to manipulate evaluation outcomes</li>
              <li>Account mirroring used to bypass risk controls</li>
            </ul>
            <p className="mt-3">Normal independent trading based on publicly available market information is not prohibited merely because another trader may make a similar decision.</p>

            {/* 2.6 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.6 Rule-Circumvention</h3>
            <p className="mb-2">Users must not intentionally structure trades or account activity to evade the intent of FundedWealth's Trading Rules. Examples may include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Repeatedly opening and closing positions solely to manipulate an evaluation metric</li>
              <li>Exploiting rule calculations rather than demonstrating genuine trading behaviour</li>
              <li>Deliberately using multiple accounts to offset or neutralize evaluation outcomes</li>
              <li>Attempts to bypass daily-loss or drawdown controls</li>
              <li>Using account resets or retries to circumvent restrictions</li>
            </ul>

            {/* 2.7 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.7 Manipulative or Disruptive Behaviour</h3>
            <p className="mb-2">Users must not engage in activity designed to misrepresent genuine trading performance or interfere with platform operations. Examples may include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Artificial order-generation patterns</li>
              <li>Spoofing-like or layering-like behaviour where prohibited by the applicable program</li>
              <li>Wash-style activity</li>
              <li>Abuse of simulated execution mechanics</li>
              <li>Deliberate generation of abnormal system load</li>
            </ul>

            {/* 2.8 */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.8 Payment and Refund Abuse</h3>
            <p className="mb-2">Users must not:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Submit fraudulent payment information</li>
              <li>Intentionally create duplicate transactions and misrepresent them as accidental</li>
              <li>Abuse refunds or retries</li>
              <li>Repeatedly initiate payment disputes for completed services without a legitimate basis</li>
              <li>Provide false information during a refund investigation</li>
            </ul>
            <p className="mt-3">Legitimate payment disputes remain subject to applicable payment provider and legal processes.</p>
          </section>

          {/* ─── 3. Acceptable Use ──────────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Acceptable Use</h2>
            <p className="mb-2">Users may use FundedWealth for legitimate activities consistent with the selected program, including:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Independent trading within the applicable Trading Rules</li>
              <li>Reasonable use of the platform's tools and features</li>
              <li>Use of permitted automation where expressly allowed</li>
              <li>Use of permitted research, analysis, and market-information tools</li>
              <li>Contacting support to report technical problems or security concerns</li>
            </ul>
            <p className="mt-3">Users must not interfere with another user's access or the operation of the platform.</p>
          </section>

          {/* ─── 4. Security and Surveillance ───────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Security and Surveillance</h2>
            <p className="mb-2">FundedWealth may monitor platform activity for security, fraud prevention, account integrity, and evaluation fairness. Monitoring may involve information such as:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Trading activity</li>
              <li>Order activity</li>
              <li>Account relationships</li>
              <li>Login activity</li>
              <li>IP information</li>
              <li>Device information</li>
              <li>Payment activity</li>
              <li>Account access patterns</li>
              <li>Other relevant security signals</li>
            </ul>
            <p className="mt-3">FundedWealth may use automated systems and human review to identify potentially suspicious or prohibited activity. Automated detection does not necessarily constitute a final determination. Activity may be reviewed by authorized personnel.</p>
            <p className="mt-3">The handling of personal information is governed by the <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.</p>
          </section>

          {/* ─── 5. Investigation and Verification ──────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Investigation and Verification</h2>
            <p className="mb-2">Where potentially prohibited activity is identified, FundedWealth may request additional information or conduct a review. A review may include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Account history</li>
              <li>Trading/order records</li>
              <li>Device or IP relationships</li>
              <li>Payment records</li>
              <li>KYC information</li>
              <li>Support communications</li>
              <li>Relevant technical logs</li>
              <li>Applicable risk events</li>
            </ul>
            <p className="mt-3">Users are expected to cooperate honestly with reasonable verification requests.</p>
          </section>

          {/* ─── 6. Consequences of Prohibited Activity ─────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Consequences of Prohibited Activity</h2>
            <p className="mb-2">Depending on the nature and seriousness of the activity, FundedWealth may take one or more of the following actions, subject to the Terms, Trading Rules, applicable program conditions, and applicable law:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-500">
              <li>Request additional information or verification</li>
              <li>Temporarily restrict certain account functionality</li>
              <li>Place a payout or payment under review</li>
              <li>Suspend access while an investigation is conducted</li>
              <li>Fail or terminate the affected evaluation/account</li>
              <li>Remove eligibility for applicable performance-based rewards</li>
              <li>Restrict or terminate related accounts where justified by the evidence</li>
              <li>Decline future participation</li>
              <li>Take other lawful actions necessary to protect the platform</li>
            </ol>
            <p className="mt-3">Where appropriate, FundedWealth will communicate the applicable reason for an adverse account decision.</p>
          </section>

          {/* ─── 7. Technical Failure vs Prohibited Activity ─────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Technical Failure vs Prohibited Activity</h2>
            <p className="mb-2">A technical problem and a rule violation are not the same thing.</p>

            <p className="font-semibold text-gray-800 mt-4 mb-2">Examples of a potential technical issue:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Verified platform-side provisioning failure</li>
              <li>Confirmed system malfunction</li>
              <li>Confirmed data synchronization problem</li>
              <li>Payment successfully completed but the purchased service was not properly provisioned</li>
            </ul>

            <p className="font-semibold text-gray-800 mt-4 mb-2">Examples of prohibited activity:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Deliberately exploiting a platform error</li>
              <li>Manipulating account state</li>
              <li>Circumventing risk controls</li>
              <li>Using unauthorized automation</li>
              <li>Sharing or misrepresenting account identity</li>
            </ul>

            <p className="mt-3">Technical issues are handled under the applicable support and <Link href="/refund" className="text-indigo-600 hover:underline">Refund Policy</Link> processes.</p>
          </section>

          {/* ─── 8. Reporting Security or Platform Vulnerabilities ────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Reporting Security or Platform Vulnerabilities</h2>
            <p>Users who discover a genuine security or technical vulnerability should report it to FundedWealth rather than exploit it.</p>
            <p className="mt-3">Reports may be sent to: <span className="text-gray-900 font-medium">support@fundedwealth.com</span></p>
            <p className="mt-3">Users should provide enough information for FundedWealth to investigate the issue.</p>
          </section>

          {/* ─── 9. Third-Party Tools and Services ──────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Third-Party Tools and Services</h2>
            <p>Users remain responsible for ensuring that third-party tools, automation services, signal providers, or integrations used with FundedWealth comply with the applicable program rules.</p>
            <p className="mt-3">The use of a third-party tool does not transfer responsibility for prohibited activity away from the account holder.</p>
          </section>

          {/* ─── 10. Policy Interpretation ──────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Policy Interpretation</h2>
            <p>FundedWealth may evaluate conduct based on the substance and purpose of the activity rather than relying only on the technical form of a trade or action.</p>
            <p className="mt-3">The examples in this Policy are illustrative and are not an exhaustive list of every prohibited activity.</p>
            <p className="mt-3">A particular activity may be restricted where it materially undermines:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500 mt-2">
              <li>Platform security</li>
              <li>Evaluation fairness</li>
              <li>Account integrity</li>
              <li>Payment integrity</li>
              <li>The intended operation of the FundedWealth programs</li>
            </ul>
          </section>

          {/* ─── 11. Contact ────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>For questions about this Policy:</p>
            <p className="mt-2 text-gray-900 font-medium">support@fundedwealth.com</p>
            <p className="mt-2">Website: <a href="https://fundedwealth.com" className="text-indigo-600 hover:underline">fundedwealth.com</a></p>
          </section>

        </div>
      </main>

      {/* ─── Footer (dark, matching home page) ──────────────────────────── */}
      <footer className="bg-[#0a0015] pt-20 pb-10 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-10">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="FundedWealth" className="h-12 w-12 rounded-lg grayscale hover:grayscale-0 transition-all duration-500" />
                <span className="text-2xl font-heading font-bold text-white tracking-tight">Funded<span className="text-fw-orange">Wealth</span></span>
              </Link>
              <p className="text-white/50 max-w-sm mb-4 text-lg font-medium">
                India's #1 Fastest Growing Prop Trading Firm Dedicated to Indian Traders
              </p>
              <div className="space-y-2 mb-6 text-sm text-white/40">
                <p className="flex items-center gap-2"><Building2 size={14} className="text-white/30 shrink-0" /> FundedWealth</p>
                <p className="flex items-center gap-2"><Globe size={14} className="text-white/30 shrink-0" /> Simulated Trading &amp; Evaluation Platform</p>
                <p className="flex items-center gap-2"><MapPin size={14} className="text-white/30 shrink-0" /> Mumbai, Maharashtra, India</p>
                <p className="flex items-center gap-2"><Mail size={14} className="text-white/30 shrink-0" /> support@fundedwealth.com</p>
              </div>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/fundedwealthind" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-fw-pink hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="https://x.com/fundedwealth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-fw-orange hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="https://www.youtube.com/@FundedWealth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-fw-purple hover:text-white transition-colors">
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/#plans" className="text-white/50 hover:text-fw-orange transition-colors">Plans &amp; Pricing</a></li>
                <li><Link href="/scaling" className="text-white/50 hover:text-fw-orange transition-colors">Scaling Plan</Link></li>
                <li><Link href="/leaderboard" className="text-white/50 hover:text-fw-orange transition-colors">Leaderboard</Link></li>
                <li><Link href="/payouts" className="text-white/50 hover:text-fw-orange transition-colors">Payout Proofs</Link></li>
                <li><Link href="/rules" className="text-white/50 hover:text-fw-orange transition-colors">Trading Rules</Link></li>
                <li><Link href="/championship" className="text-white/50 hover:text-fw-orange transition-colors">FW Championship</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/blog" className="text-white/50 hover:text-fw-orange transition-colors">Trading Blog</Link></li>
                <li><Link href="/success-stories" className="text-white/50 hover:text-fw-orange transition-colors">Success Stories</Link></li>
                <li><Link href="/community" className="text-white/50 hover:text-fw-orange transition-colors">Community</Link></li>
                <li><a href="/#affiliate" className="text-white/50 hover:text-fw-orange transition-colors">Affiliate Program</a></li>
                <li><Link href="/impact" className="text-white/50 hover:text-fw-orange transition-colors">FW Impact Initiative</Link></li>
                <li><a href="/#contact" className="text-white/50 hover:text-fw-orange transition-colors">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><FileText size={14} className="text-white/30" /> Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Lock size={14} className="text-white/30" /> Privacy Policy</Link></li>
                <li><Link href="/refund" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Banknote size={14} className="text-white/30" /> Refund Policy</Link></li>
                <li><Link href="/rules" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><ShieldCheck size={14} className="text-white/30" /> Trading Rules</Link></li>
                <li><Link href="/aml-kyc" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><UserCheck size={14} className="text-white/30" /> AML &amp; KYC Policy</Link></li>
                <li><Link href="/risk-disclosure" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><AlertTriangle size={14} className="text-white/30" /> Risk Disclosure</Link></li>
                <li><Link href="/acceptable-use" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Scale size={14} className="text-white/30" /> Acceptable Use Policy</Link></li>
                <li><Link href="/cookie-policy" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Cookie size={14} className="text-white/30" /> Cookie Policy</Link></li>
                <li><Link href="/affiliate-terms" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Users size={14} className="text-white/30" /> Affiliate Terms</Link></li>
                <li><Link href="/faq" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Globe size={14} className="text-white/30" /> FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-4 mb-6">
            <p className="text-white/40 text-xs leading-relaxed">
              <span className="text-white/60 font-semibold">Disclaimer:</span> All information on this website is for educational purposes only and is not intended to provide financial advice. All trading on our platform is simulated for evaluation purposes. Account balances shown are simulated balances and do not represent customer-owned funds. FundedWealth is a structured simulated trading evaluation platform that assesses trader performance under defined risk parameters.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="border border-white/10 rounded-xl bg-white/3 px-6 py-4">
              <p className="text-xs text-white/60 leading-relaxed">
                <span className="text-fw-orange font-bold">Risk Disclaimer:</span> Trading involves risk and may not be suitable for all individuals. FundedWealth offers skill-based evaluations using simulated trading accounts only. Past performance does not guarantee future results. Funding and payouts are subject to program rules and compliance.
              </p>
            </div>
            <div className="border border-white/10 rounded-xl bg-white/3 px-6 py-4">
              <p className="text-xs text-white/60 leading-relaxed">
                <span className="text-fw-orange font-bold">Important Notice:</span> FundedWealth is not a SEBI-registered entity and does not provide regulated financial services, investment advice, or brokerage services. FundedWealth provides simulated trading and evaluation services. Trading activity is conducted in a simulated environment and does not represent live securities transactions unless expressly stated otherwise. All activities on the platform are for educational and skill assessment purposes.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              &copy; 2025 FundedWealth. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 md:gap-6 text-xs text-white/30">
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link href="/refund" className="hover:text-white/60 transition-colors">Refund Policy</Link>
              <Link href="/rules" className="hover:text-white/60 transition-colors">Trading Rules</Link>
              <Link href="/risk-disclosure" className="hover:text-white/60 transition-colors">Risk Disclosure</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
