import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Refund Policy — FundedWealth"
        description="FundedWealth's Refund Policy. Understand our refund terms, eligibility criteria, review process, and timelines for simulated trading challenges and evaluation programs."
        canonical="/refund"
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
        <h1 className="text-4xl font-heading font-extrabold mb-2">Refund Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: August 26, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          {/* 1. Overview */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
            <p>
              This Refund Policy ("Policy") sets out the conditions under which FundedWealth may issue refunds for challenge and evaluation purchases made on the FundedWealth platform (<a href="https://fundedwealth.com" className="text-fw-orange hover:underline">fundedwealth.com</a>). It applies to all purchases of evaluation programs, challenge plans, and associated services offered by FundedWealth.
            </p>
            <p className="mt-3">
              FundedWealth is committed to fair, transparent, and operationally complete refund practices. Nothing in this Policy is intended to limit or waive any statutory rights you may have under applicable Indian consumer protection law. We encourage all customers to read this Policy in full before making a purchase.
            </p>
          </section>

          {/* 2. Nature of the FundedWealth Service */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Nature of the FundedWealth Service</h2>
            <p>
              FundedWealth is a <strong className="text-white/90">simulated trading and proprietary evaluation platform</strong>. By understanding the nature of this service, you will better understand the refund conditions that apply:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>The fee paid when purchasing a challenge or evaluation is a <strong className="text-white/90">service fee</strong> for access to the evaluation program — it is not a deposit into a trading account, an investment, or a brokerage transaction.</li>
              <li>Account balances displayed in your dashboard represent simulated capital for evaluation purposes only. They are not customer deposits, savings, or investment holdings.</li>
              <li>FundedWealth is not a stockbroker, investment adviser, portfolio manager, or financial intermediary. FundedWealth does not execute live securities or derivatives transactions on your behalf.</li>
              <li>Evaluation activity does not represent live retail brokerage execution and does not interact with live exchange order books.</li>
              <li>Performance within the evaluation environment does not guarantee real-market profits, investment returns, or future financial outcomes.</li>
            </ul>
            <p className="mt-3">
              These facts are relevant to refund expectations: the service is consumed when the evaluation environment is accessed and used, not when a particular trading outcome is achieved.
            </p>
          </section>

          {/* 3. General Refund Principle */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. General Refund Principle</h2>
            <p>
              Refunds are available only where the applicable conditions in this Policy are satisfied. Refund eligibility is determined based on:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Whether the request falls within the applicable refund window</li>
              <li>Whether the service has been materially consumed</li>
              <li>Whether trading activity has occurred on the account</li>
              <li>The applicable plan rules and account status</li>
              <li>The payment status and transaction records</li>
              <li>Whether a confirmed technical or provisioning issue exists</li>
            </ul>
            <p className="mt-3">
              Each refund request is assessed individually against the conditions set out below. A refund request does not guarantee a refund — the decision depends on whether the applicable eligibility criteria are met after review.
            </p>
          </section>

          {/* 4. Pre-Trading Refund Eligibility */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Pre-Trading Refund Eligibility</h2>
            <p>
              FundedWealth offers a defined pre-trading refund window. This section explains the principle; the specific window and conditions are detailed in Section 5 below.
            </p>
            <p className="mt-3">
              The pre-trading refund is available only when <strong className="text-white/90">all</strong> required conditions are simultaneously satisfied at the time of the request. If any single condition is not met, the pre-trading refund is not available. The relevant timestamps and records used to verify eligibility are based on FundedWealth's payment and system records.
            </p>
          </section>

          {/* 5. 48-Hour Pre-Trading Window */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. 48-Hour Pre-Trading Window</h2>
            <p>
              FundedWealth offers a <strong className="text-fw-orange">48-hour pre-trading refund window</strong>. You may request a full refund within <strong className="text-white/90">48 hours of the successful payment timestamp</strong> provided <strong className="text-white/90">all</strong> of the following conditions are met:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>No trade has been placed, executed, or attempted on the challenge or evaluation account.</li>
              <li>The account has not been accessed via a trading platform or otherwise materially consumed (including login to the trading terminal where this constitutes activation under the applicable plan).</li>
              <li>No material consumption of the evaluation service has occurred.</li>
              <li>The purchase was not made under a free retry, complimentary reset, or similar benefit.</li>
              <li>Your account is not suspended, restricted, or under review for a policy violation at the time of the request.</li>
              <li>No applicable policy or Terms of Service violation has been identified in relation to the purchase or account.</li>
            </ul>
            <p className="mt-3">
              Once the 48-hour window has elapsed, or once the service has been materially consumed (whichever occurs first), the pre-trading refund is no longer available — regardless of subsequent trading outcomes, personal circumstances, or change of mind.
            </p>
            <p className="mt-3">
              Merely deciding not to continue with the evaluation does not override this Policy. The 48-hour window is calculated from the timestamp of the confirmed successful payment as recorded in FundedWealth's payment records.
            </p>
          </section>

          {/* 6. When Refunds Are Not Available */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. When Refunds Are Not Available</h2>
            <p>
              Refunds are generally <strong className="text-white/90">not</strong> available in the following circumstances:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>One or more trades have been placed, executed, or attempted on the challenge or evaluation account.</li>
              <li>The 48-hour pre-trading refund window has elapsed.</li>
              <li>The service has been materially consumed — including trading platform login, order placement, or activation of the evaluation environment.</li>
              <li>The account was breached or closed due to a trading rule violation (daily loss limit, maximum drawdown breach, prohibited strategy, inactivity violation, or other rule breach under the applicable plan).</li>
              <li>The evaluation was failed due to trading performance — including drawdown breach, profit-target miss, consistency-rule violation, or any other outcome resulting from the customer's own trading decisions.</li>
              <li>Prohibited activity or Terms of Service violations occurred on or in connection with the account.</li>
              <li>Fraudulent, misleading, or materially inaccurate information was provided in connection with the purchase, account, or refund request.</li>
              <li>The purchase has already been refunded or is the subject of an existing refund request.</li>
              <li>A duplicate or repetitive refund request is submitted for the same transaction after a decision has already been communicated.</li>
              <li>The purchase was made using a free retry, complimentary reset, or equivalent non-cash benefit.</li>
            </ul>
            <p className="mt-3">
              This list is not exhaustive. Each request is reviewed on its merits against the conditions of this Policy. However, FundedWealth will not reject a request solely on the basis of a reason not described in this Policy or the Terms of Service.
            </p>
          </section>

          {/* 7. Confirmed Technical Failure / Service Not Provisioned */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Confirmed Technical Failure / Service Not Provisioned</h2>
            <p>
              Where a <strong className="text-white/90">confirmed FundedWealth-side technical failure</strong> prevents the purchased service from being delivered, the following process applies:
            </p>
            <p className="mt-3 font-semibold text-white/80">What may constitute a confirmed technical failure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Successful payment confirmed but account never provisioned due to a system error</li>
              <li>Service access permanently failed due to a platform-side issue</li>
              <li>Duplicate successful charge caused by a gateway or system processing error (see also Section 8)</li>
              <li>Confirmed technical failure that prevented delivery of the purchased service</li>
            </ul>
            <p className="mt-3 font-semibold text-white/80">Resolution process:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-white/60">
              <li>FundedWealth will first attempt to restore, provision, or correct the service.</li>
              <li>FundedWealth will investigate using its account, payment, and system records.</li>
              <li>Only where the service cannot reasonably be delivered or restored after verification will a refund or other appropriate remedy be considered.</li>
            </ol>
            <p className="mt-3 font-semibold text-white/80">What does NOT automatically constitute a technical failure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Temporary platform outages or scheduled maintenance that are subsequently resolved</li>
              <li>Brief service interruptions or delays in account provisioning</li>
              <li>Market-data interruptions or temporary connectivity issues</li>
              <li>Delays caused by the customer's own network, device, or browser</li>
            </ul>
            <p className="mt-3">
              Contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a> with your Order ID and a description of the issue if you believe a technical failure applies to your case. See also Section 23 for the distinction between trading performance outcomes and technical failures.
            </p>
          </section>

          {/* 8. Duplicate Payment */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Duplicate Payment</h2>
            <p>
              If you believe you have been charged more than once for the same purchase due to a payment processing error, contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a> with the following information:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Registered email address</li>
              <li>Order IDs for all relevant transactions</li>
              <li>Payment transaction references or UTR numbers for each charge</li>
              <li>Dates and amounts of each transaction</li>
            </ul>
            <p className="mt-3">
              FundedWealth will verify the reported transactions against its payment gateway records. If a genuine duplicate charge is confirmed (i.e., the same purchase was charged more than once due to a system or gateway error), the duplicate amount will be refunded.
            </p>
            <p className="mt-3">
              <strong className="text-white/90">Important:</strong> Two or more intentional, separate purchases of the same plan — even if made close together in time — are not duplicate payments. A duplicate payment is specifically an unintended repeat charge for a single purchase transaction caused by a processing error.
            </p>
          </section>

          {/* 9. Failed or Interrupted Payment */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Failed or Interrupted Payment</h2>
            <p>
              If you experience a payment failure or interruption where money was debited from your account but the service was not provisioned, the following scenarios are covered:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Payment debited from your bank/wallet but no order created in FundedWealth</li>
              <li>Payment marked as failed by the gateway but funds debited by your bank</li>
              <li>Gateway timeout during payment processing</li>
              <li>UPI or QR payment completed but service not created or provisioned</li>
              <li>Cryptocurrency payment confirmed on-chain but service not provisioned</li>
            </ul>
            <p className="mt-3">
              To report a failed or interrupted payment, contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a> with:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Registered email address</li>
              <li>Transaction reference, UTR number, or blockchain transaction hash</li>
              <li>Date and amount of the transaction</li>
              <li>Order ID (if one was generated)</li>
              <li>Screenshot of the debit confirmation (if available)</li>
            </ul>
            <p className="mt-3">
              FundedWealth will verify the payment status with the relevant gateway or on-chain records. Based on verification, FundedWealth will either provision the purchased service or initiate a refund of the confirmed charge. If the payment did not actually complete (e.g., reversed automatically by the bank), FundedWealth will inform you of the status.
            </p>
          </section>

          {/* 10. Incorrect or Accidental Purchase */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Incorrect or Accidental Purchase</h2>
            <p>
              If you purchased the wrong plan or account size by mistake, contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a> immediately.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>If no material consumption or trading activity has occurred and the request is within the 48-hour pre-trading window, the request will be reviewed under the standard pre-trading refund conditions (Section 5).</li>
              <li>If the service has been materially consumed — including any trading activity — an accidental or incorrect purchase does not automatically create refund eligibility.</li>
              <li>In some cases, FundedWealth may offer a plan change or credit at its discretion, subject to operational feasibility and the specific circumstances.</li>
            </ul>
            <p className="mt-3">
              Prompt reporting significantly improves the likelihood of resolution. The sooner you contact support after realising the error, the more options may be available.
            </p>
          </section>

          {/* 11. Promotional / Discounted Purchases */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Promotional / Discounted Purchases</h2>
            <p>
              Purchases made using a coupon code, seasonal promotion, affiliate discount, or any other discount mechanism are subject to the same refund conditions as full-price purchases, unless the specific promotion explicitly states different refund terms.
            </p>
            <p className="mt-3">
              If a refund is approved for a discounted purchase, the amount refunded will be the <strong className="text-white/90">actual amount paid after the discount</strong> — not the original undiscounted list price. FundedWealth does not refund discount value, coupon value, or promotional credits that were not paid in cash by the customer.
            </p>
          </section>

          {/* 12. Free Retry / Reset Treatment */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Free Retry / Reset Treatment</h2>
            <p>
              FundedWealth offers free retries and account resets on select plans as a service benefit. It is important to understand the distinction:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li><strong className="text-white/90">Refund:</strong> Cash returned to the original payment method.</li>
              <li><strong className="text-white/90">Retry:</strong> A complimentary additional evaluation attempt — another chance to pass the challenge without additional payment.</li>
              <li><strong className="text-white/90">Reset:</strong> Restarts the evaluation account state (balance, drawdown, metrics) — allows the evaluation to be attempted again from a fresh starting point.</li>
            </ul>
            <p className="mt-3">
              Receiving or using a free retry or reset is <strong className="text-white/90">not</strong> a cash refund and does not constitute a refund for the purposes of this Policy. Purchases that include or have used a free retry or reset benefit are not eligible for a separate cash refund of the original purchase amount.
            </p>
            <p className="mt-3">
              To activate a free retry or reset (where your plan includes this benefit), contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a>.
            </p>
          </section>

          {/* 13. Challenge Fee Reimbursement After Successful Completion */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Challenge Fee Reimbursement After Successful Completion</h2>
            <p>
              FundedWealth offers a <strong className="text-fw-orange">100% Challenge Fee Reimbursement</strong> upon successfully passing the evaluation and receiving a funded account. This is a commercial benefit distinct from a pre-trading cancellation refund.
            </p>
            <p className="mt-3 font-semibold text-white/80">Eligibility conditions:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>You have successfully passed all phases of the evaluation challenge.</li>
              <li>You have been allocated a funded account.</li>
              <li>You have completed KYC verification as required for payouts.</li>
              <li>You have generated eligible profit and requested your first profit-share payout.</li>
            </ul>
            <p className="mt-3 font-semibold text-white/80">How it works:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>The original challenge fee (as actually paid, after any applicable discount) is included with your first profit-share payout from the funded account.</li>
              <li>This reimbursement becomes payable only at the point of the first eligible payout — not at the moment of passing the evaluation.</li>
              <li>Standard KYC, payout, and compliance requirements must be satisfied before any payout (including the fee reimbursement) is processed.</li>
            </ul>
            <p className="mt-3">
              This benefit should not be confused with the pre-trading refund (Section 5), which is a cancellation refund available before service consumption. The challenge fee reimbursement is a reward for successful completion of the program.
            </p>
          </section>

          {/* 14. Refund Request Procedure */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Refund Request Procedure</h2>
            <p>
              To submit a refund request, contact FundedWealth via email:
            </p>
            <div className="mt-3 space-y-1 text-white/60">
              <p><span className="text-white/80 font-semibold">Refunds:</span> <a href="mailto:refunds@fundedwealth.com" className="text-fw-orange hover:underline">refunds@fundedwealth.com</a></p>
              <p><span className="text-white/80 font-semibold">General Support:</span> <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a></p>
            </div>
            <p className="mt-3 font-semibold text-white/80">Your request should include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Registered email address (the email associated with your FundedWealth account)</li>
              <li>Order ID</li>
              <li>Payment transaction reference, UTR number, or blockchain transaction hash</li>
              <li>Date and amount of the transaction</li>
              <li>Clear reason for the refund request</li>
              <li>Any relevant supporting information or screenshots</li>
            </ul>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-300 font-semibold text-sm">Security Notice — Do NOT send:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-red-200/70 text-sm">
                <li>Full card numbers or CVV</li>
                <li>UPI PIN</li>
                <li>Banking passwords or internet banking credentials</li>
                <li>OTP (one-time passwords)</li>
                <li>API keys or secret tokens</li>
                <li>Login credentials (username/password)</li>
              </ul>
              <p className="mt-2 text-red-200/70 text-sm">FundedWealth will never ask you for these details. If you receive a request for such information claiming to be from FundedWealth, do not respond and report it to <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a>.</p>
            </div>
          </section>

          {/* 15. Refund Review Process */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Refund Review Process</h2>
            <p>
              Upon receiving a complete refund request, FundedWealth conducts a review to determine eligibility. The review may examine any or all of the following:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Payment status and transaction records from the relevant payment gateway</li>
              <li>Order records and purchase history</li>
              <li>Account provisioning and activation status</li>
              <li>Trading activity — including trades placed, executed, or attempted</li>
              <li>Order and execution records on the evaluation account</li>
              <li>Account usage and login history</li>
              <li>Applicable plan rules and their satisfaction</li>
              <li>Account breach, risk, or suspension events</li>
              <li>Timing of the refund request relative to purchase and activity</li>
              <li>Prior refund history associated with the customer or account</li>
              <li>Technical incident records and system logs (where a technical failure is claimed)</li>
              <li>Support communications relevant to the request</li>
              <li>Free retry, reset, or promotional benefit usage</li>
            </ul>
            <p className="mt-3">
              This review is conducted to ensure each decision is based on a complete and accurate understanding of the circumstances. FundedWealth aims to process reviews fairly and consistently.
            </p>
          </section>

          {/* 16. Refund Decision */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Refund Decision</h2>
            <p>
              Following the review, FundedWealth will communicate one of the following outcomes:
            </p>
            <div className="mt-3 space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-300 font-semibold text-sm">APPROVED</p>
                <p className="text-white/60 text-sm mt-1">The refund request meets the eligibility criteria. The refund will be initiated as described in Section 17. Note: Approval means the refund has been authorised — it does not mean the funds have already been returned to your account.</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-300 font-semibold text-sm">REJECTED</p>
                <p className="text-white/60 text-sm mt-1">The request does not meet the eligibility criteria under this Policy. FundedWealth will provide the reason for rejection where appropriate, referencing the applicable section of this Policy.</p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-300 font-semibold text-sm">MORE INFORMATION REQUIRED</p>
                <p className="text-white/60 text-sm mt-1">Additional information is needed before a decision can be made. FundedWealth will specify what is required. The review timeline resumes once the requested information is provided.</p>
              </div>
            </div>
            <p className="mt-4">
              A refund request does not obligate FundedWealth to issue a refund. The decision is based solely on whether the applicable conditions in this Policy are satisfied. All decisions are communicated to the registered email address associated with the request.
            </p>
          </section>

          {/* 17. Refund Processing Timeline */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Refund Processing Timeline</h2>
            <p>
              The refund process involves distinct stages, each with its own timeline:
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm text-white/60 border border-white/10 rounded-lg">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-3 text-white/80 font-semibold">Stage</th>
                    <th className="text-left p-3 text-white/80 font-semibold">Estimated Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="p-3">Review of complete request</td>
                    <td className="p-3">24–48 business hours after receipt</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-3">Refund initiation (after approval)</td>
                    <td className="p-3">5–7 business days after approval</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-3">Gateway/bank processing (after initiation)</td>
                    <td className="p-3">Varies by provider (see Section 19)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              These timelines are operational estimates and apply to complete requests that do not require additional information. The review period begins when all required information has been received. Weekends and public holidays are not counted as business days/hours.
            </p>
            <p className="mt-3">
              <strong className="text-white/90">Important distinction:</strong> The review timeline is the time taken by FundedWealth to assess the request. The processing timeline is the time taken to initiate the refund after approval. The gateway/bank timeline is controlled by the payment provider and is outside FundedWealth's direct control.
            </p>
          </section>

          {/* 18. Original Payment Method */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">18. Original Payment Method</h2>
            <p>
              Approved refunds are returned to the <strong className="text-white/90">original payment method</strong> used at the time of purchase, wherever technically supported by the relevant payment provider. This may include:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>UPI (refund to the originating UPI ID/bank account)</li>
              <li>Debit or credit card (refund to the card used for payment)</li>
              <li>Net banking (refund to the originating bank account)</li>
              <li>Cryptocurrency (refund to the originating wallet address, subject to provider capability)</li>
              <li>Other payment methods as supported by the applicable gateway</li>
            </ul>
            <p className="mt-3">
              FundedWealth does not process refunds to third-party accounts, alternative payment methods, or accounts that were not used for the original purchase. If the original payment method is no longer available or technically cannot receive a refund (e.g., closed bank account, expired card), FundedWealth will work with the customer and the payment provider to identify an appropriate resolution.
            </p>
          </section>

          {/* 19. Payment Gateway / Bank Processing Delays */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">19. Payment Gateway / Bank Processing Delays</h2>
            <p>
              Once FundedWealth initiates an approved refund, the downstream processing and crediting of funds to your account is controlled by the relevant payment gateway, card network, bank, or blockchain network. FundedWealth cannot guarantee or control these external timelines.
            </p>
            <p className="mt-3 font-semibold text-white/80">Indicative downstream processing times (after FundedWealth initiates the refund):</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>UPI: typically 1–3 business days</li>
              <li>Debit/credit card: typically 5–10 business days (varies by issuing bank)</li>
              <li>Net banking: typically 5–7 business days</li>
              <li>Cryptocurrency: varies by network congestion and provider processing</li>
            </ul>
            <p className="mt-3">
              These are indicative estimates only and are not guaranteed by FundedWealth. If a refund has been initiated by FundedWealth but has not appeared in your account beyond the expected timeframe, contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a> with your Order ID and refund reference, and FundedWealth will verify the status with the payment provider.
            </p>
          </section>

          {/* 20. Payment Disputes */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">20. Payment Disputes</h2>
            <p>
              If you have a concern regarding any of the following, we encourage you to contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a> first:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>An unexpected or unrecognised charge</li>
              <li>A duplicate charge</li>
              <li>Service not provisioned after payment</li>
              <li>Refund not received within the expected timeframe</li>
              <li>Payment debited but order not created</li>
              <li>Transaction amount mismatch</li>
            </ul>
            <p className="mt-3">
              FundedWealth will investigate using its available payment, order, and system records and respond with findings. Most payment issues can be resolved more quickly through direct support communication than through formal bank or card dispute processes.
            </p>
          </section>

          {/* 21. Chargebacks */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">21. Chargebacks</h2>
            <p>
              Chargebacks (also known as payment disputes filed through your bank or card issuer) are a legitimate consumer protection mechanism. FundedWealth respects your right to use this process.
            </p>
            <p className="mt-3">
              However, we strongly encourage customers to contact FundedWealth support first, as many issues that lead to chargebacks can be resolved faster through direct communication.
            </p>
            <p className="mt-3 font-semibold text-white/80">If a chargeback is filed, FundedWealth may:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Submit relevant transaction and service evidence to the payment provider/card network in response to the dispute</li>
              <li>Restrict or suspend the related FundedWealth account during the investigation period, where permitted by the applicable Terms of Service</li>
            </ul>
            <p className="mt-3 font-semibold text-white/80">Evidence that may be provided to the payment provider includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Payment and order records</li>
              <li>Service provisioning confirmation</li>
              <li>Account activation and usage records</li>
              <li>Trading activity logs</li>
              <li>Refund history (including any prior refunds issued for the same account)</li>
              <li>Support communications related to the transaction</li>
              <li>Terms of Service and Refund Policy acceptance records</li>
            </ul>
            <p className="mt-3">
              Filing a chargeback for a purchase where the service was validly provisioned, consumed, and/or completed may result in the chargeback being disputed by FundedWealth through the standard payment provider process. The outcome of any chargeback dispute is determined by the payment provider or card network, not unilaterally by FundedWealth.
            </p>
          </section>

          {/* 22. Customer Transaction & Service Records */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">22. Customer Transaction &amp; Service Records</h2>
            <p>
              FundedWealth maintains records necessary for refund processing, payment dispute resolution, fraud prevention, compliance, accounting, customer support, and service verification. These records may include:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Payment confirmations and transaction records</li>
              <li>Order records and purchase history</li>
              <li>Account provisioning and activation logs</li>
              <li>Trading activity and evaluation performance data</li>
              <li>Refund request and decision records</li>
              <li>Support and communication records</li>
              <li>Account status changes and rule-breach records</li>
            </ul>
            <p className="mt-3">
              These records support the refund review process (Section 15), dispute resolution (Section 20), and chargeback response (Section 21). For information about how your personal data is collected, used, retained, and protected, please refer to the FundedWealth <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* 23. Trading Performance Is Not a Technical Failure */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">23. Trading Performance Is Not a Technical Failure</h2>
            <p>
              For the avoidance of doubt, this section clarifies the distinction between trading performance outcomes and FundedWealth technical failures. This distinction is central to refund eligibility and dispute handling.
            </p>
            <p className="mt-3 font-semibold text-white/80">NOT a technical failure (not eligible for a technical-failure refund):</p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-white/60">
              <li>Daily loss limit breach caused by the customer's trading decisions</li>
              <li>Maximum drawdown breach caused by the customer's trading activity</li>
              <li>Failure to reach the profit target within the evaluation period</li>
              <li>Use of a prohibited trading strategy (e.g., martingale without stop-loss, latency arbitrage)</li>
              <li>Violation of trading rules (consistency rules, position-size limits, trade-window restrictions)</li>
              <li>Account inactivity resulting in evaluation expiry under plan rules</li>
              <li>Any other evaluation outcome resulting from the customer's own trading decisions, strategies, or inaction</li>
            </ul>
            <p className="mt-3 font-semibold text-white/80">IS a technical failure (may be eligible for a remedy under Section 7):</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Confirmed FundedWealth-side failure that prevented delivery or access to the purchased service</li>
              <li>Confirmed provisioning failure where payment was successful but account was never created</li>
              <li>Verified payment/service mismatch caused by a system error</li>
            </ul>
            <p className="mt-3">
              Trading is inherently uncertain, and evaluation outcomes depend on the customer's skill, decisions, and market conditions. An unfavourable trading outcome is not grounds for a refund under this Policy.
            </p>
          </section>

          {/* 24. Contact & Refund Support */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">24. Contact &amp; Refund Support</h2>
            <p>For refund-related enquiries and requests:</p>
            <div className="mt-3 space-y-2 text-white/60">
              <p><span className="text-white/80 font-semibold">Refund Requests:</span> <a href="mailto:refunds@fundedwealth.com" className="text-fw-orange hover:underline">refunds@fundedwealth.com</a></p>
              <p><span className="text-white/80 font-semibold">Customer Support:</span> <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a></p>
              <p><span className="text-white/80 font-semibold">Contact Form:</span> Available on the <Link href="/" className="text-fw-orange hover:underline">FundedWealth homepage</Link></p>
            </div>
            <p className="mt-3">
              FundedWealth aims to respond to refund and support enquiries within 24 hours on business days. Response times may vary during peak periods, weekends, and public holidays.
            </p>
          </section>

          {/* 25. Policy Updates */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">25. Policy Updates</h2>
            <p>
              FundedWealth may update this Refund Policy from time to time. Material changes will be communicated through reasonable channels, which may include email notification, platform announcement, or prominent notice on the website.
            </p>
            <p className="mt-3">
              The effective date ("Last updated") is shown at the top of this page. We encourage you to review this Policy periodically for any changes. Continued use of the FundedWealth platform after a Policy update constitutes acceptance of the revised terms. Questions about this Policy can be directed to <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
