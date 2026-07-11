import { useState } from "react";
import { NotebookPen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type JournalEntry = { id: number; date: string; title: string; note: string; tag: "win" | "loss" | "lesson" };

interface Props {
  storageKey: string;
  initial: JournalEntry[];
}

export function JournalSection({ storageKey, initial }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>(initial);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [tag, setTag] = useState<JournalEntry["tag"]>("lesson");

  const save = (next: JournalEntry[]) => {
    setEntries(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { }
  };
  const add = () => {
    if (!title.trim() || !note.trim()) return;
    save([{ id: Date.now(), date: new Date().toISOString(), title: title.trim(), note: note.trim(), tag }, ...entries]);
    setTitle(""); setNote(""); setTag("lesson");
  };
  const remove = (id: number) => save(entries.filter(e => e.id !== id));
  const tagStyle = (t: JournalEntry["tag"]) =>
    t === "win" ? "bg-green-500/15 text-green-400 border-green-500/30"
      : t === "loss" ? "bg-red-500/15 text-red-400 border-red-500/30"
        : "bg-amber-500/15 text-amber-400 border-amber-500/30";

  const stats = {
    wins: entries.filter(e => e.tag === "win").length,
    losses: entries.filter(e => e.tag === "loss").length,
    lessons: entries.filter(e => e.tag === "lesson").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-extrabold text-xl">Trading Journal</h2>
        <p className="text-white/55 text-sm mt-1">Log every setup, mistake and lesson. Saved locally to your browser, private to you.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ l: "Wins logged", v: stats.wins, c: "text-green-400" }, { l: "Losses logged", v: stats.losses, c: "text-red-400" }, { l: "Lessons", v: stats.lessons, c: "text-amber-400" }].map(s => (
          <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className={`font-extrabold text-2xl ${s.c}`}>{s.v}</div>
            <div className="text-white/45 text-[11px] mt-1 uppercase tracking-wider">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="text-white font-bold text-sm flex items-center gap-2"><NotebookPen size={16} className="text-fw-pink" /> New entry</div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Setup name — e.g. BANKNIFTY breakout @ 9:25"
          className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60" />
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="What went right or wrong? What will you do next time?"
          className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60 resize-none" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {(["win", "loss", "lesson"] as const).map(t => (
              <button key={t} onClick={() => setTag(t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border uppercase tracking-wider transition-all ${tag === t ? tagStyle(t) : "bg-white/5 border-white/10 text-white/45 hover:text-white/70"}`}>{t}</button>
            ))}
          </div>
          <Button onClick={add} disabled={!title.trim() || !note.trim()}
            className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-9 px-5 disabled:opacity-40">
            <Plus size={14} className="mr-1" /> Save entry
          </Button>
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <NotebookPen size={36} className="text-white/20 mx-auto mb-3" />
          <div className="text-white/55 text-sm">No entries yet — your first lesson is the most valuable one.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <div key={e.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tagStyle(e.tag)}`}>{e.tag}</span>
                    <span className="text-white/35 text-[11px]">{new Date(e.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div className="text-white font-bold text-base mb-1">{e.title}</div>
                  <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap">{e.note}</p>
                </div>
                <button onClick={() => remove(e.id)} className="text-white/35 hover:text-red-400 transition-colors p-1"><X size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
