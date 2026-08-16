/**
 * SocialMediaRail
 *
 * Fixed right-side vertical social rail.
 * - Desktop: full vertical pill with logo + icons, centered vertically on the right edge.
 * - Tablet: compact version with slightly smaller icons.
 * - Mobile: hidden (existing floating elements cover social access on small screens).
 *
 * Social URLs are taken directly from the existing codebase — no invented links.
 */

import { useLocation } from "wouter";

// ─── Social link definitions ──────────────────────────────────────────────────
// URLs sourced from: home.tsx footer, community.tsx SOCIAL_LINKS, WhatsAppButton.tsx
const SOCIAL_LINKS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://whatsapp.com/channel/0029Vb7PZoPFHWpz05pv7Q0A",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    hoverColor: "hover:text-[#25D366]",
    glowColor: "rgba(37,211,102,0.45)",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/fundedwealthind",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    hoverColor: "hover:text-[#E1306C]",
    glowColor: "rgba(225,48,108,0.45)",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@FundedWealth",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    hoverColor: "hover:text-[#FF0000]",
    glowColor: "rgba(255,0,0,0.4)",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/share/1CwV3nXM9x/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
    hoverColor: "hover:text-[#1877F2]",
    glowColor: "rgba(24,119,242,0.45)",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    href: "https://x.com/Fundedwealthind",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    hoverColor: "hover:text-white",
    glowColor: "rgba(255,255,255,0.3)",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/fundedwealthind",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    hoverColor: "hover:text-[#26A5E4]",
    glowColor: "rgba(38,165,228,0.45)",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SocialMediaRail() {
  const [location] = useLocation();

  // Hide on dashboard (dashboard has its own full-screen layout)
  const isDashboard = location.startsWith("/dashboard");
  if (isDashboard) return null;

  return (
    <>
      {/* ── Desktop / tablet rail (lg and above) ── */}
      <aside
        className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center"
        aria-label="Social media links"
      >
        {/* Pill container */}
        <div
          className="flex flex-col items-center gap-1 py-3 px-[10px] rounded-l-2xl"
          style={{
            background: "rgba(10, 0, 28, 0.78)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(74, 0, 224, 0.35)",
            borderRight: "none",
            boxShadow:
              "0 0 0 1px rgba(74,0,224,0.15) inset, 0 0 24px rgba(74,0,224,0.2), 0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* FundedWealth logo */}
          <a
            href="/"
            aria-label="FundedWealth — Go to home"
            className="group flex items-center justify-center w-9 h-9 mb-1 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A00E0]"
            title="FundedWealth"
          >
            <img
              src="/logo.png"
              alt="FundedWealth logo"
              className="w-7 h-7 rounded-lg object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(74,0,224,0.9)] group-hover:scale-110"
            />
          </a>

          {/* Separator */}
          <div
            className="w-5 h-px my-1"
            style={{ background: "rgba(74,0,224,0.4)" }}
            aria-hidden="true"
          />

          {/* Social icons */}
          {SOCIAL_LINKS.map((social) => (
            <SocialIcon key={social.id} social={social} />
          ))}

          {/* Separator */}
          <div
            className="w-5 h-px my-1"
            style={{ background: "rgba(74,0,224,0.4)" }}
            aria-hidden="true"
          />

          {/* Vertical "GET FUNDED" label */}
          <a
            href="/#plans"
            className="group flex items-center justify-center mt-1"
            aria-label="Get Funded — View trading plans"
            title="Get Funded"
          >
            <span
              className="text-[9px] font-heading font-extrabold tracking-[0.2em] uppercase transition-all duration-300 group-hover:text-[#D63384]"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.2em",
              }}
            >
              // GET FUNDED
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}

// ─── Individual icon button ───────────────────────────────────────────────────

interface SocialItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
  glowColor: string;
}

function SocialIcon({ social }: { social: SocialItem }) {
  return (
    <div className="relative group">
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Follow FundedWealth on ${social.label}`}
        className={`
          flex items-center justify-center
          w-9 h-9 rounded-xl
          text-white/50 ${social.hoverColor}
          transition-all duration-300
          hover:scale-115 hover:bg-white/5
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A00E0]
        `}
        style={
          {
            "--glow": social.glowColor,
          } as React.CSSProperties
        }
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.filter = `drop-shadow(0 0 6px ${social.glowColor})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "";
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.filter = `drop-shadow(0 0 6px ${social.glowColor})`;
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "";
        }}
      >
        {social.icon}
      </a>

      {/* Tooltip — shown on hover and focus, positioned to the left */}
      <div
        className="
          absolute right-full top-1/2 -translate-y-1/2 mr-2
          px-2 py-1 rounded-md text-[11px] font-semibold text-white whitespace-nowrap
          pointer-events-none
          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
          translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0
          transition-all duration-200
        "
        style={{
          background: "rgba(10,0,28,0.92)",
          border: "1px solid rgba(74,0,224,0.4)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
        role="tooltip"
        id={`tooltip-${social.id}`}
      >
        {social.label}
        {/* Tooltip arrow */}
        <span
          className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent"
          style={{ borderLeftColor: "rgba(74,0,224,0.4)" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
