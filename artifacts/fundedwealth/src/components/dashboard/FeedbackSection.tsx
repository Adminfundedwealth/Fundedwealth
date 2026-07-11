import { useState } from "react";
import { CheckCircle, Send, TrendingUp, AlertTriangle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  displayName: string;
  displayEmail: string;
}

export function FeedbackSection({ displayName, displayEmail }: Props) {
  const [type, setType] = useState<"feature" | "bug" | "praise" | "other">("feature");
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!msg.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, email: displayEmail, phone: "", subject: `[Dashboard feedback · ${type} · ${rating}★]`, message: msg.trim() }),
      });
      if (res.ok) { setDone(true); setMsg(""); }
    } catch { }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-extrabold text-xl">Feedback</h2>
        <p className="text-white/55 text-sm mt-1">Tell us what's working and what should be better. Every message is read by our India product team.</p>
      </div>

      {done ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-start gap-3">
          <CheckCircle size={22} className="text-green-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-white font-bold">Thank you — feedback received.</div>
            <div className="text-white/65 text-sm mt-1">Our product team reads every message. If you asked for a reply, we'll get back within 12 hours.</div>
            <button onClick={() => setDone(false)} className="mt-3 text-fw-pink text-xs font-bold hover:underline">Send another</button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Type of feedback</div>
            <div className="flex gap-2 flex-wrap">
              {([{ v: "feature", l: "Feature request" }, { v: "bug", l: "Bug report" }, { v: "praise", l: "Praise" }, { v: "other", l: "Other" }] as const).map(o => (
                <button key={o.v} onClick={() => setType(o.v)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${type === o.v ? "bg-gradient-to-r from-[#4A00E0]/30 to-[#D63384]/20 text-white border-fw-pink/40" : "bg-white/5 text-white/55 border-white/10 hover:text-white"}`}>{o.l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Overall rating</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)} className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? "text-fw-orange" : "text-white/20"}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Your message</div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} placeholder="Be as specific as possible — screenshots, steps to reproduce, ideas..."
              className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4A00E0]/60 resize-none" />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-white/40 text-xs">From: <span className="text-white/65">{displayEmail || "your dashboard account"}</span></div>
            <Button onClick={submit} disabled={submitting || !msg.trim()} className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-10 px-6 disabled:opacity-40">
              <Send size={14} className="mr-2" /> {submitting ? "Sending..." : "Send feedback"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, title: "Feature ideas", desc: "Tell us which tools, instruments or reports would help you trade better." },
          { icon: AlertTriangle, title: "Bug reports", desc: "Saw something broken? Share screenshots or steps and we'll fix it fast." },
          { icon: Heart, title: "Praise & wins", desc: "What did we get right? Your wins keep the team motivated." },
        ].map(c => (
          <div key={c.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A00E0]/30 to-[#D63384]/20 flex items-center justify-center mb-3"><c.icon size={18} className="text-fw-pink" /></div>
            <div className="text-white font-bold text-sm mb-1">{c.title}</div>
            <div className="text-white/55 text-xs leading-relaxed">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
