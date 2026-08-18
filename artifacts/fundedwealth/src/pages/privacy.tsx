import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";

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
        <p className="text-white/40 text-sm mb-10">Last updated: April 14, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Account Information:</strong> Name, email address, phone number, city, state when you create an account</li>
              <li><strong className="text-white/80">KYC Information:</strong> Government-issued ID, PAN card, Aadhaar (for identity verification before payouts)</li>
              <li><strong className="text-white/80">Payment Information:</strong> UPI ID, bank account details for processing payouts</li>
              <li><strong className="text-white/80">Trading Data:</strong> Your trading activity, performance metrics, and account statistics</li>
              <li><strong className="text-white/80">Communications:</strong> Messages sent through our contact form, support tickets, and chatbot interactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Automatically Collected Information</h2>
            <p>When you use our platform, we automatically collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Device information (browser type, operating system, device type)</li>
              <li>IP address and approximate location</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
              <li>Cookies and similar tracking technologies</li>
              <li><strong className="text-white/80">Device Fingerprint:</strong> We use the open-source FingerprintJS library to generate a device identifier based on your browser and device characteristics (such as screen resolution, timezone, language, and hardware configuration). This identifier is generated locally in your browser and sent to FundedWealth's servers — it is not transmitted to any external FingerprintJS service. We use this information to detect suspicious activity, prevent fraud, protect accounts, and identify potentially unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Provide, maintain, and improve our trading evaluation services</li>
              <li>Process trading challenges, funded account management, and payouts</li>
              <li>Verify your identity (KYC compliance)</li>
              <li>Send transactional emails (account updates, payout confirmations)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect and prevent fraud, unauthorized access, and abuse</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Service Providers:</strong> Payment processors, email services, and hosting providers who assist in operating our platform</li>
              <li><strong className="text-white/80">Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
              <li><strong className="text-white/80">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including encryption in transit (TLS/SSL), secure data storage, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide you services. We may retain certain information for legal, tax, or regulatory compliance purposes. You may request deletion of your data by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p>Under applicable Indian privacy laws, you have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookies</h2>
            <p>We use cookies and similar technologies for authentication, preferences, analytics, and performance monitoring. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain platform functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Third-Party Services</h2>
            <p>Our platform integrates with third-party services including Supabase (authentication and session management), payment processors, and analytics tools. Each of these services has its own privacy policy governing the use of your information.</p>
            <p className="mt-3">We use ProxyCheck.io, a third-party IP intelligence service, for security and fraud prevention purposes. Your IP address may be checked against ProxyCheck.io to identify connections from VPNs, proxies, TOR networks, or datacenter/hosting infrastructure. The result of this check is stored on FundedWealth's servers and may contribute to our security and fraud-detection systems, which help protect accounts and the integrity of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Children's Privacy</h2>
            <p>Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will take steps to delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our platform and updating the "Last updated" date. Your continued use of the Service constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact Us</h2>
            <p>For questions or concerns about this Privacy Policy or your personal data, contact us at:</p>
            <p className="mt-2 text-white/60">Email: privacy@fundedwealth.com</p>
            <p className="text-white/60">Website: <Link href="/" className="text-fw-orange hover:underline">fundedwealth.com</Link></p>
          </section>
        </div>
      </div>
    </div>
  );
}
