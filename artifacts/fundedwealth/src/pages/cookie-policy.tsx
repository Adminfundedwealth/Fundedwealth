import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";
import LegalCTA from "@/components/LegalCTA";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Cookie Policy — FundedWealth"
        description="Read FundedWealth's Cookie Policy. Learn how we use cookies and similar technologies on our platform."
        canonical="/cookie-policy"
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
        <h1 className="text-4xl font-heading font-extrabold mb-2">Cookie Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: August 26, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences, understand how you use the site, and improve your experience. Similar technologies include local storage, session storage, and pixel tags.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Cookies</h2>
            <p>FundedWealth uses cookies and similar technologies for the following purposes:</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Essential Cookies</h3>
            <p>These are required for the platform to function correctly. They enable core features like authentication, session management, security, and account access. Without these cookies, the platform cannot operate properly.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Functional Cookies</h3>
            <p>These remember your preferences and settings (such as language, theme, or dashboard layout) to provide a personalized experience.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Analytics Cookies</h3>
            <p>These help us understand how users interact with our platform, which pages are visited most, and how users navigate the site. We use this information to improve functionality and user experience.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Security and Fraud-Prevention Cookies</h3>
            <p>These help detect unusual or suspicious activity, prevent fraud, and protect the integrity of the platform. They may include device fingerprinting and behavioral analysis technologies.</p>

            <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">Marketing and Advertising Cookies</h3>
            <p>These may be used to deliver relevant advertisements, track advertising effectiveness, and limit ad frequency. These cookies may be set by third-party advertising partners.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Third-Party Cookies</h2>
            <p>Some cookies on our platform are placed by third-party service providers, including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>Analytics providers (e.g., Google Analytics, Mixpanel)</li>
              <li>Payment processors</li>
              <li>Security and fraud-prevention services</li>
              <li>Customer support tools</li>
              <li>Social media platforms</li>
            </ul>
            <p className="mt-3">These third parties may collect information about your online activities over time and across different websites. We encourage you to review the privacy policies of these third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookie Duration</h2>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li><strong className="text-white/80">Session Cookies:</strong> Expire when you close your browser</li>
              <li><strong className="text-white/80">Persistent Cookies:</strong> Remain on your device for a set period or until you delete them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Managing Cookies</h2>
            <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>View what cookies are stored on your device</li>
              <li>Delete individual or all cookies</li>
              <li>Block cookies from specific or all websites</li>
              <li>Set preferences for cookie acceptance</li>
            </ul>
            <p className="mt-3">Please note that disabling essential cookies may affect your ability to use the FundedWealth platform, including logging in and accessing your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Local Storage and Similar Technologies</h2>
            <p>In addition to cookies, we may use browser local storage and session storage to store preferences, cache data for performance, and maintain session state. These technologies function similarly to cookies but may not be controlled by cookie-specific browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Updates to This Policy</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in technology, law, or our business practices. The "Last updated" date at the top indicates the most recent revision.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Contact</h2>
            <p>For questions about our use of cookies:</p>
            <p className="mt-2 text-white/60">privacy@fundedwealth.com</p>
            <p className="mt-3">For more information about how we handle personal data, see our <Link href="/privacy" className="text-fw-orange hover:underline">Privacy Policy</Link>.</p>
          </section>

        </div>
      </div>

      <LegalCTA />
    </div>
  );
}
