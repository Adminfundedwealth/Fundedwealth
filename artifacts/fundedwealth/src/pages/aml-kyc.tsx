import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";

export default function AmlKyc() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="AML / KYC / CFT Policy — FundedWealth"
        description="FundedWealth's Anti-Money Laundering, Know Your Customer, and Combating the Financing of Terrorism policy. Learn about our identity verification, fraud prevention, and financial-crime controls."
        canonical="/aml-kyc"
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
        <h1 className="text-4xl font-heading font-extrabold mb-2">AML / KYC / CFT Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: August 26, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          {/* ─── 1. Policy Statement ──────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Policy Statement</h2>
            <p>
              FundedWealth maintains reasonable identity verification, fraud-prevention, Know Your Customer ("KYC"), and financial-crime controls appropriate to its services and applicable law. This Anti-Money Laundering / Know Your Customer / Combating the Financing of Terrorism policy ("Policy") outlines the measures FundedWealth employs to detect, prevent, and report potential financial crime, fraud, and abuse on the platform.
            </p>
            <p className="mt-3">This Policy is designed to protect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Users of the FundedWealth platform</li>
              <li>Payment systems and financial infrastructure used by the platform</li>
              <li>FundedWealth as an organization</li>
              <li>The integrity of the platform and its services</li>
            </ul>
            <p className="mt-3">
              This Policy should be read alongside our <Link href="/terms" className="text-fw-orange hover:underline">Terms of Service</Link>, <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>, and <Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link>.
            </p>
          </section>

          {/* ─── 2. Scope and Purpose ─────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Scope and Purpose</h2>
            <p>This Policy applies to the following activities and processes on the FundedWealth platform:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Account registration and onboarding</li>
              <li>Challenge and evaluation program purchases</li>
              <li>Payouts and profit-share disbursements</li>
              <li>KYC and identity verification processes</li>
              <li>Fraud prevention and detection</li>
              <li>Payment disputes and chargebacks</li>
              <li>Suspicious activity review and escalation</li>
            </ul>
            <p className="mt-3">
              The purpose of this Policy is to establish a framework for identifying, assessing, and managing risks associated with money laundering, terrorist financing, fraud, identity theft, and other forms of financial crime, to the extent applicable to FundedWealth's operations.
            </p>
          </section>

          {/* ─── 3. Customer Identification & KYC ─────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Customer Identification & KYC</h2>
            <p>
              FundedWealth may require users to provide identification and personal information as part of the account registration, verification, or payout process. The information requested may include, where applicable:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Full legal name</li>
              <li>Date of birth</li>
              <li>Government-issued identification (e.g., passport, voter ID, driving licence)</li>
              <li>Permanent Account Number (PAN)</li>
              <li>Aadhaar information, where legally and operationally required for identity verification</li>
              <li>Residential address and proof of address</li>
              <li>Bank account details and/or UPI ID for payout purposes</li>
              <li>Photograph or selfie for identity-matching purposes</li>
            </ul>
            <p className="mt-3">
              FundedWealth may verify the information provided using available methods appropriate to its operational and compliance requirements. Users who do not complete required verification steps may be unable to access certain platform features, including payouts.
            </p>
          </section>

          {/* ─── 4. Customer Due Diligence ────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Customer Due Diligence</h2>
            <p>FundedWealth may conduct due diligence to verify:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Identity consistency across submitted documents and account information</li>
              <li>Account ownership and that the individual operating the account is the registered user</li>
              <li>Payment ownership — that the payment instrument used belongs to the account holder</li>
              <li>Payout information accuracy — that payout details match the verified identity</li>
              <li>Suspicious activity indicators based on account behaviour, payment patterns, or risk signals</li>
              <li>Account and device relationships to detect potential multi-account abuse</li>
            </ul>
            <p className="mt-3">
              Due diligence may be conducted at the time of registration, prior to payouts, or at any point during the user's engagement with the platform where risk indicators are identified.
            </p>
          </section>

          {/* ─── 5. Enhanced Due Diligence ────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Enhanced Due Diligence</h2>
            <p>
              Where risk indicators are identified, FundedWealth may request additional information or documentation and conduct enhanced due diligence checks. Circumstances that may trigger enhanced due diligence include, but are not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Inconsistent or contradictory identity information</li>
              <li>Unusual or high-velocity payment patterns</li>
              <li>Multiple accounts linked to the same device, IP address, or payment instrument</li>
              <li>Shared devices or account credentials across multiple users</li>
              <li>Unusual payout activity or requests</li>
              <li>Suspected fraud, impersonation, or identity theft</li>
              <li>Sanctions, Politically Exposed Persons (PEP), or adverse media matches, where applicable</li>
              <li>Information received from payment providers, law enforcement, or third parties</li>
            </ul>
            <p className="mt-3">
              Enhanced due diligence may involve requests for additional documentation, extended review periods, or temporary restrictions on account functionality pending the outcome of the review.
            </p>
          </section>

          {/* ─── 6. Sanctions / PEP / Adverse Media ──────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Sanctions / PEP / Adverse Media Screening</h2>
            <p>
              FundedWealth may conduct screening against sanctions lists, Politically Exposed Persons (PEP) databases, and adverse media sources where appropriate for fraud prevention, sanctions compliance, or risk-management purposes.
            </p>
            <p className="mt-3">
              Where a potential match is identified, FundedWealth may request additional information from the user, conduct further investigation, or take appropriate action including account restriction or closure, as determined by the outcome of the review.
            </p>
            <p className="mt-3">
              The scope and frequency of screening is determined by FundedWealth based on its operational and risk-management requirements.
            </p>
          </section>

          {/* ─── 7. Payment & Transaction Monitoring ──────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Payment & Transaction Monitoring</h2>
            <p>FundedWealth may monitor and review payment activity and transaction patterns to identify potential fraud, abuse, or suspicious activity. Monitoring may include review of:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Payment velocity and frequency</li>
              <li>Repeated payment attempts, including failed transactions</li>
              <li>Multiple accounts using linked or shared payment instruments</li>
              <li>Mismatched account information and payment instrument details</li>
              <li>Unusual refund or cancellation patterns</li>
              <li>Payout irregularities or anomalies</li>
              <li>Suspicious use of UPI, cards, or other payment methods</li>
              <li>Chargebacks and payment disputes</li>
            </ul>
            <p className="mt-3">
              Where monitoring identifies suspicious or potentially fraudulent activity, FundedWealth may take action including requesting additional verification, restricting account functionality, withholding payouts, or closing accounts as set out in this Policy.
            </p>
          </section>

          {/* ─── 8. Fraud / Account Abuse / Identity Risk ─────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Fraud / Account Abuse / Identity Risk</h2>
            <p>FundedWealth maintains controls to detect and prevent fraud, account abuse, and identity-related risks. These controls may consider:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Device information and fingerprinting</li>
              <li>IP address information and geolocation data</li>
              <li>Account behaviour patterns and anomalies</li>
              <li>Relationships between accounts (shared devices, IPs, payment methods, or personal information)</li>
              <li>Payment patterns and velocity</li>
              <li>Account sharing or unauthorized access indicators</li>
              <li>Multiple-account abuse (operating more than one account per individual)</li>
              <li>Challenge farming or systematic exploitation of evaluation programs</li>
              <li>Referral program abuse</li>
            </ul>
            <p className="mt-3">
              For details on how FundedWealth collects and processes device, IP, and behavioural data, please refer to our <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* ─── 9. Source of Funds / Additional Information ───────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Source of Funds / Additional Information</h2>
            <p>
              Where appropriate and legally permitted, FundedWealth may request additional information or documentation to verify the legitimacy of payments made to the platform or the appropriateness of payout requests. This may include, but is not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Clarification regarding the source of funds used for purchases</li>
              <li>Supporting documentation for payout requests</li>
              <li>Explanation of unusual payment or account activity</li>
            </ul>
            <p className="mt-3">
              Such requests are made on a case-by-case basis where risk indicators or operational requirements warrant additional verification. FundedWealth does not impose blanket requirements for source-of-funds documentation on all users unless required by applicable law.
            </p>
          </section>

          {/* ─── 10. Suspicious Activity / Internal Escalation ────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Suspicious Activity / Internal Escalation</h2>
            <p>
              Where suspicious activity is identified through monitoring, due diligence, or other means, FundedWealth may escalate the matter to authorized internal security or compliance personnel for review and determination of appropriate action.
            </p>
            <p className="mt-3">Actions that may be taken in response to suspicious activity include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Additional verification requests</li>
              <li>Temporary or permanent account restrictions</li>
              <li>Withholding of payouts pending investigation</li>
              <li>Account closure</li>
              <li>Reporting to relevant authorities where required by applicable law</li>
            </ul>
            <p className="mt-3">
              FundedWealth will cooperate with law enforcement and regulatory authorities where legally required. The timing, manner, and scope of any such cooperation will be determined in accordance with applicable legal requirements.
            </p>
          </section>

          {/* ─── 11. Restrictions / Holds / Account Review ────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Restrictions / Holds / Account Review</h2>
            <p>FundedWealth may temporarily or permanently restrict the following where necessary:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Payouts and profit-share disbursements</li>
              <li>Payment processing for new purchases</li>
              <li>Account access</li>
              <li>Specific account functionality (e.g., evaluation access, referral features)</li>
            </ul>
            <p className="mt-3">Restrictions may be applied where necessary for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Identity verification or KYC completion</li>
              <li>Fraud investigation</li>
              <li>Payment dispute or chargeback resolution</li>
              <li>Suspicious activity review</li>
              <li>Security investigation</li>
              <li>Compliance with applicable legal or regulatory requirements</li>
            </ul>
            <p className="mt-3">
              Legitimate users whose accounts are subject to review may be asked to provide additional verification or documentation. FundedWealth endeavours to resolve reviews and restore access as promptly as reasonably possible, consistent with the need for thorough investigation.
            </p>
          </section>

          {/* ─── 12. Record Keeping ───────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Record Keeping</h2>
            <p>
              FundedWealth may retain compliance, payment, KYC, identity verification, and security records for as long as reasonably necessary for the following purposes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Service delivery and account management</li>
              <li>Fraud prevention and detection</li>
              <li>Dispute resolution and chargeback management</li>
              <li>Accounting, tax, and financial reporting obligations</li>
              <li>Legal and compliance obligations, including responding to law enforcement requests</li>
              <li>Internal audit and review purposes</li>
            </ul>
            <p className="mt-3">
              Retention periods are determined based on the nature of the records, operational necessity, and applicable legal requirements. For more information on how personal data is stored and processed, please refer to our <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* ─── 13. Data Protection ──────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. Data Protection</h2>
            <p>
              All personal data collected for AML, KYC, and CFT purposes is handled in accordance with the <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link> and applicable data-protection law. FundedWealth implements appropriate technical and organizational measures to protect personal data from unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p className="mt-3">
              For privacy-related inquiries, data access requests, or concerns about how your information is handled, please contact:
            </p>
            <p className="mt-2 text-white/60">
              Email: <a href="mailto:privacy@fundedwealth.com" className="text-fw-orange hover:underline">privacy@fundedwealth.com</a>
            </p>
          </section>

          {/* ─── 14. Staff Training / Internal Controls ───────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Staff Training & Internal Controls</h2>
            <p>
              FundedWealth may maintain internal procedures, access controls, review processes, and staff guidance appropriate to its operational and compliance needs. These measures are designed to ensure that personnel involved in compliance, payment, and security functions have appropriate knowledge of relevant risks and procedures.
            </p>
            <p className="mt-3">
              Internal controls are reviewed and updated as appropriate to reflect changes in the regulatory environment, operational scale, identified risks, and industry practices.
            </p>
          </section>

          {/* ─── 15. Third-Party Providers ────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Third-Party Providers</h2>
            <p>
              FundedWealth may engage third-party service providers to assist with functions related to this Policy, including but not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Payment processing and gateway services</li>
              <li>Identity and document verification</li>
              <li>Fraud detection and risk scoring</li>
              <li>Device fingerprinting and security services</li>
            </ul>
            <p className="mt-3">
              Third-party providers are selected based on their capability, security practices, and suitability for FundedWealth's operational needs. Personal data shared with third-party providers is governed by appropriate contractual protections and is limited to what is necessary for the relevant service.
            </p>
            <p className="mt-3">For more information, please refer to our:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link></li>
              <li><Link href="/refund" className="text-fw-orange hover:underline">Refund Policy</Link></li>
              <li><Link href="/terms" className="text-fw-orange hover:underline">Terms of Service</Link></li>
            </ul>
          </section>

          {/* ─── 16. Policy Updates ───────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Policy Updates</h2>
            <p>
              FundedWealth reserves the right to update, amend, or replace this Policy at any time. Changes will be effective upon publication on this page. Where material changes are made, FundedWealth may notify users through the platform, email, or other appropriate means.
            </p>
            <p className="mt-3">
              Continued use of the platform following publication of changes constitutes acceptance of the updated Policy. Users are encouraged to review this page periodically to stay informed of any updates.
            </p>
          </section>

          {/* ─── 17. Contact ──────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Contact</h2>
            <p>For AML, KYC, or compliance-related queries:</p>
            <p className="mt-2 text-white/60">
              Email: <a href="mailto:support@fundedwealth.com" className="text-fw-orange hover:underline">support@fundedwealth.com</a>
            </p>
            <p className="mt-4">For privacy or data-protection requests:</p>
            <p className="mt-2 text-white/60">
              Email: <a href="mailto:privacy@fundedwealth.com" className="text-fw-orange hover:underline">privacy@fundedwealth.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
