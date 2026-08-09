import { useEffect, useMemo, useState } from "react";
import SEOHead from "@/components/SEOHead";

interface EconomicEvent {
  id: number;
  title: string;
  country: string;
  eventType: string;
  impact: "low" | "medium" | "high";
  scheduledAt: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  source: string;
  sourceUrl: string | null;
  isPinned: boolean;
}

const REGION_FILTERS = [
  { id: "all", label: "All" },
  { id: "India", label: "India" },
  { id: "Global", label: "Global" },
];

const IMPACT_FILTERS = [
  { id: "all", label: "All impact" },
  { id: "high", label: "High impact" },
  { id: "low", label: "Low impact" },
];

const TABS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

function sortEventsForDisplay(events: EconomicEvent[]) {
  const impactRank: Record<EconomicEvent["impact"], number> = { high: 0, medium: 1, low: 2 };
  return [...events].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.country === "India" && b.country !== "India") return -1;
    if (a.country !== "India" && b.country === "India") return 1;
    if (impactRank[a.impact] !== impactRank[b.impact]) return impactRank[a.impact] - impactRank[b.impact];
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });
}

function groupByWindow(events: EconomicEvent[]) {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    today: events.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      return eventDate >= now && eventDate <= endOfToday;
    }),
    week: events.filter((event) => {
      const eventDate = new Date(event.scheduledAt);
      return eventDate > endOfToday && eventDate <= oneWeekLater;
    }),
    upcoming: events.filter((event) => new Date(event.scheduledAt) > oneWeekLater),
    past: events.filter((event) => new Date(event.scheduledAt) < now),
  };
}

export default function EconomicCalendarPage() {
  const [region, setRegion] = useState("all");
  const [impact, setImpact] = useState("all");
  const [activeTab, setActiveTab] = useState("today");
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const query: Record<string, string> = {};
    if (region !== "all") query.region = region;
    if (impact !== "all") query.impact = impact;
    return new URLSearchParams(query).toString();
  }, [region, impact]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch(`/api/economic-events${params ? `?${params}` : ""}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load economic calendar");
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setEvents(Array.isArray(data.events) ? data.events : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to fetch events");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [params]);

  const sortedEvents = useMemo(() => sortEventsForDisplay(events), [events]);
  const groups = useMemo(() => groupByWindow(sortedEvents), [sortedEvents]);
  const pinnedEvents = useMemo(() => sortedEvents.filter((event) => event.isPinned), [sortedEvents]);
  const activeEvents = useMemo(() => groups[activeTab as keyof ReturnType<typeof groupByWindow>] ?? [], [groups, activeTab]);
  const highImpactCount = sortedEvents.filter((event) => event.impact === "high").length;

  return (
    <div className="min-h-screen bg-[#0D0020] text-white px-4 md:px-6 lg:px-8 xl:px-10">
      <SEOHead
        title="India Economic Calendar 2026 — RBI & Global Macro Events"
        description="Free India-first economic calendar for traders. Track RBI announcements, FOMC, CPI, GDP and all high-impact macro events for NSE, BSE & MCX trading in real time."
        keywords="India economic calendar, RBI calendar 2026, NSE economic events, trading calendar India, macro events India, FOMC calendar, CPI calendar India, economic events for traders, high impact news India"
        canonical="/economic-calendar"
      />
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#11001f] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-[#A27AF3]">Economic Calendar</p>
              <h1 className="text-3xl font-bold text-white">Zero-maintenance India-first macro schedule</h1>
              <p className="max-w-2xl text-sm text-white/70">Auto-syncs global macro events, RBI announcements, and high-impact alerts daily with India-first priority. Use filters to surface India, global, high impact, or low impact prints.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {REGION_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setRegion(filter.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${region === filter.id ? "bg-[#4A00E0] text-white shadow-lg shadow-[#4A00E0]/30" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  {filter.label}
                </button>
              ))}
              {IMPACT_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setImpact(filter.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${impact === filter.id ? "bg-[#D63384] text-white shadow-lg shadow-[#D63384]/30" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[#0E0024] p-5">
              <p className="text-sm text-white/60">Total events</p>
              <p className="mt-3 text-3xl font-bold text-white">{sortedEvents.length}</p>
            </div>
            <div className="rounded-3xl bg-[#0E0024] p-5">
              <p className="text-sm text-white/60">High impact</p>
              <p className="mt-3 text-3xl font-bold text-[#FF5E6C]">{highImpactCount}</p>
            </div>
            <div className="rounded-3xl bg-[#0E0024] p-5">
              <p className="text-sm text-white/60">Pinned</p>
              <p className="mt-3 text-3xl font-bold text-[#A27AF3]">{sortedEvents.filter((event) => event.isPinned).length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-[#11001f] p-10 text-center text-white/70">Loading calendar...</div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-[#380014] p-10 text-center text-red-200">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#11001f] p-4">
              <div className="flex flex-wrap items-center gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? "bg-[#4A00E0] text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {pinnedEvents.length > 0 ? (
              <section className="rounded-3xl border border-[#A27AF3]/10 bg-[#130026] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#A27AF3]">Pinned events</p>
                    <h2 className="text-2xl font-bold text-white">Priority macro triggers</h2>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#A27AF3]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#A27AF3]">Pinned</span>
                </div>
                <div className="space-y-4">
                  {pinnedEvents.map((event) => (
                    <article key={event.id} className="rounded-3xl border border-white/10 bg-[#0F0027] p-4 ring-1 ring-white/5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                            <span>{event.country}</span>
                            <span className="px-2 py-1 rounded-full bg-white/5">{event.eventType}</span>
                            <span className={`px-2 py-1 rounded-full ${event.impact === "high" ? "bg-[#FF5E6C]/10 text-[#FF5E6C]" : event.impact === "medium" ? "bg-[#F8A541]/10 text-[#F8A541]" : "bg-white/5 text-white/60"}`}>{event.impact}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                          <p className="text-sm text-white/60">{formatDisplayDate(event.scheduledAt)}</p>
                        </div>
                        <div className="space-y-2 text-right text-sm text-white/60">
                          {event.sourceUrl ? (
                            <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-[#A27AF3] hover:text-[#b48cff]">Source</a>
                          ) : null}
                          {event.actual ? <div>Actual: <span className="text-white">{event.actual}</span></div> : null}
                          {event.forecast ? <div>Forecast: <span className="text-white">{event.forecast}</span></div> : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-white/10 bg-[#11001f] p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">{TABS.find((tab) => tab.id === activeTab)?.label}</p>
                  <p className="text-2xl font-bold text-white">{activeEvents.length} event{activeEvents.length === 1 ? "" : "s"}</p>
                </div>
                <p className="text-sm text-white/60">India-first events are surfaced above global events when available.</p>
              </div>

              {activeEvents.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-white/60">No events found for this range.</div>
              ) : (
                <div className="mt-6 space-y-4">
                  {activeEvents.map((event) => (
                    <article key={event.id} className="rounded-3xl border border-white/10 bg-[#0E0024] p-4 ring-1 ring-white/5 transition hover:border-[#4A00E0]/40 hover:bg-[#15002e]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                            <span>{event.country}</span>
                            <span className="px-2 py-1 rounded-full bg-white/5">{event.eventType}</span>
                            <span className={`px-2 py-1 rounded-full ${event.impact === "high" ? "bg-[#FF5E6C]/10 text-[#FF5E6C]" : event.impact === "medium" ? "bg-[#F8A541]/10 text-[#F8A541]" : "bg-white/5 text-white/60"}`}>{event.impact}</span>
                            {event.isPinned ? <span className="px-2 py-1 rounded-full bg-[#A27AF3]/10 text-[#A27AF3]">Pinned</span> : null}
                          </div>
                          <h2 className="text-lg font-semibold text-white">{event.title}</h2>
                          <p className="text-sm text-white/60">{formatDisplayDate(event.scheduledAt)}</p>
                        </div>

                        <div className="space-y-2 text-right text-sm text-white/60">
                          {event.sourceUrl ? (
                            <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-[#A27AF3] hover:text-[#b48cff]">Source</a>
                          ) : null}
                          {event.actual ? <div>Actual: <span className="text-white">{event.actual}</span></div> : null}
                          {event.forecast ? <div>Forecast: <span className="text-white">{event.forecast}</span></div> : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}