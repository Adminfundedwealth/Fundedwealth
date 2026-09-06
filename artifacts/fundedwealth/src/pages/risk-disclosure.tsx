import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";
import LegalCTA from "@/components/LegalCTA";

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Risk Disclosure — FundedWealth"
        description="Read FundedWealth's Risk Disclosure. Understand the principal risks associated with using the FundedWealth simulated trading evaluation platform."
        canonical="/risk-disclosure"
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
        <h1 className="text-4xl font-heading font-extrabold mb-2">Risk Disclosure</h1>

        <p className="text-white/70 leading-relaxed mb-8">
          READ CAREFULLY BEFORE USING FUNDEDWEALTH. This Risk Disclosure explains the principal risks associated with using the FundedWealth platform, purchasing an evaluation program, operating a simulated trading account, and becoming eligible for performance-based rewards.
        </p>
        <p className="text-white/70 leading-relaxed mb-10">
          By creating an account, purchasing an evaluation, accessing a trading account, or otherwise using FundedWealth, you acknowledge that you have read and understood this Risk Disclosure.
        </p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Nature of the FundedWealth Service</h2>
            <p>FundedWealth provides a simulated trading and proprietary evaluation service designed to assess trading skill, discipline, consistency, and risk management.</p>
            <p className="mt-3">The trading environment provided by FundedWealth is simulated. Displayed account balances, equity, profit and loss, drawdown and other account metrics are simulated values used for evaluation purposes.</p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>The simulated balance is not money deposited by you, does not represent an investment held for you, and is not a customer-owned brokerage account.</li>
              <li>FundedWealth does not provide investment advice, portfolio management, or brokerage services.</li>
              <li>Evaluation activity does not represent customer-owned live securities or derivatives trading.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Evaluation Fee Risk</h2>
            <p>Purchasing an evaluation requires payment of a Challenge or evaluation fee. Payment of this fee does not guarantee:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Successful completion of the evaluation</li>
              <li>Access to a subsequent program</li>
              <li>A funded-program allocation</li>
              <li>Eligibility for performance-based rewards</li>
              <li>Any particular financial outcome</li>
            </ul>
            <p className="mt-3">Refund eligibility is governed exclusively by the applicable FundedWealth <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link>.</p>
            <p className="mt-3">Users should purchase an evaluation only after considering whether the fee and the associated evaluation conditions are appropriate for them.</p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Evaluation Performance Risk</h2>
            <p>Passing an evaluation depends on compliance with the applicable program rules and performance requirements. An account may fail or become ineligible because of:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Daily loss limits</li>
              <li>Maximum drawdown limits</li>
              <li>Failure to meet applicable targets</li>
              <li>Inactivity</li>
              <li>Prohibited trading activity</li>
              <li>Position or exposure restrictions</li>
              <li>Consistency requirements</li>
              <li>Other rules applicable to the selected program</li>
            </ul>
            <p className="mt-3">An unsuccessful evaluation does not mean that FundedWealth has caused a financial loss in the user's personal brokerage or investment account. The principal financial exposure to the user from an evaluation is the amount paid for the applicable service, subject to the Refund Policy and applicable law.</p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Simulated Market Conditions</h2>
            <p>FundedWealth may use market and reference data to operate its simulated trading environment. Simulated execution may differ from execution in a live brokerage environment because of differences in:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Liquidity</li>
              <li>Latency</li>
              <li>Available prices</li>
              <li>Spreads</li>
              <li>Order matching</li>
              <li>Slippage</li>
              <li>Market-data timing</li>
              <li>System processing</li>
              <li>Other market or technology conditions</li>
            </ul>
            <p className="mt-3">Accordingly, performance achieved in the FundedWealth environment should not be treated as proof of future live-market performance.</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Drawdown and Account-Rule Risk</h2>
            <p>Market movements represented within the simulated environment can cause rapid changes in simulated account equity and drawdown. Sudden volatility, gaps, news events, circuit limits, changes in liquidity, and other market conditions may cause an account to reach an applicable risk limit quickly.</p>
            <p className="mt-3">A drawdown or rule breach may result in:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Account restriction</li>
              <li>Account suspension</li>
              <li>Account failure</li>
              <li>Termination of the evaluation</li>
              <li>Loss of eligibility for applicable program benefits</li>
            </ul>
            <p className="mt-3">These consequences relate to the simulated evaluation account and do not constitute a loss of the user's personal investment capital.</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Technology and Connectivity Risk</h2>
            <p>Use of an online trading platform involves technology risks. The FundedWealth platform may experience:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Temporary outages</li>
              <li>Maintenance</li>
              <li>Latency</li>
              <li>Software defects</li>
              <li>Connectivity problems</li>
              <li>Market-data interruptions</li>
              <li>Delayed updates</li>
              <li>Third-party service failures</li>
              <li>Cyber incidents</li>
              <li>Other technical issues</li>
            </ul>
            <p className="mt-3">Such events may temporarily affect account access, displayed prices, charts, order status, account metrics, simulated P&L, risk calculations, or other platform functionality.</p>
            <p className="mt-3">FundedWealth may investigate and correct confirmed platform-side technical issues in accordance with its policies. A temporary interruption does not automatically create a refund entitlement. Refunds arising from confirmed service or provisioning failures are governed by the <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link>.</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Data and Information Risk</h2>
            <p>Market data and other information displayed through the platform may be delayed, incomplete, unavailable, or affected by third-party data providers or technical interruptions.</p>
            <p className="mt-3">Users should not assume that every displayed value will always correspond exactly to a live external market quote. Users are responsible for reviewing the information available to them before taking actions within the simulated environment.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Account Security and Identity Risk</h2>
            <p>Users are responsible for protecting their account credentials and following FundedWealth security requirements. Security risks may include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Phishing</li>
              <li>Credential theft</li>
              <li>Malware</li>
              <li>Unauthorized access</li>
              <li>SIM-swap attacks</li>
              <li>Compromised email accounts</li>
              <li>Account sharing</li>
              <li>Misuse of devices or credentials</li>
            </ul>
            <p className="mt-3">FundedWealth may use account, device, IP, and activity information to detect suspicious activity, fraud, account sharing, multiple-account abuse, and other security risks. Additional verification or temporary restrictions may be applied when necessary to protect the platform and its users.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Fraud, Abuse and Rule-Circumvention Risk</h2>
            <p>FundedWealth may review activity that appears inconsistent with the program rules or platform requirements. Examples may include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Account sharing</li>
              <li>Multiple-account abuse</li>
              <li>Prohibited automation</li>
              <li>Exploitation of technical vulnerabilities</li>
              <li>Fraudulent information</li>
              <li>Payment abuse</li>
              <li>Referral abuse</li>
              <li>Challenge farming</li>
              <li>Attempts to circumvent risk controls</li>
            </ul>
            <p className="mt-3">Such activity may result in investigation, restriction, suspension, termination, or loss of eligibility under the <Link href="/terms" className="text-fw-orange hover:underline">Terms of Service</Link> and <Link href="/rules" className="text-fw-orange hover:underline">Trading Rules</Link>.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Performance Reward Risk</h2>
            <p>Performance-based rewards are subject to the applicable program terms, account status, compliance requirements, and payout procedures. Eligibility for a reward does not arise solely because an account shows a simulated profit.</p>
            <p className="mt-3">FundedWealth may review:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Trading activity</li>
              <li>Account compliance</li>
              <li>KYC status</li>
              <li>Payout information</li>
              <li>Rule adherence</li>
              <li>Security or fraud indicators</li>
            </ul>
            <p className="mt-3">before approving a performance-based reward. No particular reward amount, frequency, or future income is guaranteed unless expressly stated in the applicable program terms.</p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Payout and Payment-Processing Risk</h2>
            <p>Payments and payouts may depend on third-party payment processors, banks, UPI infrastructure, card networks, cryptocurrency networks, and other service providers. Processing delays may occur because of:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Provider review</li>
              <li>Banking delays</li>
              <li>Network congestion</li>
              <li>Payment verification</li>
              <li>Technical failures</li>
              <li>Fraud screening</li>
              <li>Other circumstances outside FundedWealth's direct control</li>
            </ul>
            <p className="mt-3">FundedWealth will process eligible refunds and payouts in accordance with its applicable policies and procedures.</p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Refund and Cancellation Risk</h2>
            <p>Refund eligibility is not automatic. Users should review the FundedWealth <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link> before purchasing an evaluation.</p>
            <p className="mt-3">Refund availability may depend on:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>The applicable refund window</li>
              <li>Whether the service has been materially consumed</li>
              <li>Trading activity</li>
              <li>Account status</li>
              <li>Payment records</li>
              <li>Technical or provisioning failures</li>
              <li>Other conditions specified in the Refund Policy</li>
            </ul>
            <p className="mt-3">A trading loss, failed evaluation, or unsuccessful trading strategy is not by itself a technical failure or automatic basis for a refund.</p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Regulatory and Legal Environment</h2>
            <p>The legal and regulatory environment applicable to online trading evaluation platforms, simulated trading services, digital payments, identity verification, data protection, and related activities may change over time.</p>
            <p className="mt-3">Changes in applicable law, regulation, government guidance, payment requirements, or other legal requirements may require FundedWealth to modify, restrict, suspend, or discontinue certain services. Where required, FundedWealth may update its policies, procedures, eligibility requirements, or platform functionality to address such changes.</p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Taxation Risk</h2>
            <p>Users are responsible for understanding and complying with their own tax obligations arising from payments or performance-based rewards they receive.</p>
            <p className="mt-3">FundedWealth may make deductions or provide information where required by applicable law. Tax treatment can depend on a user's individual circumstances. Users should obtain independent professional tax advice where appropriate.</p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Personal Data and KYC Risk</h2>
            <p>FundedWealth may require identity and KYC information for account verification, fraud prevention, security, and payout processing. Users must provide accurate and truthful information.</p>
            <p className="mt-3">Incorrect, incomplete, fraudulent, or inconsistent information may result in additional verification, restrictions, or loss of eligibility where permitted under applicable policies. Personal data is handled in accordance with the FundedWealth <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link> and applicable law.</p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Third-Party Service Risk</h2>
            <p>FundedWealth may depend on third-party services, including payment processors, cloud infrastructure, analytics providers, security and fraud-prevention providers, communication services, and other technology providers.</p>
            <p className="mt-3">A failure, outage, policy change, or service interruption by a third-party provider may affect FundedWealth functionality.</p>
          </section>

          {/* 17 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Behavioural and Financial Discipline Risk</h2>
            <p>Repeatedly purchasing evaluation programs can result in cumulative Challenge Fee expenditure. Users should not purchase evaluations with money they cannot reasonably afford to spend.</p>
            <p className="mt-3">FundedWealth is designed to assess trading skill and discipline. It should not be treated as a guaranteed source of income. Users should make purchasing decisions based on their own financial circumstances and risk tolerance.</p>
          </section>

          {/* 18 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">18. Important Acknowledgement</h2>
            <p>By using FundedWealth, the user acknowledges that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>FundedWealth provides simulated trading and evaluation services</li>
              <li>Simulated balances are not customer-owned funds</li>
              <li>Evaluation performance does not guarantee live-market profits</li>
              <li>Passing an evaluation does not guarantee future rewards</li>
              <li>Trading-rule breaches may result in account failure or restriction</li>
              <li>Technical and third-party service interruptions may occur</li>
              <li>Refund eligibility is governed by the <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link></li>
              <li>Performance-based rewards are subject to applicable program rules, verification, and compliance requirements</li>
              <li>The user has had the opportunity to review the FundedWealth <Link href="/terms" className="text-fw-orange hover:underline">Terms of Service</Link>, <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>, <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link>, and <Link href="/rules" className="text-fw-orange hover:underline">Trading Rules</Link></li>
            </ul>
            <p className="mt-3">Users are encouraged to obtain independent legal, financial, or tax advice where they consider it appropriate.</p>
          </section>

          {/* 19 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">19. Contact</h2>
            <p>For questions regarding this Risk Disclosure:</p>
            <p className="mt-2 text-white/60">support@fundedwealth.com</p>
            <p className="mt-3">For privacy and personal-data matters:</p>
            <p className="mt-2 text-white/60">privacy@fundedwealth.com</p>
            <p className="mt-3">Website: <a href="https://fundedwealth.com" className="text-fw-orange hover:underline">fundedwealth.com</a></p>
          </section>

        </div>
      </div>

      <LegalCTA />
    </div>
  );
}
