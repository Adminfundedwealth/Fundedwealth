import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, CheckCircle2, Zap } from "lucide-react";
import { Link } from "wouter";

const BENEFITS = [
    "Instant Login After Purchase",
    "Mega Rewards Every Month",
    "No Hidden Rules — Pure Skill",
    "Weekly iPhone Winners",
    "Live Leaderboard Tracking",
];

// Countdown target: 2 days 14 hours 32 minutes from now (resets)
function getCountdown() {
    const total = 2 * 86400 + 14 * 3600 + 32 * 60; // fixed display
    const now = Math.floor(Date.now() / 1000);
    const remaining = total - (now % total);
    const d = Math.floor(remaining / 86400);
    const h = Math.floor((remaining % 86400) / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    return { d, h, m };
}

export default function FWChampionshipCard() {
    const [countdown, setCountdown] = useState(getCountdown());
    const [prizePool, setPrizePool] = useState(4500000);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(getCountdown());
            // Simulate live updating prize pool
            setPrizePool((p) => p + Math.floor(Math.random() * 500));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatPrize = (n: number) =>
        "₹" + n.toLocaleString("en-IN") + "+";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="relative w-full max-w-md mx-auto group"
        >
            {/* Animated gradient border */}
            <div className="absolute -inset-[2px] rounded-[34px] bg-gradient-to-r from-[#AB18C2] via-[#D93AA0] to-[#DC4D34] opacity-70 blur-[1px] group-hover:opacity-100 transition-opacity duration-500 animate-[spin_6s_linear_infinite]" style={{ backgroundSize: "200% 200%" }} />

            {/* Card body */}
            <div className="relative rounded-[32px] bg-[#040105]/95 backdrop-blur-xl border border-[#AB18C2]/20 p-6 sm:p-8 shadow-[0_0_60px_rgba(171,24,194,0.15)] overflow-hidden">
                {/* Floating particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-[#D93AA0]/60"
                        animate={{
                            x: [0, (Math.random() - 0.5) * 100],
                            y: [0, (Math.random() - 0.5) * 80],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                        style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                        }}
                    />
                ))}

                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[#AB18C2]/10 rounded-full blur-[80px] pointer-events-none" />

                {/* TOP SECTION */}
                <div className="relative flex flex-col items-center text-center mb-6">
                    {/* Trophy with pulsing aura */}
                    <div className="relative mb-4">
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-[#AB18C2]/30 blur-xl"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                            className="absolute inset-0 w-16 h-16 rounded-full bg-[#D93AA0]/20 blur-lg"
                        />
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#AB18C2] to-[#D93AA0] flex items-center justify-center shadow-[0_0_30px_rgba(171,24,194,0.5)]">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Badge + Live */}
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#AB18C2]/15 border border-[#AB18C2]/40 text-[11px] font-extrabold text-[#D93AA0] uppercase tracking-widest">
                            FW Championship
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-green-400 uppercase">Live</span>
                        </span>
                    </div>
                </div>

                {/* MIDDLE SECTION - Benefits */}
                <div className="space-y-2.5 mb-6">
                    {BENEFITS.map((benefit, i) => (
                        <motion.div
                            key={benefit}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i, duration: 0.4 }}
                            className="flex items-center gap-2.5"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            >
                                <CheckCircle2 className="w-4 h-4 text-[#D93AA0] shrink-0" />
                            </motion.div>
                            <span className="text-sm text-white/85 font-medium">{benefit}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Prize Pool + Traders */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-xl p-3 bg-[#56266C]/20 border border-[#AB18C2]/20">
                        <div className="text-[9px] font-bold text-[#D93AA0] uppercase tracking-wider mb-1">Prize Pool</div>
                        <motion.div
                            key={prizePool}
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            className="text-lg sm:text-xl font-extrabold text-white"
                        >
                            {formatPrize(prizePool)}
                        </motion.div>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[9px] text-green-400 font-medium">Live updating</span>
                        </div>
                    </div>
                    <div className="rounded-xl p-3 bg-[#56266C]/20 border border-[#AB18C2]/20">
                        <div className="text-[9px] font-bold text-[#D93AA0] uppercase tracking-wider mb-1">Traders Joined</div>
                        <div className="text-lg sm:text-xl font-extrabold text-white">15,000+</div>
                        <div className="text-[9px] text-white/40 mt-0.5">& growing</div>
                    </div>
                </div>

                {/* CTA BUTTON */}
                <Link href="/championship">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative w-full py-4 rounded-2xl font-extrabold text-white text-base sm:text-lg uppercase tracking-wide overflow-hidden group/btn"
                    >
                        {/* Button gradient background */}
                        <motion.div
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-r from-[#AB18C2] via-[#DC4D34] to-[#D93AA0] rounded-2xl"
                            style={{ backgroundSize: "200% 200%" }}
                        />
                        {/* Glow pulse */}
                        <motion.div
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(217,58,160,0.5)]"
                        />
                        <span className="relative z-10">Join Championship Now</span>
                    </motion.button>
                </Link>

                {/* FOOTER */}
                <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <Zap className="text-sm" size={14} />
                        <span className="text-xs text-white/60 font-medium">Limited slots remaining</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-white/80">
                        <span className="px-2 py-1 rounded-md bg-[#56266C]/40 border border-[#AB18C2]/20">
                            {String(countdown.d).padStart(2, "0")}D
                        </span>
                        <span className="text-white/30">:</span>
                        <span className="px-2 py-1 rounded-md bg-[#56266C]/40 border border-[#AB18C2]/20">
                            {String(countdown.h).padStart(2, "0")}H
                        </span>
                        <span className="text-white/30">:</span>
                        <span className="px-2 py-1 rounded-md bg-[#56266C]/40 border border-[#AB18C2]/20">
                            {String(countdown.m).padStart(2, "0")}M
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
