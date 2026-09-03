import { ArrowUpRight, BarChart3, Globe2, LockKeyhole, Rocket, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSAL_KEY = "fundedwealth-forex-launch-popup-dismissed";
const FOREX_URL = "https://forex.fundedwealth.com/";

function hasDismissedPopup() {
  try {
    return window.sessionStorage.getItem(DISMISSAL_KEY) === "true";
  } catch {
    return false;
  }
}

export default function ForexLaunchPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!hasDismissedPopup()) setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopup();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const closePopup = () => {
    try {
      window.sessionStorage.setItem(DISMISSAL_KEY, "true");
    } catch {
      // Closing still works when storage is unavailable.
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020711]/85 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closePopup();
    }}>
      <div aria-describedby="forex-launch-description" aria-labelledby="forex-launch-title" aria-modal="true" className="relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-[22px] border border-white/15 bg-[#07111d] shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-[1.08fr_.92fr] lg:overflow-hidden" role="dialog">
        <button aria-label="Close Forex launch popup" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" onClick={closePopup} type="button"><X size={20} /></button>
        <section className="relative isolate flex min-h-[360px] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_65%_110%,rgba(0,191,255,.3),transparent_35%),linear-gradient(145deg,#061426,#07101d_55%,#10263a)] p-7 sm:p-9 lg:min-h-[480px] lg:p-10">
          <div className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div>
            <div className="mb-12 flex items-center gap-3 text-sm font-bold tracking-[.22em] text-white"><img alt="FundedWealth" className="h-8 w-8 rounded-lg" src="/logo.png" /><span>FUNDEDWEALTH <span className="text-cyan-300">FOREX</span></span></div>
            <p className="mb-3 text-xs font-semibold tracking-[.28em] text-cyan-200/80">A NEW ERA OF TRADING</p>
            <h1 className="max-w-xl text-4xl font-black leading-[.98] tracking-tight text-white sm:text-5xl lg:text-6xl" id="forex-launch-title">GLOBAL MARKETS.<br /><span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">ENDLESS POSSIBILITIES.</span></h1>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-5 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[[Globe2, "Global markets"], [ShieldCheck, "Fair rules"], [BarChart3, "Fast payouts"], [Rocket, "Trade smarter"]].map(([Icon, label]) => <div className="flex items-center gap-2 text-xs font-medium text-white/70 sm:block" key={label as string}><Icon className="mb-2 text-cyan-300" size={22} /><span>{label as string}</span></div>)}
          </div>
          <div className="mt-8 rounded-2xl border border-cyan-300/40 bg-[#081321]/75 p-5 shadow-[0_0_30px_rgba(0,200,255,.08)]"><div className="flex items-center gap-3 text-fuchsia-300"><Rocket size={22} /><strong className="tracking-wide">FOREX IS LAUNCHING SOON</strong></div><p className="mt-2 text-sm leading-relaxed text-white/65">Join the next generation of funded global trading.</p></div>
        </section>
        <section className="flex flex-col justify-center bg-[#09131f] p-7 sm:p-10 lg:p-12">
          <div className="mb-10 text-center lg:mb-14"><div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/10 bg-[#111d2c] shadow-[0_0_35px_rgba(0,210,255,.15)]"><img alt="FundedWealth Forex logo" className="h-12 w-12 object-contain" src="/logo.png" /></div><div className="text-lg font-extrabold tracking-[.16em] text-white">FUNDEDWEALTH</div><div className="mt-1 text-sm font-bold tracking-[.35em] text-cyan-300">FOREX</div></div>
          <h2 className="text-center text-3xl font-black leading-tight text-white sm:text-4xl">Your edge is about to go global.</h2>
          <p className="mx-auto mt-5 max-w-md text-center text-base leading-relaxed text-white/60" id="forex-launch-description">Explore a new platform built for ambitious traders with access to global markets, transparent rules, and a sharper way to trade.</p>
          <a className="group mt-9 flex min-h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-5 text-center text-sm font-extrabold tracking-wide text-white shadow-[0_12px_30px_rgba(99,72,255,.3)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#09131f]" href={FOREX_URL}>EXPLORE FUNDEDWEALTH FOREX <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={20} /></a>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/45"><LockKeyhole size={14} /> Secure access. Built for the next move.</div>
        </section>
      </div>
    </div>
  );
}