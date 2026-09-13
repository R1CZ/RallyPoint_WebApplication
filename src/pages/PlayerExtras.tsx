import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { CLUBS, DAYS, EVENTS, MESSAGES_SEED, PLAYERS, RATING_TREND, VIEWER } from "../lib/data";
import { ACHIEVEMENTS, DNA_LABELS } from "../lib/engine";
import { Avatar, Button, Card, Chip, EmptyState, Icon, Radar, Spark, Tabs, VerifyBadge, useToast } from "../components/ui";
import type { SessionUser } from "./Onboarding";

export type Notif = (typeof import("../lib/data").NOTIFICATIONS_SEED)[number];

/* ================= PLAY STYLE DNA ================= */
export function DnaView() {
  const [compareId, setCompareId] = useState("p1");
  const other = PLAYERS.find((p) => p.id === compareId)!;
  const myData = DNA_LABELS.map((d) => ({ label: d.label.split(" ")[0], value: VIEWER.dna[d.key] }));
  const otherData = DNA_LABELS.map((d) => ({ label: d.label.split(" ")[0], value: other.dna[d.key] }));
  const [dim, setDim] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black tracking-tight text-3xl">Play Style DNA</h1>
          <p className="mt-1.5 text-chalk/55 text-[14px] max-w-xl">An 8-dimension behavioural profile computed from your verified match stats. It shifts as real results arrive — no self-reporting, no vibes.</p>
        </div>
        <Chip tone="teal"><Icon name="dna" size={12} /> 34 matches sampled</Chip>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <Card className="p-7">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] tracking-widest text-teal">YOUR HELIX · vs · {other.name.toUpperCase()}</p>
            <select value={compareId} onChange={(e) => setCompareId(e.target.value)} className="rounded-lg bg-court-900 border border-chalk/12 px-3 py-1.5 text-[12px] font-semibold focus:outline-none">
              {PLAYERS.slice(0, 6).map((p) => <option key={p.id} value={p.id}>vs {p.name}</option>)}
            </select>
          </div>
          <div className="mt-4 relative">
            <Radar data={myData} size={320} stroke="#3ecfad" fill="rgba(62,207,173,0.12)" />
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <svg viewBox="0 0 320 320" width="100%" style={{ maxWidth: 320 }}>
                <polygon
                  points={otherData.map((d, i) => {
                    const n = otherData.length;
                    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
                    const R = 320 / 2 - 34;
                    return `${160 + Math.cos(a) * R * (d.value / 100)},${160 + Math.sin(a) * R * (d.value / 100)}`;
                  }).join(" ")}
                  fill="rgba(200,241,63,0.08)" stroke="#c8f13f" strokeWidth="1.4" strokeDasharray="5 4"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-6 text-[12px]">
            <span className="flex items-center gap-2 text-teal"><span className="w-3 h-0.5 bg-teal rounded" /> You</span>
            <span className="flex items-center gap-2 text-lime"><span className="w-3 h-0.5 bg-lime rounded border-dashed" /> {other.name}</span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <p className="font-mono text-[11px] tracking-widest text-chalk/45">DIMENSION BREAKDOWN</p>
            <div className="mt-4 space-y-3">
              {DNA_LABELS.map((d) => {
                const v = VIEWER.dna[d.key];
                const o = other.dna[d.key];
                const active = dim === d.key;
                return (
                  <button key={d.key} onMouseEnter={() => setDim(d.key)} onMouseLeave={() => setDim(null)} className={`w-full text-left rounded-lg px-3 py-2 transition ${active ? "bg-chalk/5" : ""}`}>
                    <div className="flex justify-between text-[12.5px] mb-1.5">
                      <span className="font-semibold">{d.label}</span>
                      <span className="font-mono text-chalk/55">{v} <span className="text-chalk/30">/ {o}</span></span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-chalk/8">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-teal transition-all duration-500" style={{ width: `${v}%` }} />
                      <span className="absolute -top-[3px] w-0.5 h-3 bg-lime rounded" style={{ left: `${o}%` }} title={`${other.name}: ${o}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="p-6">
            <p className="font-mono text-[11px] tracking-widest text-chalk/45">WHAT YOUR DNA SAYS</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-chalk/65">
              You're a <span className="text-teal font-bold">control dinker</span>: placement 82 and patience 80 put you in the top 12% of intermediates for rally construction. Aggression 42 means you win by attrition, not firepower — the Fair Match Engine pairs you with tempo-compatible partners and avoids stacking two passive pairs.
            </p>
            <p className="mt-3 text-[11.5px] text-chalk/40">Recomputed after every confirmed result · minimum 10 matches for a stable profile.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================= EVENTS + WAITLIST INTELLIGENCE ================= */
function WaitlistSlot({ eventId, onClaimed }: { eventId: string; onClaimed: () => void }) {
  const toast = useToast();
  const [left, setLeft] = useState(30 * 60);
  const [opened, setOpened] = useState(false);
  const [claimLeft, setClaimLeft] = useState(20);
  useEffect(() => {
    const iv = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    if (!opened || claimLeft <= 0) return;
    const t = setTimeout(() => setClaimLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [opened, claimLeft]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  if (claimLeft <= 0 && opened) {
    return <p className="text-[12px] text-blood font-semibold flex items-center gap-2"><Icon name="alert" size={13} /> Claim window expired — slot passed to the next eligible player.</p>;
  }
  if (opened) {
    return (
      <div className="anim-fadeUp flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-bold text-lime flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime pulse-dot" /> Slot opened! Claim expires in <span className="font-mono">{claimLeft}s</span>
        </p>
        <Button size="sm" onClick={() => { onClaimed(); toast({ icon: "trophy", title: "Slot claimed!", body: "You're registered. The remaining waitlist moved up one place." }); }}>Claim now</Button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[12.5px] text-chalk/55">
        <span className="font-bold text-gold">Waitlist #2</span> · offer expires <span className="font-mono">{mm}:{ss}</span> · auto-notified if a slot opens
      </p>
      <Button size="sm" variant="dark" onClick={() => setOpened(true)}>Simulate a cancellation</Button>
    </div>
  );
}

export function EventsView({ registered, setRegistered }: { registered: string[]; setRegistered: Dispatch<SetStateAction<string[]>> }) {
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [waitlisted, setWaitlisted] = useState<string[]>(["e1"]);
  const list = EVENTS.filter((e) => (filter === "all" ? true : e.clubId === filter));

  const register = (id: string, full: boolean) => {
    if (full) {
      setWaitlisted((p) => [...p, id]);
      toast({ icon: "clock", tone: "gold", title: "Added to smart waitlist", body: "If a spot opens, you'll get a timed offer — first eligible player to accept gets it." });
    } else {
      setRegistered((p) => [...p, id]);
      toast({ icon: "calendar", title: "You're registered", body: "Reminder scheduled 3h before. Cancellations after the 6h window affect reliability." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black tracking-tight text-3xl">Events</h1>
          <p className="mt-1.5 text-chalk/55 text-[14px]">Open play, ladders, tournaments — with smart waitlists and weather-aware scheduling.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg bg-court-900 border border-chalk/12 px-3 py-2 text-[12.5px] font-semibold focus:outline-none">
          <option value="all">All clubs</option>
          {CLUBS.slice(0, 6).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {list.map((e) => {
          const club = CLUBS.find((c) => c.id === e.clubId)!;
          const isReg = registered.includes(e.id);
          const isWait = waitlisted.includes(e.id);
          const full = e.filled >= e.capacity;
          const pct = Math.round((e.filled / e.capacity) * 100);
          return (
            <Card key={e.id} className="p-6 flex flex-col hover:border-chalk/25 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <Chip tone="gold">{e.type}</Chip>
                    <Chip>{e.level}</Chip>
                    {e.outdoor && <Chip tone={e.rainRisk && e.rainRisk > 50 ? "blood" : "teal"}><Icon name={e.rainRisk && e.rainRisk > 50 ? "wave" : "sun"} size={11} /> {e.outdoor ? "Outdoor" : ""}</Chip>}
                  </div>
                  <h3 className="font-display font-extrabold tracking-tight text-lg leading-tight">{e.title}</h3>
                  <p className="text-[12.5px] text-chalk/50 mt-1">{club.name} · {e.organizer}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-[15px] text-gold">{e.date}</p>
                  <p className="font-mono text-[11.5px] text-chalk/45">{e.time}</p>
                  <p className="text-[11px] text-lime font-semibold mt-1">{e.fee ? `$${e.fee}` : "Free"}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[11.5px] font-mono text-chalk/50 mb-1.5">
                  <span>{e.filled}/{e.capacity} registered{e.waitlist > 0 ? ` · ${e.waitlist} waiting` : ""}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-chalk/8 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${full ? "bg-blood" : pct > 70 ? "bg-gold" : "bg-lime"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {e.outdoor && e.rainRisk && e.rainRisk > 50 && (
                <div className="mt-4 rounded-xl border border-blood/25 bg-blood/8 px-4 py-3">
                  <p className="text-[12.5px] font-bold text-blood flex items-center gap-2"><Icon name="wave" size={14} /> Rain probability {e.rainRisk}% between 18:00–20:00</p>
                  <p className="text-[12px] text-chalk/55 mt-1">Organizer options: reschedule · move to indoor partner facility · notify players. Auto-cancellation is off (club policy).</p>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-chalk/8 flex items-center justify-between gap-3 flex-1 items-end">
                {isReg ? (
                  <span className="flex items-center gap-2 text-[13px] font-bold text-lime"><Icon name="check" size={15} /> Registered — see you there</span>
                ) : isWait ? (
                  <div className="w-full"><WaitlistSlot eventId={e.id} onClaimed={() => { setWaitlisted((p) => p.filter((x) => x !== e.id)); setRegistered((p) => [...p, e.id]); }} /></div>
                ) : (
                  <>
                    <span className="text-[11.5px] text-chalk/40">{full ? "Event full" : `${e.capacity - e.filled} spots left`}</span>
                    <Button size="sm" variant={full ? "dark" : "primary"} onClick={() => register(e.id, full)}>
                      {full ? "Join waitlist" : "Register"}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ================= RANKINGS ================= */
export function RankingsView() {
  const [tab, setTab] = useState("club");
  const board = useMemo(() => {
    const all = [...PLAYERS, VIEWER];
    const bias = (p: typeof VIEWER): number => {
      if (tab === "singles") return p.formats.includes("Singles") ? 40 : -25;
      if (tab === "doubles") return 15;
      if (tab === "global") return (p.rating - 1400) * 0.2;
      if (tab === "local") return -p.km * 3;
      return 0;
    };
    return all
      .map((p) => ({ p, adj: Math.round(p.rating + bias(p) + ((p.avatarHue * 7) % 23) - 11) }))
      .sort((a, b) => b.adj - a.adj);
  }, [tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Rankings</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Transparent Elo (K=24), split by scope and format. A ranking measures recent verified results — nothing more, never worth.</p>
      </div>
      <Tabs active={tab} onChange={setTab} tabs={[{ id: "club", label: "Club" }, { id: "local", label: "Local" }, { id: "global", label: "Global" }, { id: "singles", label: "Singles" }, { id: "doubles", label: "Doubles" }]} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-widest text-chalk/35 border-b border-chalk/8">
                <th className="px-5 py-3.5 font-semibold w-14">#</th>
                <th className="px-2 py-3.5 font-semibold">Player</th>
                <th className="px-2 py-3.5 font-semibold hidden sm:table-cell">Level</th>
                <th className="px-2 py-3.5 font-semibold hidden md:table-cell">W–L</th>
                <th className="px-2 py-3.5 font-semibold hidden md:table-cell">Form</th>
                <th className="px-2 py-3.5 font-semibold text-right">Rating</th>
                <th className="px-5 py-3.5 font-semibold text-right">30d</th>
              </tr>
            </thead>
            <tbody>
              {board.map(({ p, adj }, i) => {
                const me = p.id === "me";
                const move = ((p.avatarHue * 13) % 7) - 2;
                return (
                  <tr key={p.id} className={`border-b border-chalk/5 transition ${me ? "bg-lime/8" : "hover:bg-chalk/3"}`}>
                    <td className="px-5 py-3 font-mono font-bold text-chalk/50">{i + 1}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} hue={p.avatarHue} size={32} verified={p.verified} />
                        <div>
                          <p className="font-display font-bold tracking-tight">{p.name} {me && <span className="text-lime text-[10.5px] font-mono ml-1">YOU</span>}</p>
                          <p className="text-[11px] text-chalk/40">{p.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 hidden sm:table-cell text-chalk/60">{p.level}</td>
                    <td className="px-2 py-3 hidden md:table-cell font-mono text-[12px] text-chalk/55">{p.wins}–{p.losses}</td>
                    <td className="px-2 py-3 hidden md:table-cell">
                      <span className={`font-mono text-[12px] font-bold ${p.form > 0.15 ? "text-lime" : p.form < -0.1 ? "text-blood" : "text-chalk/45"}`}>{p.form > 0.15 ? "▲ hot" : p.form < -0.1 ? "▼ cold" : "— steady"}</span>
                    </td>
                    <td className="px-2 py-3 text-right font-mono font-bold text-[15px]">{adj}</td>
                    <td className={`px-5 py-3 text-right font-mono font-bold text-[12.5px] ${move >= 0 ? "text-teal" : "text-blood"}`}>{move >= 0 ? `▲${move}` : `▼${-move}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="font-display font-bold text-[14px] flex items-center gap-2"><Icon name="target" size={15} className="text-lime" /> How it's calculated</p>
          <p className="mt-2 text-[12.5px] text-chalk/55 leading-relaxed font-mono">Δ = K · (result − expected)<br />expected = 1 / (1 + 10^((Rb−Ra)/400))</p>
        </Card>
        <Card className="p-5">
          <p className="font-display font-bold text-[14px] flex items-center gap-2"><Icon name="shieldCheck" size={15} className="text-teal" /> Verified results only</p>
          <p className="mt-2 text-[12.5px] text-chalk/55 leading-relaxed">Both sides confirm the score (or the organizer does). Disputed results freeze until resolved.</p>
        </Card>
        <Card className="p-5">
          <p className="font-display font-bold text-[14px] flex items-center gap-2"><Icon name="trend" size={15} className="text-gold" /> Your trajectory</p>
          <div className="mt-2"><Spark values={RATING_TREND} width={220} height={42} stroke="#f2c14e" /></div>
        </Card>
      </div>
    </div>
  );
}

/* ================= ACHIEVEMENTS ================= */
export function AchievementsView() {
  const stats: Record<string, number> = { games: 34, tournaments: 2, titles: 1, reliability: 96, invites: 1, founding: 1, streakDays: 4, perfect: 1 };
  const unlocked = (m: string, t: number) => (stats[m] ?? 0) >= t;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Achievements</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Earned from verified activity only. No purchaseable badges, no vanity inflation.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked(a.metric, a.threshold);
          const prog = Math.min(100, Math.round(((stats[a.metric] ?? 0) / a.threshold) * 100));
          return (
            <Card key={a.id} className={`p-5 relative overflow-hidden ${got ? "border-gold/25" : "opacity-80"}`}>
              {got && <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gold/8 blur-2xl" />}
              <div className="flex items-center gap-4">
                <span className={`w-12 h-12 rounded-xl grid place-items-center border ${got ? "bg-gold/12 border-gold/30 text-gold" : "bg-chalk/5 border-chalk/12 text-chalk/30"}`}>
                  <Icon name={a.id === "champ" ? "trophy" : a.id === "reliable" ? "shield" : a.id === "builder" ? "users" : a.id === "streak" ? "flame" : a.id === "founding" ? "star" : a.id === "perfect" ? "check" : "ball"} size={22} />
                </span>
                <div>
                  <p className="font-display font-extrabold tracking-tight">{a.title}</p>
                  <p className="text-[12px] text-chalk/50 mt-0.5">{a.desc}</p>
                </div>
              </div>
              <div className="mt-4">
                {got ? (
                  <Chip tone="gold"><Icon name="check" size={11} /> Unlocked</Chip>
                ) : (
                  <div>
                    <div className="h-1.5 rounded-full bg-chalk/8"><div className="h-full rounded-full bg-chalk/35" style={{ width: `${prog}%` }} /></div>
                    <p className="mt-1.5 font-mono text-[10.5px] text-chalk/40">{prog}% · {stats[a.metric] ?? 0}/{a.threshold}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ================= MESSAGES ================= */
const CANNED = [
  "Sounds good — see you on court!",
  "Can we push it 15 min? Court changeover runs long.",
  "I'll bring demo paddles for everyone.",
  "Great game last time. Rematch?",
];
export function MessagesView() {
  const [threads, setThreads] = useState(MESSAGES_SEED);
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const t = threads[active];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [threads, active]);

  const send = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    setThreads((ts) => ts.map((th, i) => (i === active ? { ...th, replies: [...th.replies, { me: true, text }] } : th)));
    setTimeout(() => {
      setThreads((ts) => ts.map((th, i) => (i === active ? { ...th, replies: [...th.replies, { me: false, text: CANNED[Math.floor(Math.random() * CANNED.length)] }] } : th)));
    }, 1300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Messages</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Club announcements, event chat and direct messages — rate-limited and abuse-reportable on every thread.</p>
      </div>
      <div className="grid md:grid-cols-[300px_1fr] gap-5 items-start">
        <Card className="overflow-hidden">
          {threads.map((th, i) => (
            <button key={th.id} onClick={() => { setActive(i); setThreads((ts) => ts.map((x, j) => (j === i ? { ...x, unread: 0 } : x))); }} className={`w-full text-left px-4 py-3.5 border-b border-chalk/6 flex items-center gap-3 transition ${i === active ? "bg-lime/8" : "hover:bg-chalk/4"}`}>
              <Avatar name={th.from} hue={th.hue} size={38} />
              <span className="min-w-0 flex-1">
                <span className="flex justify-between items-baseline">
                  <span className="font-display font-bold text-[13px] tracking-tight truncate">{th.from}</span>
                  <span className="font-mono text-[10px] text-chalk/35 shrink-0 ml-2">{th.time}</span>
                </span>
                <span className="block text-[12px] text-chalk/50 truncate mt-0.5">{th.preview}</span>
              </span>
              {th.unread > 0 && <span className="font-mono text-[10px] font-bold bg-lime text-court-950 rounded-full px-1.5 py-0.5">{th.unread}</span>}
            </button>
          ))}
        </Card>

        <Card className="flex flex-col h-[520px]">
          <div className="px-5 py-3.5 border-b border-chalk/8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={t.from} hue={t.hue} size={34} />
              <div>
                <p className="font-display font-bold text-[14px] tracking-tight">{t.from}</p>
                <p className="text-[11px] text-lime flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-lime" /> online</p>
              </div>
            </div>
            <button className="text-chalk/40 hover:text-blood transition flex items-center gap-1.5 text-[12px] font-semibold"><Icon name="flag" size={14} /> Report</button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {t.replies.map((r, i) => (
              <div key={i} className={`flex ${r.me ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${r.me ? "bg-lime text-court-950 rounded-br-md" : "bg-court-900 border border-chalk/10 rounded-bl-md"}`}>{r.text}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="px-4 py-3.5 border-t border-chalk/8 flex gap-2.5">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Write a message…" className="flex-1 rounded-xl bg-court-900 border border-chalk/12 px-4 py-2.5 text-sm focus:outline-none focus:border-lime/60" />
            <Button icon="arrow" onClick={send}>Send</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= NOTIFICATIONS ================= */
export function NotificationsView({ notifs, setNotifs }: { notifs: Notif[]; setNotifs: Dispatch<SetStateAction<Notif[]>> }) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = notifs.filter((n) => (filter === "all" ? true : n.unread));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black tracking-tight text-3xl">Notifications</h1>
          <p className="mt-1.5 text-chalk/55 text-[14px]">Email + browser + optional push. You control every channel per event type.</p>
        </div>
        <div className="flex gap-2.5">
          <Tabs active={filter} onChange={(f) => setFilter(f as "all" | "unread")} tabs={[{ id: "all", label: "All" }, { id: "unread", label: `Unread (${notifs.filter((n) => n.unread).length})` }]} />
          <Button variant="dark" size="sm" onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })))}>Mark all read</Button>
        </div>
      </div>
      {list.length === 0 ? (
        <Card><EmptyState icon="bell" title="All caught up" body="Waitlist openings, reminders and result confirmations will land here." /></Card>
      ) : (
        <div className="space-y-3">
          {list.map((n) => (
            <button key={n.id} onClick={() => setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))} className={`w-full text-left rounded-2xl border p-5 flex gap-4 transition hover:-translate-y-0.5 ${n.unread ? "border-lime/25 bg-lime/5" : "border-chalk/10 bg-court-850/70"}`}>
              <span className={`shrink-0 w-10 h-10 rounded-xl grid place-items-center ${n.kind === "waitlist" ? "bg-gold/12 text-gold" : n.kind === "match" ? "bg-teal/12 text-teal" : n.kind === "verify" ? "bg-lime/12 text-lime" : "bg-chalk/8 text-chalk/60"}`}>
                <Icon name={n.icon as never} size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display font-bold tracking-tight text-[14.5px]">{n.title}</p>
                  <span className="font-mono text-[10.5px] text-chalk/35 shrink-0">{n.time}</span>
                </div>
                <p className="text-[13px] text-chalk/55 mt-1 leading-relaxed">{n.body}</p>
              </div>
              {n.unread && <span className="shrink-0 w-2 h-2 rounded-full bg-lime mt-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= PROFILE ================= */
export function ProfileView({ user }: { user: SessionUser }) {
  const toast = useToast();
  const [days, setDays] = useState<string[]>(VIEWER.days);
  const [window_, setWindow_] = useState(VIEWER.window);
  const winRate = Math.round((VIEWER.wins / (VIEWER.wins + VIEWER.losses)) * 100);

  return (
    <div className="space-y-6">
      <h1 className="font-display font-black tracking-tight text-3xl">Player profile</h1>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-7 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} hue={user.avatarHue} size={84} verified />
            <h2 className="mt-4 font-display font-black tracking-tight text-2xl">{user.name}</h2>
            <p className="text-[13px] text-chalk/50 mt-0.5">{VIEWER.city} · joined Mar 2025</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <VerifyBadge state={user.verified} />
              {user.photoVerified && <Chip tone="teal"><Icon name="camera" size={11} /> Profile Verified</Chip>}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 w-full">
              {[["Rating", VIEWER.rating], ["Games", VIEWER.wins + VIEWER.losses], ["Win rate", `${winRate}%`]].map(([l, v]) => (
                <div key={l as string} className="rounded-xl border border-chalk/10 bg-court-900/70 py-3">
                  <p className="font-mono font-bold text-lg leading-none">{v}</p>
                  <p className="text-[9.5px] uppercase tracking-widest text-chalk/40 mt-1.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <p className="font-mono text-[10.5px] tracking-widest text-chalk/40">TRUST NETWORK</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {VIEWER.trust.map((t) => (
                <span key={t} className="flex items-center gap-2 rounded-lg bg-lime/6 border border-lime/20 px-3 py-2 text-[12px] font-semibold text-lime">
                  <Icon name="check" size={12} strokeWidth={2.4} /> {t}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] text-chalk/40 leading-relaxed">Built from completed games, attendance and organizer feedback — not an opaque score. <button className="text-teal hover:underline" onClick={() => toast({ icon: "flag", tone: "teal", title: "Dispute filed", body: "A moderator will review your trust profile within 48h." })}>Dispute a decision</button></p>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <p className="font-mono text-[11px] tracking-widest text-chalk/45">PLAYING PROFILE</p>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-[13.5px]">
              {([["Level", VIEWER.level], ["Preferred position", VIEWER.position], ["Play style", VIEWER.style], ["Dominant hand", VIEWER.hand], ["Formats", VIEWER.formats.join(" · ")], ["Years playing", "3"], ["Favourite paddle", "16mm control"], ["Favourite shot", "Backhand roll"], ["Preferred surface", "Cushioned acrylic"], ["Clubs", "Downtown PC"], ["Reliability", `${VIEWER.reliability}%`], ["Sportsmanship", `${VIEWER.sportsmanship}`]] as [string, string][]).map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10.5px] uppercase tracking-widest text-chalk/35">{l}</p>
                  <p className="font-semibold mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-widest text-chalk/45">AVAILABILITY — feeds the Fair Match Engine</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = days.includes(d);
                return (
                  <button key={d} onClick={() => setDays((p) => (on ? p.filter((x) => x !== d) : [...p, d]))} className={`px-4 py-2 rounded-xl border font-display font-bold text-[13px] transition ${on ? "border-lime/60 bg-lime/12 text-lime" : "border-chalk/15 text-chalk/50 hover:border-chalk/35"}`}>{d}</button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Mornings", "Afternoons", "Evenings"].map((w) => (
                <button key={w} onClick={() => setWindow_(w)} className={`px-4 py-2 rounded-xl border text-[13px] font-semibold transition ${window_ === w ? "border-teal/60 bg-teal/12 text-teal" : "border-chalk/15 text-chalk/50 hover:border-chalk/35"}`}>{w}</button>
              ))}
            </div>
            <Button size="sm" className="mt-5" icon="check" onClick={() => toast({ icon: "check", title: "Availability saved", body: "Matchmaking already re-weighted your windows." })}>Save availability</Button>
          </Card>

          <Card className="p-6">
            <p className="font-mono text-[11px] tracking-widest text-chalk/45 flex items-center gap-2"><Icon name="lock" size={13} /> PRIVACY — NEVER SHOWN PUBLICLY</p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {["ID number", "Document images", "Date of birth", "Home address", "Verification metadata", "Phone number"].map((s) => (
                <Chip key={s} tone="dim"><Icon name="lock" size={11} /> {s}</Chip>
              ))}
            </div>
            <p className="mt-4 text-[12.5px] text-chalk/45 leading-relaxed">Only your verification result, provider reference and timestamp are retained. Raw documents auto-purge after the retention window. Signed {user.email} · sessions revocable anytime.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
