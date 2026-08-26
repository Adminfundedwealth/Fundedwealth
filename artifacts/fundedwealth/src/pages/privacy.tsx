import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";
import LegalCTA from "@/components/LegalCTA";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Privacy Policy — FundedWealth"
        description="FundedWealth's Privacy Policy. Learn how we collect, use, and protect your personal information."
        canonical="/privacy"
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
        <h1 className="text-4xl font-heading font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: August 26, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          {/* ─── 1. Data Fiduciary / Organization Information ─────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Data Fiduciary / Organization Information</h2>
            <p>This Privacy Policy is published by <strong className="text-white/80">FundedWealth</strong> ("we," "us," or "our"), which operates the website located at <Link href="/" className="text-fw-orange hover:underline">fundedwealth.com</Link> and the associated platform, applications, and services (collectively, the "Service").</p>
            <p className="mt-3">For all privacy-related inquiries, requests, or grievances, you may contact us at:</p>
            <p className="mt-2 text-white/60">Email: <a href="mailto:privacy@fundedwealth.com" className="text-fw-orange hover:underline">privacy@fundedwealth.com</a></p>
          </section>

          {/* ─── 2. Scope & Applicable Law ─────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Scope & Applicable Law</h2>
            <p>This Privacy Policy applies to all personal data processed by FundedWealth in connection with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Account registration and management</li>
              <li>Trading evaluation and challenge services</li>
              <li>Know Your Customer (KYC) verification</li>
              <li>Payment processing and payouts</li>
              <li>Customer support and communications</li>
              <li>Security, fraud prevention, and risk assessment</li>
              <li>Website analytics and performance improvement</li>
            </ul>
            <p className="mt-3">FundedWealth processes personal data in accordance with applicable Indian data protection and privacy laws, including the Digital Personal Data Protection framework as applicable. By using the Service, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy.</p>
          </section>

          {/* ─── 3. Personal Data We Collect ───────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Personal Data We Collect</h2>
            <p>We collect personal data that you voluntarily provide when using the Service. The categories of personal data we collect include:</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Account Information</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>City and state</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Identity / KYC Information</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Government-issued identification documents</li>
              <li>PAN (Permanent Account Number)</li>
              <li>Aadhaar information (used for identity verification before payouts)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Financial / Payment Information</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>UPI ID</li>
              <li>Bank account details</li>
              <li>Payment references and transaction identifiers</li>
              <li>Payout information</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Trading / Evaluation Data</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Trading activity and order history</li>
              <li>Performance metrics and statistics</li>
              <li>Account balances and evaluation progress</li>
              <li>Challenge participation records</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Communications</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Support tickets and correspondence</li>
              <li>Contact form submissions</li>
              <li>Chatbot interactions</li>
              <li>Other communications submitted to FundedWealth</li>
            </ul>
          </section>

          {/* ─── 4. Automatically Collected Information ────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Automatically Collected Information</h2>
            <p>When you access or use the Service, we automatically collect certain information, including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>IP address</li>
              <li>Approximate geographic location (derived from IP address)</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Device type and characteristics</li>
              <li>Pages visited and navigation patterns</li>
              <li>Usage and activity data (time spent, click patterns, session duration)</li>
              <li>Cookies and similar technologies</li>
              <li>Browser and device characteristics used for security purposes</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Device Fingerprinting</h3>
            <p>FundedWealth uses the open-source FingerprintJS library to generate a device identifier based on browser and device characteristics (such as screen resolution, timezone, language, hardware configuration, and other browser attributes). The identifier is generated in the user's browser and transmitted to FundedWealth's servers for security and fraud-prevention purposes. FundedWealth does not send this identifier to an external FingerprintJS service. The device identifier, along with related device characteristics, may be used to detect suspicious activity, prevent fraud, protect accounts, and identify potentially unauthorized access or multi-account abuse.</p>
          </section>

          {/* ─── 5. How We Use Personal Data ───────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. How We Use Personal Data</h2>
            <p>We use the personal data we collect for the following purposes:</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Service Delivery</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Create and maintain user accounts</li>
              <li>Provide trading evaluation and challenge services</li>
              <li>Operate platform features and account functionality</li>
              <li>Manage challenge participation and funded account programs</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Payments & Payouts</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Process challenge and service payments</li>
              <li>Manage and complete payouts to eligible users</li>
              <li>Reconcile transactions and maintain financial records</li>
              <li>Handle payment disputes and chargebacks</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">KYC & Verification</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Verify user identity before processing payouts</li>
              <li>Prevent fraudulent identity claims</li>
              <li>Maintain account integrity and compliance</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Security & Fraud Prevention</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Prevent unauthorized access to accounts</li>
              <li>Detect suspicious behaviour and fraudulent activity</li>
              <li>Prevent account sharing and multiple-account abuse</li>
              <li>Protect the integrity and security of the platform</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Customer Support</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Respond to inquiries and resolve issues</li>
              <li>Process support tickets and complaints</li>
              <li>Investigate disputes and maintain support records</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Analytics & Improvement</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Understand how users interact with the Service</li>
              <li>Improve platform performance and reliability</li>
              <li>Enhance user experience and develop new features</li>
            </ul>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Marketing & Communications</h3>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Send transactional communications (account updates, payout confirmations)</li>
              <li>Send marketing communications where permitted or with consent</li>
              <li>Provide opt-out and unsubscribe controls for marketing messages</li>
            </ul>
          </section>

          {/* ─── 6. Automated Security, Fraud & Risk Assessment ────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Automated Security, Fraud & Risk Assessment</h2>
            <p>FundedWealth uses automated security and risk-assessment systems to help detect and prevent fraudulent, abusive, or unauthorized activity on the platform. These systems are designed to identify:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Multi-account abuse (one individual operating multiple accounts)</li>
              <li>Account sharing (multiple individuals accessing a single account)</li>
              <li>Challenge farming and exploitation of evaluation rules</li>
              <li>Referral abuse and fraudulent referral activity</li>
              <li>Suspicious or unauthorized access attempts</li>
              <li>Unusual device, IP, or login patterns</li>
              <li>Potentially fraudulent transactions or payout requests</li>
            </ul>

            <p className="mt-3"><strong className="text-white/80">Inputs to automated systems may include:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>IP address and IP intelligence data (VPN, proxy, TOR, datacenter detection)</li>
              <li>Device identifier and browser/device characteristics</li>
              <li>Account activity and login patterns</li>
              <li>Transaction and payout activity</li>
              <li>Timing and frequency of actions</li>
            </ul>

            <p className="mt-3"><strong className="text-white/80">Consequences of automated detection may include:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Additional manual review by authorized security or compliance personnel</li>
              <li>Temporary restrictions on certain account functions</li>
              <li>Payment or payout holds pending review</li>
              <li>Requests for additional security verification</li>
              <li>Account suspension or termination in cases of confirmed abuse</li>
            </ul>

            <p className="mt-3">Automated decisions are not always final. Activity flagged by automated systems may be reviewed by authorized security, compliance, or support personnel where appropriate. We maintain security and risk-related records as necessary to protect the integrity of the platform.</p>
          </section>

          {/* ─── 7. KYC, Payments & Payout Processing ─────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. KYC, Payments & Payout Processing</h2>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">KYC Verification</h3>
            <p>Identity verification (KYC) may be required before FundedWealth processes a payout. Users must provide accurate and truthful information when completing any verification process. KYC documents are stored securely and used solely for the purposes of identity verification, fraud prevention, and compliance.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Payment Processing (Razorpay)</h3>
            <p>FundedWealth uses Razorpay for card, net banking, and wallet payments. When you choose to pay through Razorpay, billing information such as your name, email address, phone number, payment amount, and relevant order information is shared with Razorpay to process the transaction. Razorpay processes this information in accordance with its own privacy practices. FundedWealth does not receive or store your card number or bank login credentials through this payment integration.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Cryptocurrency Payments (OxaPay)</h3>
            <p>For cryptocurrency payments, FundedWealth uses OxaPay as a third-party payment processor. When you choose to pay with cryptocurrency, payment-related information such as the transaction amount, currency, cryptocurrency type, network, and an order identifier is shared with OxaPay to create and process the payment. OxaPay processes this information in accordance with its own privacy practices. FundedWealth does not send your name, email, KYC documents, or other personal account information to OxaPay.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Payouts</h3>
            <p>To complete payouts to eligible users, FundedWealth may process bank account details or UPI ID as provided by the user. Payout information is used solely for the purpose of transferring funds and maintaining transaction records.</p>
          </section>

          {/* ─── 8. How We Share Personal Data ─────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. How We Share Personal Data</h2>
            <p><strong className="text-white/80">FundedWealth does not sell personal information.</strong></p>
            <p className="mt-3">We may share personal data with the following categories of recipients when necessary to operate the Service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Payment Processors:</strong> To process payments and payouts (e.g., Razorpay, OxaPay)</li>
              <li><strong className="text-white/80">Cloud Infrastructure & Hosting:</strong> For hosting, database, authentication, and storage services (e.g., Supabase)</li>
              <li><strong className="text-white/80">Email & Communications Providers:</strong> To deliver transactional and service-related communications</li>
              <li><strong className="text-white/80">Analytics Providers:</strong> To understand website usage and improve the Service (e.g., Google Analytics via Google Tag Manager)</li>
              <li><strong className="text-white/80">Security & Fraud Prevention Services:</strong> To detect and prevent fraud, unauthorized access, and abuse (e.g., ProxyCheck.io for IP intelligence)</li>
              <li><strong className="text-white/80">Legal & Regulatory Authorities:</strong> Where required by law, court order, governmental authority, or to protect legal rights</li>
              <li><strong className="text-white/80">Business Transfer Counterparties:</strong> In connection with a merger, acquisition, reorganization, or sale of assets, where legally applicable</li>
            </ul>
            <p className="mt-3">We share only the minimum information necessary for each third party to perform its specific function. We do not share personal data with third parties for their independent marketing purposes.</p>
          </section>

          {/* ─── 9. Third-Party Providers & Integrations ───────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Third-Party Providers & Integrations</h2>
            <p>The Service integrates with the following third-party providers. Each provider processes information in accordance with its own privacy policy and terms of service.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Supabase</h3>
            <p>Authentication, session management, database infrastructure, and file storage. Supabase manages user sessions, stores application data, and provides secure access to uploaded documents (including KYC materials).</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Razorpay</h3>
            <p>Card, net banking, and wallet payment processing. Razorpay receives billing and order information needed to process transactions. FundedWealth does not receive or store card numbers or bank login credentials through this integration.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">OxaPay</h3>
            <p>Cryptocurrency payment processing. OxaPay receives transaction amount, currency, cryptocurrency type, network, order identifier, and callback/return URLs. FundedWealth does not send personal account information (name, email, KYC data) to OxaPay.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">ProxyCheck.io</h3>
            <p>IP intelligence service used for security and fraud prevention. Your IP address may be checked against ProxyCheck.io to identify connections from VPNs, proxies, TOR networks, or datacenter/hosting infrastructure. The result of this check is stored on FundedWealth's servers and contributes to our security and fraud-detection systems.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Google Tag Manager</h3>
            <p>Tag management platform used to manage and deploy analytics and performance tags on the website.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Google Analytics 4</h3>
            <p>Website usage and analytics, deployed via Google Tag Manager. Google Analytics may collect standard analytics information such as pages visited, device and browser details, and general engagement data. Google Analytics may use cookies or similar identifiers for analytics purposes. Google processes this information in accordance with its own privacy policy. FundedWealth does not send personal account information such as your name, email address, or payment details to Google through these services.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">FingerprintJS (Open Source)</h3>
            <p>Browser/device fingerprint generation library used entirely client-side. The open-source FingerprintJS library generates a device identifier locally in the browser. This identifier is transmitted to FundedWealth's servers for fraud-prevention and security purposes. It is not sent to any external FingerprintJS service or third-party API.</p>
          </section>

          {/* ─── 10. Cookies & Analytics ───────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Cookies & Analytics</h2>
            <p>FundedWealth uses cookies and similar technologies for the following purposes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Authentication & Sessions:</strong> To maintain your login session and authenticate requests</li>
              <li><strong className="text-white/80">Preferences:</strong> To remember user preferences and settings</li>
              <li><strong className="text-white/80">Analytics:</strong> To understand how visitors use the platform and measure website performance</li>
              <li><strong className="text-white/80">Performance:</strong> To monitor and improve platform speed and reliability</li>
              <li><strong className="text-white/80">Security:</strong> To support fraud-detection and security measures</li>
            </ul>
            <p className="mt-3">You can manage cookie preferences through your browser settings. Disabling cookies may affect certain platform functionality, including authentication and session persistence. Analytics cookies are managed through Google Tag Manager and Google Analytics 4 as described in Section 9.</p>
          </section>

          {/* ─── 11. Data Retention ────────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Data Retention</h2>
            <p>We retain personal data for as long as reasonably necessary to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Provide the Service and maintain your account</li>
              <li>Maintain account and transaction records</li>
              <li>Comply with legal, tax, and regulatory obligations</li>
              <li>Prevent fraud, abuse, and enforce platform rules</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain security and audit records</li>
            </ul>
            <p className="mt-3">When personal data is no longer required for the purposes described above, FundedWealth may delete, anonymize, or securely dispose of it, subject to applicable legal or legitimate retention requirements.</p>
            <p className="mt-3">Certain records (including transaction records, security logs, and fraud-detection data) may be retained for longer periods where necessary for legal, tax, compliance, or security purposes, even after account closure.</p>
          </section>

          {/* ─── 12. Data Security ─────────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Data Security</h2>
            <p>FundedWealth uses reasonable technical and organizational safeguards designed to protect personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Encryption of data in transit</li>
              <li>Secure storage of sensitive information</li>
              <li>Access controls and authentication requirements</li>
              <li>Security monitoring and fraud-detection systems</li>
              <li>Principle of least-privilege access where implemented</li>
            </ul>
            <p className="mt-3">However, no method of transmission over the Internet or electronic storage is guaranteed to be completely secure. While we strive to protect your personal data, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          {/* ─── 13. International / Cross-Border Processing ───────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">13. International / Cross-Border Processing</h2>
            <p>Some of our third-party service providers (including analytics, payment processing, IP intelligence, and cloud infrastructure services) may process information in locations outside India. Where personal data is processed outside India, FundedWealth takes reasonable measures and uses appropriate contractual or technical safeguards consistent with applicable law to help protect such data.</p>
            <p className="mt-3">By using the Service, you acknowledge that your information may be transferred to and processed in jurisdictions outside India where our service providers operate. These jurisdictions may have data protection laws that differ from those in India.</p>
          </section>

          {/* ─── 14. Your Privacy Rights ───────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">14. Your Privacy Rights</h2>
            <p>Under applicable Indian privacy and data protection laws, you may have the following rights with respect to your personal data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Access:</strong> Request information about the personal data we hold about you</li>
              <li><strong className="text-white/80">Correction:</strong> Request correction of inaccurate or incomplete personal data</li>
              <li><strong className="text-white/80">Deletion / Erasure:</strong> Request deletion of your personal data, subject to legal and legitimate retention requirements</li>
              <li><strong className="text-white/80">Withdrawal of Consent:</strong> Withdraw consent for processing where our processing relies on your consent</li>
              <li><strong className="text-white/80">Marketing Opt-Out:</strong> Opt out of receiving marketing communications at any time</li>
              <li><strong className="text-white/80">Grievance / Complaint:</strong> Lodge a complaint or grievance regarding our data processing practices</li>
              <li><strong className="text-white/80">Other Rights:</strong> Exercise any other rights available under applicable law</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:privacy@fundedwealth.com" className="text-fw-orange hover:underline">privacy@fundedwealth.com</a>. We will respond to your request in accordance with applicable law.</p>
            <p className="mt-3"><strong className="text-white/80">Important:</strong> Certain records may be retained where required for legal, tax, security, fraud-prevention, dispute-resolution, or other legitimate purposes, even following a deletion request. We will inform you if we are unable to fully comply with a deletion request and the reasons for such retention.</p>
          </section>

          {/* ─── 15. Children's Privacy ────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">15. Children's Privacy</h2>
            <p>The Service is not intended for individuals under 18 years of age. FundedWealth does not knowingly collect personal data from children under 18. If we become aware that we have collected personal information from a child, we will take steps to delete such information promptly. If you believe that a child has provided personal data to us, please contact us at <a href="mailto:privacy@fundedwealth.com" className="text-fw-orange hover:underline">privacy@fundedwealth.com</a>.</p>
          </section>

          {/* ─── 16. Data Breach & Incident Response ───────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">16. Data Breach & Incident Response</h2>
            <p>FundedWealth maintains processes designed to identify, investigate, contain, and remediate security incidents involving personal data. In the event of a data breach or security incident that affects personal data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>We will take reasonable steps to contain and mitigate the incident</li>
              <li>We will investigate the scope and impact of the breach</li>
              <li>Where legally required, we will provide notifications to appropriate authorities and/or affected individuals in accordance with applicable law</li>
              <li>We will take steps to prevent recurrence where feasible</li>
            </ul>
          </section>

          {/* ─── 17. Changes to This Privacy Policy ────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">17. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, the Service, or applicable law. When we make material changes, we will update the "Last updated" date at the top of this page and may communicate changes through the website or other appropriate channels.</p>
            <p className="mt-3">Your continued use of the Service after the updated Privacy Policy is posted constitutes acceptance of the revised policy. We encourage you to review this Privacy Policy periodically.</p>
          </section>

          {/* ─── 18. Contact Us ────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">18. Contact Us</h2>
            <p>For questions, concerns, or requests regarding this Privacy Policy or the processing of your personal data, please contact us:</p>
            <p className="mt-2 text-white/60">Email: <a href="mailto:privacy@fundedwealth.com" className="text-fw-orange hover:underline">privacy@fundedwealth.com</a></p>
            <p className="text-white/60">Website: <Link href="/" className="text-fw-orange hover:underline">fundedwealth.com</Link></p>
            <p className="mt-3">We aim to respond to all privacy-related inquiries in a timely manner and in accordance with applicable law.</p>
          </section>

        </div>
      </div>

      <LegalCTA />
    </div>
  );
}
