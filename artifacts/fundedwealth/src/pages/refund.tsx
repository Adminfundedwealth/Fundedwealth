import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Refund Policy — FundedWealth"
        description="FundedWealth's Refund Policy. Understand our refund terms for trading challenges and evaluation programs."
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
        <p className="text-white/40 text-sm mb-10">Last updated: April 14, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
            <p>This Refund Policy outlines the terms under which refunds may be issued for purchases made on the FundedWealth platform. We strive to provide fair and transparent refund practices for all our traders.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Challenge Fee Refund on Success</h2>
            <p>FundedWealth offers a <strong className="text-fw-orange">100% Challenge Fee Refund</strong> upon successful completion of the evaluation phase. Once you pass your challenge and receive your first payout from a funded account, the original challenge fee will be refunded to you along with your profit share.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Pre-Trading Refund Window</h2>
            <p>If you have purchased a challenge but have <strong className="text-white/90">not placed any trades</strong>, you may request a full refund within <strong className="text-white/90">48 hours</strong> of purchase. To qualify:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>No trades must have been executed on the challenge account</li>
              <li>The refund request must be submitted within 48 hours of payment</li>
              <li>The account must not have been accessed via a trading platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Non-Refundable Situations</h2>
            <p>Refunds will <strong className="text-white/90">not</strong> be issued in the following cases:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Any trade has been placed on the challenge account</li>
              <li>The 48-hour refund window has passed</li>
              <li>The account has been breached due to trading rule violations</li>
              <li>The user has violated the Terms of Service</li>
              <li>Duplicate purchases (only the duplicate charge is refundable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Free Retries & Resets</h2>
            <p>FundedWealth offers <strong className="text-fw-orange">free retries</strong> on select plans. If your plan includes a free retry benefit, you do not need to purchase a new challenge — simply contact support to activate your retry. Free retries are subject to the specific terms of your chosen plan.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-white/60">
              <li>Email us at <span className="text-fw-orange">refunds@fundedwealth.com</span> with your order ID</li>
              <li>Include your registered email address and reason for the refund</li>
              <li>Our team will review your request within 24-48 hours</li>
              <li>If approved, the refund will be processed within 5-7 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Refund Processing</h2>
            <p>Approved refunds will be processed to the original payment method used during purchase. Processing times may vary depending on your bank or payment provider:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>UPI: 1-3 business days</li>
              <li>Debit/Credit Card: 5-7 business days</li>
              <li>Net Banking: 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Promotional & Discounted Purchases</h2>
            <p>Challenges purchased at a discounted rate or through promotional offers are subject to the same refund policy. The refund amount will be the actual amount paid after the discount, not the original list price.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Chargebacks</h2>
            <p>If you initiate a chargeback with your bank or payment provider instead of contacting us, your FundedWealth account will be immediately suspended. We encourage you to reach out to our support team first to resolve any payment issues.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>For refund-related questions:</p>
            <p className="mt-2 text-white/60">Email: refunds@fundedwealth.com</p>
            <p className="text-white/60">Support: <Link href="/#contact" className="text-fw-orange hover:underline">Contact Form</Link></p>
            <p className="text-white/60">Response Time: Within 24 hours</p>
          </section>
        </div>
      </div>
    </div>
  );
}
