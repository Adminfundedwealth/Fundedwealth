import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Refund Policy — FundedWealth"
        description="FundedWealth's Refund Policy. Understand our refund terms for simulated trading challenges and evaluation programs."
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
        <p className="text-white/40 text-sm mb-10">Last updated: August 25, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          {/* 1. Overview */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
            <p>
              This Refund Policy sets out the conditions under which FundedWealth may issue refunds for purchases made on the FundedWealth platform. We are committed to fair, transparent, and consistent refund practices. Please read this policy carefully before making a purchase.
            </p>
            <p className="mt-3">
              This policy is separate from, and in addition to, any rights you may have under applicable Indian consumer protection law. Nothing in this policy is intended to limit your statutory rights.
            </p>
          </section>

          {/* 2. Nature of the FundedWealth Service */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Nature of the FundedWealth Service</h2>
            <p>
              FundedWealth is a <strong className="text-white/90">simulated trading and proprietary evaluation platform</strong>. It is important that you understand the following before making a purchase:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>
                All trading accounts provided by FundedWealth — including evaluation accounts and funded accounts — operate within a <strong className="text-white/80">simulated trading environment</strong>. They are not live brokerage accounts.
              </li>
              <li>
                The account balance displayed on your FundedWealth dashboard reflects <strong className="text-white/80">simulated capital</strong> allocated for evaluation purposes. It is not a customer deposit, a bank balance, an investment account, or money deposited by you for real-market trading.
              </li>
              <li>
                The fee you pay when purchasing a FundedWealth challenge or evaluation is a <strong className="text-white/80">service fee</strong> for access to the applicable simulated trading evaluation program — not a deposit of funds into a trading account.
              </li>
              <li>
                FundedWealth is <strong className="text-white/80">not a stockbroker, investment adviser, portfolio manager, financial intermediary, or exchange</strong>. FundedWealth does not execute live securities transactions on your behalf.
              </li>
              <li>
                Profit share payouts made to qualified traders upon completing evaluation requirements are paid from FundedWealth's own revenue pool, not from customer deposits or pooled investment accounts.
              </li>
            </ul>
            <p className="mt-3">
              Understanding this is important because it defines what the service fee covers, and therefore what refund rights apply.
            </p>
          </section>

          {/* 3. Eligibility for Pre-Trading Refund */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Eligibility for Pre-Trading Refund</h2>
            <p>
              You may be eligible for a refund if your request meets <strong className="text-white/90">all</strong> of the following conditions:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>Your refund request is submitted within the applicable refund window (see Section 4).</li>
              <li>No trade has been placed on the applicable challenge or evaluation account.</li>
              <li>The account has not been materially used — including but not limited to accessing the account via a trading platform, placing orders, or otherwise consuming the service.</li>
              <li>The purchase was not made under a free retry, complimentary reset, or equivalent benefit.</li>
              <li>Your account is not suspended or under review for a policy violation.</li>
            </ul>
            <p className="mt-3">
              All conditions above must be met simultaneously. Meeting one condition alone does not automatically create a refund entitlement.
            </p>
          </section>

          {/* 4. 48-Hour Pre-Trading Refund Window */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. 48-Hour Pre-Trading Refund Window</h2>
            <p>
              FundedWealth offers a <strong className="text-fw-orange">48-hour pre-trading refund window</strong>. If you have purchased a challenge or evaluation account and have not yet placed any trades, you may submit a refund request within <strong className="text-white/90">48 hours of the time of purchase</strong>.
            </p>
            <p className="mt-3">To qualify under this window:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>The refund request must be received by FundedWealth within 48 hours of the successful payment timestamp.</li>
              <li>No trade must have been placed or executed on the challenge account.</li>
              <li>The account must not have been accessed via a trading platform or otherwise materially consumed.</li>
            </ul>
            <p className="mt-3">
              Once the 48-hour window has elapsed, the pre-trading refund is no longer available regardless of whether any trades have been placed.
            </p>
          </section>

          {/* 5. When a Refund Is Not Available */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. When a Refund Is Not Available</h2>
            <p>
              Refunds will <strong className="text-white/90">not</strong> be issued in the following circumstances:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>One or more trades have been placed on the challenge or evaluation account.</li>
              <li>The 48-hour pre-trading refund window has elapsed.</li>
              <li>The evaluation service has been materially consumed — including account login via trading platform, order placement, or use of funded account features.</li>
              <li>The account has been breached due to a trading rule violation (e.g., daily loss limit exceeded, overall drawdown breach, prohibited strategy used). A trading rule breach is not a FundedWealth technical failure.</li>
              <li>The evaluation was failed due to trading performance, including drawdown, profit-target miss, or violation of challenge rules.</li>
              <li>The purchase was made using a free retry, complimentary reset, or similar benefit.</li>
              <li>The customer has violated FundedWealth's Terms of Service.</li>
              <li>The request is submitted after the refund window has closed.</li>
            </ul>
            <p className="mt-3">
              For clarity: a customer failing an evaluation due to their own trading decisions — including exceeding drawdown limits, violating risk rules, or missing profit targets — does not constitute a FundedWealth technical failure and does not entitle the customer to a refund under this policy.
            </p>
          </section>

          {/* 6. Technical Failure / Service Not Provisioned */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Technical Failure / Service Not Provisioned</h2>
            <p>
              If FundedWealth receives a confirmed successful payment but fails to provision the purchased service due to a <strong className="text-white/90">confirmed FundedWealth-side technical failure</strong>, FundedWealth will:
            </p>
            <ol className="list-decimal list-inside mt-3 space-y-2 text-white/60">
              <li>First attempt to provision or restore the service within a reasonable time.</li>
              <li>If the service cannot reasonably be provisioned after verification, consider an appropriate remedy — which may include a refund of the confirmed charge — after review.</li>
            </ol>
            <p className="mt-3">Examples that may qualify under this section (subject to verification):</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Confirmed provisioning failure where payment was received but account credentials were never issued.</li>
              <li>A duplicate successful charge caused by a confirmed system or payment gateway error (see also Section 7).</li>
              <li>A confirmed technical error that permanently prevented delivery of the purchased service.</li>
            </ul>
            <p className="mt-3">
              Temporary platform outages, maintenance windows, or delays that are subsequently resolved do not automatically constitute a provisioning failure. FundedWealth will investigate each case individually. Contact <span className="text-fw-orange">support@fundedwealth.com</span> with your Order ID for assistance.
            </p>
          </section>

          {/* 7. Duplicate Payment */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Duplicate Payment</h2>
            <p>
              If the same purchase results in more than one successful charge — caused by a payment gateway error, network timeout, or system failure — the duplicate charge may be refunded after verification.
            </p>
            <p className="mt-3">To report a duplicate charge, contact <span className="text-fw-orange">support@fundedwealth.com</span> with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Your registered email address</li>
              <li>Order ID(s) for both charges</li>
              <li>Payment transaction reference(s)</li>
              <li>Date and amount of each charge</li>
            </ul>
            <p className="mt-3">
              FundedWealth will verify the transaction records before processing any duplicate-charge refund. Approved duplicate refunds will generally be returned to the original payment method, subject to payment provider capabilities.
            </p>
            <p className="mt-3">
              Note: Purchasing the same plan type more than once intentionally (e.g., running two separate evaluations of the same size) is not a duplicate charge and is not covered by this section.
            </p>
          </section>

          {/* 8. Failed / Interrupted Payment */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Failed / Interrupted Payment</h2>
            <p>
              In some cases a payment may appear to have been debited from your bank or UPI account but may not have been received or confirmed by FundedWealth's payment gateway. Situations that may fall under this section include:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Payment marked as failed at checkout but amount debited from your account</li>
              <li>Payment showing as pending for an extended period with no order created</li>
              <li>Gateway timeout during payment completion</li>
              <li>UPI payment completed at your bank but order not created on FundedWealth</li>
              <li>Card or net banking transaction completed but account not provisioned</li>
            </ul>
            <p className="mt-3">
              In such cases, please contact <span className="text-fw-orange">support@fundedwealth.com</span> and provide the following:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-white/60">
              <li>Registered email address</li>
              <li>Order ID (if one was generated)</li>
              <li>Payment transaction reference or UTR number</li>
              <li>Date and amount of the transaction</li>
              <li>Screenshot or bank statement excerpt showing the debit (if requested)</li>
            </ol>
            <p className="mt-3">
              FundedWealth will verify the transaction with the payment gateway before issuing a refund or provisioning the service. Most failed-payment investigations are resolved within 2–3 business days of receiving complete information.
            </p>
          </section>

          {/* 9. Incorrect or Accidental Purchase */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Incorrect or Accidental Purchase</h2>
            <p>
              If you believe you made a purchase in error — for example, selecting the wrong account size or plan type — please contact FundedWealth support as quickly as possible.
            </p>
            <p className="mt-3">
              If the support request is received promptly and the applicable challenge account has not been materially consumed (i.e., no trades placed), the request will be reviewed under the pre-trading refund conditions described in Sections 3 and 4.
            </p>
            <p className="mt-3">
              Accidental or incorrect purchases where the service has already been accessed or consumed are not automatically refundable. FundedWealth does not guarantee a refund for every accidental purchase, and each case will be assessed individually.
            </p>
          </section>

          {/* 10. Promotional / Discounted Purchases */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Promotional / Discounted Purchases</h2>
            <p>
              Challenges or evaluations purchased at a discounted price — including purchases using a coupon code, seasonal promotion, affiliate discount, or any other offer — are subject to the same refund conditions as full-price purchases.
            </p>
            <p className="mt-3">
              If a refund is approved for a discounted purchase, the refund amount will be the <strong className="text-white/90">actual amount paid</strong> after the applicable discount — not the original undiscounted list price.
            </p>
          </section>

          {/* 11. Free Retry / Reset Treatment */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Free Retry / Reset Treatment</h2>
            <p>
              FundedWealth offers free retries and account resets on select plans. It is important to understand the distinction:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-white/60">
              <li>
                A <strong className="text-white/80">refund</strong> is a return of the fee paid to your original payment method.
              </li>
              <li>
                A <strong className="text-white/80">free retry</strong> is a complimentary re-attempt at the evaluation, at no additional charge, without a cash return.
              </li>
              <li>
                A <strong className="text-white/80">reset</strong> resets your evaluation account balance and progress, allowing you to restart under the same plan conditions.
              </li>
            </ul>
            <p className="mt-3">
              A free retry or reset is a service benefit and is <strong className="text-white/90">not</strong> a cash refund. Accepting a free retry or reset is not equivalent to receiving a refund. Purchases made using a free retry or reset benefit are not eligible for a separate cash refund.
            </p>
            <p className="mt-3">
              To activate a free retry or reset where your plan includes this benefit, contact <span className="text-fw-orange">support@fundedwealth.com</span>.
            </p>
          </section>

          {/* 12. Challenge Fee Refund on Successful Completion */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Challenge Fee Refund on Successful Completion</h2>
            <p>
              FundedWealth offers a <strong className="text-fw-orange">100% Challenge Fee Refund</strong> upon successful completion of the applicable evaluation phase. Once you pass your challenge and receive your first payout from a funded account, the original challenge fee paid will be included with your first profit share payout.
            </p>
            <p className="mt-3">
              This benefit applies to the evaluation fee as actually paid (after any applicable discount). It is separate from the pre-trading refund window described in Section 4 and applies regardless of whether the 48-hour window has elapsed.
            </p>
          </section>

          {/* 13. Refund Request Procedure */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Refund Request Procedure</h2>
            <p>To submit a refund request, contact FundedWealth at:</p>
            <p className="mt-2 font-semibold text-white/80">Refunds: <span className="text-fw-orange">refunds@fundedwealth.com</span></p>
            <p className="mt-3">Your request should include:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-white/60">
              <li>Your registered email address</li>
              <li>Order ID (found in your dashboard or purchase confirmation email)</li>
              <li>Payment transaction reference or ID (if available)</li>
              <li>The reason for your refund request</li>
              <li>Any supporting information relevant to your request</li>
            </ol>
            <p className="mt-3">
              Please do not share sensitive payment credentials (card numbers, UPI PINs, banking passwords, or OTPs) in your refund request. FundedWealth will never ask for these.
            </p>
          </section>

          {/* 14. Refund Review Process */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Refund Review Process</h2>
            <p>
              Once a refund request is received, FundedWealth will review it against the conditions set out in this policy. The review includes verification of:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Payment status and transaction records</li>
              <li>Account provisioning status</li>
              <li>Trading activity on the relevant account</li>
              <li>Time elapsed since purchase</li>
              <li>Applicable plan terms and any free retry/reset entitlement</li>
            </ul>
            <p className="mt-3">
              FundedWealth aims to complete the review within <strong className="text-white/90">24–48 business hours</strong> of receiving a complete request. Complex cases (e.g., payment gateway disputes, technical failure investigations) may take longer, and FundedWealth will communicate any delay.
            </p>
          </section>

          {/* 15. Refund Processing Timeline */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Refund Processing Timeline</h2>
            <p>
              For approved refunds, FundedWealth will initiate the refund to the original payment method within <strong className="text-white/90">5–7 business days</strong> of approval.
            </p>
            <p className="mt-3">
              The <strong className="text-white/90">24–48 hour review period</strong> described in Section 14 is the time taken to assess and decide on your request. The <strong className="text-white/90">5–7 business day processing period</strong> begins after approval and covers the time for the refund to be initiated on FundedWealth's side.
            </p>
            <p className="mt-3">
              Actual crediting of the refund to your bank account, card, UPI, or other payment instrument depends on the payment gateway, card issuer, bank, or UPI provider involved and may take additional time beyond the 5–7 business days. FundedWealth does not control these downstream processing timelines.
            </p>
          </section>

          {/* 16. Original Payment Method */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Original Payment Method</h2>
            <p>
              Approved refunds are processed to the <strong className="text-white/90">original payment method used at the time of purchase</strong>, wherever technically supported by the payment gateway and applicable provider.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>UPI payments are refunded to the originating UPI-linked account, subject to UPI refund limits and provider support.</li>
              <li>Debit/credit card payments are refunded to the originating card.</li>
              <li>Net banking payments are refunded to the originating bank account.</li>
            </ul>
            <p className="mt-3">
              FundedWealth does not process refunds to third-party bank accounts, alternative UPI IDs, or payment methods different from the original unless there is a confirmed technical reason preventing a refund to the original method, and subject to payment provider capabilities and applicable rules.
            </p>
          </section>

          {/* 17. Payment Gateway / Bank Processing Delays */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Payment Gateway / Bank Processing Delays</h2>
            <p>
              Once FundedWealth initiates an approved refund, processing by the payment gateway, card network, bank, or UPI provider is outside FundedWealth's direct control. Typical downstream timelines are:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>UPI: typically 1–3 business days from refund initiation</li>
              <li>Debit / Credit Card: typically 5–7 business days from refund initiation</li>
              <li>Net Banking: typically 5–7 business days from refund initiation</li>
            </ul>
            <p className="mt-3">
              These are indicative timelines provided by payment providers and are not guaranteed by FundedWealth. If a refund has not appeared after the expected window, please first check with your bank or card issuer before contacting FundedWealth support.
            </p>
          </section>

          {/* 18. Payment Disputes */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">18. Payment Disputes</h2>
            <p>
              If you experience any of the following issues, please contact FundedWealth directly before initiating a formal payment dispute with your bank or card issuer:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-white/60">
              <li>Duplicate or unexpected charges</li>
              <li>Payment completed but service not provisioned</li>
              <li>Refund not received within expected timelines</li>
              <li>Payment status shown as failed but amount debited</li>
              <li>Transaction or order discrepancies</li>
            </ul>
            <p className="mt-3">
              FundedWealth aims to resolve payment disputes quickly and directly. Contact <span className="text-fw-orange">support@fundedwealth.com</span> with your Order ID and payment reference, and our team will investigate using available transaction and account records.
            </p>
          </section>

          {/* 19. Chargebacks */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">19. Chargebacks</h2>
            <p>
              A chargeback is a payment dispute you initiate with your bank, card issuer, or payment provider. While chargebacks are a legitimate consumer protection mechanism, we encourage you to <strong className="text-white/90">contact FundedWealth support first</strong> for any payment or service issue — most disputes can be resolved faster and more efficiently through direct communication.
            </p>
            <p className="mt-3">
              Where a chargeback or payment dispute is filed, FundedWealth may provide relevant transaction and service records to the payment provider or financial institution when responding. These records may include, but are not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Order ID and payment transaction reference</li>
              <li>Payment status and confirmation records</li>
              <li>Product or service purchased</li>
              <li>Account provisioning status and timestamps</li>
              <li>Account activity records where relevant</li>
              <li>Refund request history and support communications</li>
            </ul>
            <p className="mt-3">
              FundedWealth will cooperate with legitimate payment dispute processes and will not withhold relevant records. Please be aware that filing a chargeback for a purchase where the service was validly provided and consumed may result in FundedWealth suspending the relevant account pending investigation, in line with our Terms of Service.
            </p>
          </section>

          {/* 20. Customer Transaction Records */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">20. Customer Transaction Records</h2>
            <p>
              For the purpose of refund processing, payment dispute resolution, fraud prevention, compliance, and accounting, FundedWealth retains relevant transaction and service records. These records may include payment confirmations, order details, account provisioning logs, and account activity data.
            </p>
            <p className="mt-3">
              These records are held in accordance with FundedWealth's <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link> and applicable data protection requirements. Customer personal and payment information is handled securely and is not shared beyond what is necessary for legitimate operational purposes.
            </p>
          </section>

          {/* 21. Non-Refundable Situations — Trading Performance */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">21. Trading Performance Is Not a Technical Failure</h2>
            <p>
              FundedWealth provides a simulated evaluation environment to assess trading skill. The evaluation has defined rules including profit targets, daily loss limits, overall drawdown limits, and prohibited strategy restrictions.
            </p>
            <p className="mt-3">
              A customer failing an evaluation or losing access to a funded account due to any of the following is <strong className="text-white/90">not</strong> a FundedWealth technical failure and does not entitle the customer to a refund:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Exceeding the daily loss limit</li>
              <li>Exceeding the overall or maximum drawdown limit</li>
              <li>Failing to hit the required profit target within the evaluation period</li>
              <li>Violating a trading rule (e.g., prohibited strategy, overnight holding where not permitted)</li>
              <li>Account inactivity closure under the plan's inactivity policy</li>
              <li>Any other trading decision or outcome that triggered the applicable account rules</li>
            </ul>
            <p className="mt-3">
              The distinction between a <strong className="text-white/90">trading performance outcome</strong> (not refundable as a technical failure) and a <strong className="text-white/90">genuine FundedWealth-side technical provisioning failure</strong> (covered in Section 6) is assessed individually. If you believe a genuine technical failure occurred, contact support with full details.
            </p>
          </section>

          {/* 22. Contact & Refund Support */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">22. Contact & Refund Support</h2>
            <p>For refund requests and payment-related queries, contact us at:</p>
            <div className="mt-3 space-y-2 text-white/60">
              <p>
                <span className="text-white/80 font-semibold">Refunds:</span>{" "}
                <a href="mailto:refunds@fundedwealth.com" className="text-fw-orange hover:underline">refunds@fundedwealth.com</a>
              </p>
              <p>
                <span className="text-white/80 font-semibold">Customer Support:</span>{" "}
                <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a>
              </p>
              <p>
                <span className="text-white/80 font-semibold">Contact Form:</span>{" "}
                <Link href="/#contact" className="text-fw-orange hover:underline">Available on our homepage</Link>
              </p>
              <p>
                <span className="text-white/80 font-semibold">Response Time:</span> Within 24 hours on business days
              </p>
            </div>
            <p className="mt-3">
              When contacting us for a refund, please include your <strong className="text-white/90">Order ID</strong> and <strong className="text-white/90">registered email address</strong> to help us locate your transaction quickly.
            </p>
          </section>

          {/* 23. Policy Updates */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">23. Policy Updates</h2>
            <p>
              FundedWealth reserves the right to update this Refund Policy at any time. Material changes will be communicated to registered users via email or platform notification with reasonable advance notice. The date of the most recent update is shown at the top of this page.
            </p>
            <p className="mt-3">
              Continued use of the FundedWealth platform after the effective date of any update constitutes your acceptance of the revised policy. If you do not agree with a material change, you should cease using the service before the change takes effect.
            </p>
            <p className="mt-3">
              For any questions about this policy, contact <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
