import { ArrowRight } from "lucide-react";

/**
 * Premium glassmorphism CTA panel for legal/policy pages.
 * Placed immediately above the footer on every legal page.
 */
export default function LegalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0D0020] py-20 px-4">
      {/* Ambient animated orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-500/15 blur-[100px] animate-[pulse_8s_ease-in-out_infinite_1s]" />
      <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-indigo-500/15 blur-[90px] animate-[pulse_7s_ease-in-out_infinite_2s]" />

      {/* Glass card */}
      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_60px_rgba(74,0,224,0.15)] p-10 md:p-14 text-center transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_12px_80px_rgba(214,51,132,0.2)]">
          {/* Top highlight line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white mb-4">
            Ready to Start Your Evaluation?
          </h2>

          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto">
            Choose your program, review the rules, and begin when you're ready.
          </p>

          <a
            href="/#plans"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4A00E0] to-[#D63384] px-8 py-3.5 text-white font-bold text-sm md:text-base shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-[#0D0020]"
          >
            View Programs
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
