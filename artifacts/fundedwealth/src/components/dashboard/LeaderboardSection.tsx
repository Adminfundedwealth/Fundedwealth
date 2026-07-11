import { useEffect, useState } from "react";
import { Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

type LeaderboardEntry = {
  rank: number;
  firstName: string | null;
  city: string | null;
  totalPayout: number;
  badge: string;
};

export function LeaderboardSection() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    fetch(`${import.meta.env.BASE_URL}api/users/leaderboard`, { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((rows: any[]) => {
        const BADGES = ["🏆", "🥈", "🥉"];
        setData(rows.map((row, i) => ({ rank: i + 1, firstName: row.firstName || row.name || "Trader", city: row.city || null, totalPayout: row.totalPayout || 0, badge: BADGES[i] || "" })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white font-extrabold text-xl mb-1">Leaderboard</h2>
        <p className="text-white/50 text-sm">Top performing traders this month</p>
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-white/10 mx-auto mb-3" />
                <div className="h-4 bg-white/10 rounded-full w-24 mx-auto mb-2" />
                <div className="h-5 bg-white/10 rounded-full w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertTriangle size={28} className="text-red-400 mx-auto mb-3" />
          <div className="text-white font-bold mb-1">Unable to load leaderboard</div>
          <div className="text-white/50 text-sm mb-4">Check your connection and try again.</div>
          <Button onClick={load} className="bg-white/10 text-white rounded-xl px-5 h-9 text-sm hover:bg-white/20">Retry</Button>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Trophy size={36} className="text-white/20 mx-auto mb-3" />
          <div className="text-white font-bold mb-1">No traders on the leaderboard yet</div>
          <div className="text-white/50 text-sm">Complete your first funded challenge to claim a spot.</div>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {data.slice(0, 3).map((t, i) => (
              <div key={t.rank} className={`bg-white/5 border rounded-2xl p-5 text-center ${i === 0 ? "border-amber-400/40 bg-amber-500/5" : "border-white/10"}`}>
                <div className="text-3xl mb-2">{t.badge}</div>
                <div className="text-white font-bold text-lg">{t.firstName}</div>
                {t.city && <div className="text-white/50 text-xs mb-3">{t.city}</div>}
                <div className="text-green-400 font-extrabold text-xl">{fmt(t.totalPayout)}</div>
                <div className="text-white/40 text-xs mt-1">Total Payout</div>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
                <span>Rank</span><span className="col-span-2">Trader</span><span>Total Payout</span>
              </div>
              {data.map(t => (
                <div key={t.rank} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.03] transition-colors">
                  <span className={`font-bold text-sm ${t.rank <= 3 ? "text-amber-400" : "text-white/60"}`}>{t.badge || `#${t.rank}`}</span>
                  <div className="col-span-2">
                    <div className="text-white font-semibold text-sm">{t.firstName}</div>
                    {t.city && <div className="text-white/40 text-xs">{t.city}</div>}
                  </div>
                  <span className="text-green-400 font-bold text-sm">{fmt(t.totalPayout)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
