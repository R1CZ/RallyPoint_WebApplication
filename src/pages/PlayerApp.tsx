import { useEffect, useMemo, useState } from "react";
import { CLUBS, EVENTS, MATCH_HISTORY, NOTIFICATIONS_SEED, PLAYERS, RATING_TREND, VIEWER, WEEKLY_GAMES } from "../lib/data";
import { clubMatchScore, eloDelta, fairMatch, skillBalance } from "../lib/engine";
import type { ClubInfo } from "../lib/engine";
import { Avatar, Bars, Button, Card, Chip, EmptyState, Field, Icon, Logo, Modal, Spark, VerifyBadge, inputCls, useToast } from "../components/ui";
import type { IconName } from "../components/ui";
import type { SessionUser } from "./Onboarding";
import { DnaView, EventsView, RankingsView, AchievementsView, MessagesView, NotificationsView, ProfileView } from "./PlayerExtras";

export type PlayerView = "home" | "discover" | "playnow" | "dna" | "events" | "rankings" | "badges" | "messages" | "alerts" | "profile";

const NAV: { id: PlayerView; label: string; icon: IconName }[] = [
  { id: "home", label: "Dashboard", icon: "home" },
  { id: "discover", label: "Find a Club", icon: "search" },
  { id: "playnow", label: "Play Now", icon: "zap" },
  { id: "dna", label: "Play Style DNA", icon: "dna" },
  { id: "events", label: "Events", icon: "calendar" },
  { id: "rankings", label: "Rankings", icon: "trophy" },
  { id: "badges", label: "Achievements", icon: "star" },
  { id: "messages", label: "Messages", icon: "chat" },
  { id: "alerts", label: "Notifications", icon: "bell" },
  { id: "profile", label: "Profile", icon: "users" },
];

/* ---------------- stylized discovery map ---------------- */
function DiscoveryMap({ clubs, selected, onSelect }: { clubs: ClubInfo[]; selected: string; onSelect: (id: string) => void }) {
  const pos = (c: ClubInfo): [number, number] => {
    const angle = (c.hue / 360) * Math.PI * 2 + c.km * 0.35;
    const r = 18 + c.km * 13;
    return [210 + Math.cos(angle) * r * 1.15, 150 + Math.sin(angle) * r * 0.82];
  };
  return (
    <svg viewBox="0 0 420 300" className="w-full rounded-2xl border border-chalk/10 bg-court-900">
      {/* roads */}
      <g stroke="rgba(241,245,232,0.07)" strokeWidth="7" strokeLinecap="round">
        <path d="M0 210 C 120 190, 260 240, 420 200" fill="none" />
        <path d="M60 0 C 90 120, 40 200, 90 300" fill="none" />
        <path d="M0 80 C 160 60, 300 110, 420 70" fill="none" />
        <path d="M300 0 C 280 110, 340 200, 310 300" fill="none" />
      </g>
      <g stroke="rgba(241,245,232,0.045)" strokeWidth="2.5">
        <path d="M0 150 H420M140 0 V300M210 0 V300M0 260 H420" />
      </g>
      {/* river */}
      <path d="M330 0 C 360 80, 380 160, 420 220 L 420 0 Z" fill="rgba(62,207,173,0.08)" />
      {/* you */}
      <g>
        <circle cx="210" cy="150" r="26" fill="rgba(200,241,63,0.08)" />
        <circle cx="210" cy="150" r="14" fill="none" stroke="rgba(200,241,63,0.35)" strokeDasharray="3 4" />
        <circle cx="210" cy="150" r="6.5" fill="#c8f13f" />
        <text x="210" y="176" textAnchor="middle" fontSize="9.5" fontFamily="Space Mono" fill="#c8f13f">YOU</text>
      </g>
      {clubs.map((c) => {
        const [x, y] = pos(c);
        const sel = selected === c.id;
        return (
          <g key={c.id} onClick={() => onSelect(c.id)} className="cursor-pointer">
            <circle cx={x} cy={y} r={sel ? 16 : 11} fill={sel ? "#c8f13f" : "rgba(20,42,32,0.95)"} stroke={sel ? "#c8f13f" : "rgba(200,241,63,0.5)"} strokeWidth="1.5" style={{ transition: "all .25s" }} />
            <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontFamily="Space Mono" fontWeight="bold" fill={sel ? "#0c1b14" : "#c8f13f"}>{c.km.toFixed(0)}</text>
            {sel && <text x={x} y={y - 20} textAnchor="middle" fontSize="9.5" fontFamily="Archivo" fontWeight="bold" fill="#f1f5e8">{c.name.split(" ").slice(0, 2).join(" ")}</text>}
          </g>
        );
      })}
      <text x="14" y="288" fontSize="9" fontFamily="Space Mono" fill="rgba(241,245,232,0.35)">demo map · distances in km</text>
    </svg>
  );
}

/* ---------------- dashboard ---------------- */
function Dashboard({ go, registered, joined, user }: { go: (v: PlayerView) => void; registered: string[]; joined: string[]; user: SessionUser }) {
  const toast = useToast();
  const matches = useMemo(() => fairMatch(VIEWER, PLAYERS).slice(0, 3), []);
  const nextEvents = EVENTS.filter((e) => e.filled < e.capacity || registered.includes(e.id)).slice(0, 3);
  const winRate = Math.round((VIEWER.wins / (VIEWER.wins + VIEWER.losses)) * 100);
  const gaps = [
    { id: "g1", club: "Downtown Pickleball Club", court: "Court 4", time: "Today · 19:00 – 20:00", players: 3, level: "Intermediate", compat: 91 },
    { id: "g2", club: "The Kitchen Society", court: "Court 1", time: "Today · 20:30 – 21:30", players: 1, level: "Intermediate+", compat: 84 },
  ];
  const [claimed, setClaimed] = useState<string[]>([]);
  const [recordOpen, setRecordOpen] = useState(false);
  const [recOpp, setRecOpp] = useState("p1");
  const [recMy, setRecMy] = useState(11);
  const [recTheir, setRecTheir] = useState(7);
  const recOpponent = PLAYERS.find((p) => p.id === recOpp)!;
  const recDelta = eloDelta(VIEWER.rating, recOpponent.rating, recMy > recTheir);

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-lime uppercase">Tuesday · 18:42</p>
          <h1 className="mt-2 font-display font-black tracking-tight text-3xl sm:text-4xl">Good evening, <span className="text-lime">{user.name.split(" ")[0]}.</span></h1>
          <p className="mt-1.5 text-chalk/55 text-[14px]">3 compatible games within 6 km tonight · your ladder match is in 2 days.</p>
        </div>
        <Button size="lg" icon="zap" onClick={() => go("playnow")}>Find me a game</Button>
      </div>

      {/* stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Rating</p>
              <p className="font-mono font-bold text-2xl mt-1 text-lime">{VIEWER.rating}</p>
              <p className="text-[11px] text-teal font-mono mt-0.5">▲ +14 this week</p>
            </div>
            <Spark values={RATING_TREND} width={90} height={44} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Games played</p>
          <p className="font-mono font-bold text-2xl mt-1">{VIEWER.wins + VIEWER.losses}</p>
          <div className="mt-2"><Bars values={WEEKLY_GAMES} height={34} /></div>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Win rate</p>
          <p className="font-mono font-bold text-2xl mt-1">{winRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-chalk/8"><div className="h-full rounded-full bg-teal" style={{ width: `${winRate}%` }} /></div>
          <p className="text-[11px] text-chalk/45 mt-1.5 font-mono">{VIEWER.wins}W – {VIEWER.losses}L</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Play streak</p>
          <p className="font-mono font-bold text-2xl mt-1 text-gold">{VIEWER.streak} days</p>
          <p className="text-[11px] text-chalk/45 mt-1">Longest: 9 · reliability {VIEWER.reliability}%</p>
          <div className="mt-2 flex gap-1">
            {[1, 1, 1, 1, 0, 0, 0].map((d, i) => <span key={i} className={`h-2 flex-1 rounded-full ${d ? "bg-gold" : "bg-chalk/10"}`} />)}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* next game */}
        <Card className="p-6 lg:col-span-1 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-lime/6 blur-2xl" />
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-lime"><Icon name="calendar" size={14} /> YOUR NEXT GAME</p>
          <p className="mt-3 font-display font-extrabold tracking-tight text-2xl leading-tight">Thursday Night<br />Doubles Ladder</p>
          <div className="mt-4 space-y-2 text-[13.5px] text-chalk/65">
            <p className="flex items-center gap-2.5"><Icon name="clock" size={15} className="text-chalk/40" /> Thu 12 Jun · 19:00 – 21:00</p>
            <p className="flex items-center gap-2.5"><Icon name="pin" size={15} className="text-chalk/40" /> Downtown Pickleball Club · Court 3</p>
            <p className="flex items-center gap-2.5"><Icon name="users" size={15} className="text-chalk/40" /> Partner: Maya Chen · Round 4 of 7</p>
          </div>
          <div className="mt-5 rounded-xl border border-chalk/10 bg-court-900/70 px-4 py-3 flex items-center justify-between">
            <span className="text-[12px] text-chalk/50">Competitive balance</span>
            <span className="font-mono font-bold text-lime">87%</span>
          </div>
          <div className="mt-4 flex gap-2.5">
            <Button size="sm" variant="dark" className="flex-1" onClick={() => toast({ icon: "check", title: "Attendance confirmed", body: "Organizer has been notified you'll be there." })}>I'll be there</Button>
            <Button size="sm" variant="ghost" onClick={() => toast({ icon: "alert", tone: "gold", title: "Cancellation noted", body: "Waitlist auto-fill will offer your slot to the next eligible player." })}>Can't make it</Button>
          </div>
        </Card>

        {/* recommended players */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-teal"><Icon name="target" size={14} /> RECOMMENDED FOR YOU</p>
            <button onClick={() => go("playnow")} className="text-[12px] font-semibold text-chalk/50 hover:text-lime transition flex items-center gap-1">All <Icon name="arrow" size={12} /></button>
          </div>
          <div className="mt-4 space-y-3">
            {matches.map((m) => (
              <div key={m.opponent.id} className="flex items-center gap-3 rounded-xl border border-chalk/8 bg-court-900/60 p-3 hover:border-teal/30 transition group">
                <Avatar name={m.opponent.name} hue={m.opponent.avatarHue} size={40} verified={m.opponent.verified} />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-[14px] tracking-tight truncate">{m.opponent.name}</p>
                  <p className="text-[11.5px] text-chalk/45 truncate">{m.reasons[0]}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-teal">{m.compat}%</p>
                  <p className="text-[10px] text-chalk/40 uppercase tracking-wide">match</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] text-chalk/40 leading-relaxed">Balanced for skill, form, schedule & reliability — not just rating.</p>
        </Card>

        {/* game gap finder */}
        <Card className="p-6 lg:col-span-1 relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-clay/8 blur-2xl" />
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-clay"><Icon name="flame" size={14} /> GAME GAP FINDER</p>
          <p className="mt-2 text-[13px] text-chalk/55">Open slots in your community tonight — you're the missing piece.</p>
          <div className="mt-4 space-y-3">
            {gaps.map((g) => (
              <div key={g.id} className="rounded-xl border border-chalk/10 bg-court-900/70 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-[13.5px] tracking-tight">{g.players}/4 players · {g.court}</p>
                  <Chip tone="clay">1 needed</Chip>
                </div>
                <p className="text-[12px] text-chalk/50 mt-1">{g.club} · {g.time}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[11.5px] font-mono text-chalk/55">{g.level} · fit <span className="text-clay font-bold">{g.compat}%</span></span>
                  {claimed.includes(g.id) ? (
                    <Chip tone="lime"><Icon name="check" size={11} /> Slot claimed</Chip>
                  ) : (
                    <Button size="sm" variant="dark" onClick={() => { setClaimed((p) => [...p, g.id]); toast({ icon: "flame", tone: "gold", title: "You're in!", body: `${g.court} at ${g.time.split("· ")[1]} — the group has been notified.` }); }}>Claim slot</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* events + history */}
      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] tracking-widest text-gold flex items-center gap-2"><Icon name="calendar" size={14} /> UPCOMING EVENTS</p>
            <button onClick={() => go("events")} className="text-[12px] font-semibold text-chalk/50 hover:text-lime transition">View all</button>
          </div>
          <div className="mt-4 space-y-3">
            {nextEvents.map((e) => {
              const club = CLUBS.find((c) => c.id === e.clubId)!;
              return (
                <button key={e.id} onClick={() => go("events")} className="w-full text-left flex items-center gap-3.5 rounded-xl border border-chalk/8 bg-court-900/60 p-3 hover:border-gold/30 transition">
                  <span className="shrink-0 w-11 h-11 rounded-lg bg-gold/10 border border-gold/20 text-gold grid place-items-center font-mono font-bold text-[11px] leading-none text-center">{e.day}<br />{e.time.slice(0, 2)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-[13.5px] tracking-tight truncate">{e.title}</span>
                    <span className="block text-[11.5px] text-chalk/45 truncate">{club.name} · {e.filled}/{e.capacity} registered</span>
                  </span>
                  <Icon name="arrow" size={14} className="text-chalk/30" />
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] tracking-widest text-chalk/50 flex items-center gap-2"><Icon name="trend" size={14} /> RECENT RESULTS</p>
            <Button size="sm" variant="dark" icon="plus" onClick={() => setRecordOpen(true)}>Record result</Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-widest text-chalk/35">
                  <th className="pb-2.5 font-semibold">Date</th><th className="pb-2.5 font-semibold">Matchup</th><th className="pb-2.5 font-semibold">Format</th><th className="pb-2.5 font-semibold text-right">Score</th><th className="pb-2.5 font-semibold text-right">Δ Rating</th>
                </tr>
              </thead>
              <tbody>
                {MATCH_HISTORY.slice(0, 5).map((m) => (
                  <tr key={m.id} className="border-t border-chalk/6 hover:bg-chalk/3 transition">
                    <td className="py-2.5 font-mono text-[11.5px] text-chalk/50 whitespace-nowrap">{m.date}</td>
                    <td className="py-2.5"><span className="font-semibold">{m.partners.replace("You + ", "w/ ")}</span> <span className="text-chalk/40">vs {m.opponents}</span></td>
                    <td className="py-2.5 text-chalk/55">{m.format}</td>
                    <td className={`py-2.5 text-right font-mono font-bold ${m.won ? "text-lime" : "text-blood"}`}>{m.score}</td>
                    <td className={`py-2.5 text-right font-mono font-bold ${m.delta > 0 ? "text-teal" : "text-blood"}`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11.5px] text-chalk/40">Results update after both sides confirm — disputes route to the organizer. <span className="font-mono">Elo K=24</span></p>
        </Card>
      </div>

      {/* club activity */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-widest text-lime flex items-center gap-2"><Icon name="court" size={14} /> CLUB ACTIVITY — {joined.length ? CLUBS.find((c) => c.id === joined[0])?.name.toUpperCase() : "DOWNTOWN PICKLEBALL CLUB"}</p>
          <Chip tone="lime"><span className="w-1.5 h-1.5 rounded-full bg-lime pulse-dot" /> 5 new games this week</Chip>
        </div>
        <div className="mt-4 grid sm:grid-cols-4 gap-3.5">
          {[
            { icon: "users" as IconName, v: "168", l: "active this week" },
            { icon: "calendar" as IconName, v: "9", l: "events in 7 days" },
            { icon: "court" as IconName, v: "78%", l: "court utilization" },
            { icon: "heart" as IconName, v: "87", l: "community health" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-chalk/8 bg-court-900/60 p-4 flex items-center gap-3.5">
              <span className="text-lime"><Icon name={s.icon} size={20} /></span>
              <div><p className="font-mono font-bold text-xl leading-none">{s.v}</p><p className="text-[10.5px] uppercase tracking-widest text-chalk/40 mt-1">{s.l}</p></div>
            </div>
          ))}
        </div>
      </Card>

      {/* record result */}
      <Modal open={recordOpen} onClose={() => setRecordOpen(false)} title="Record match result">
        <div className="space-y-4">
          <Field label="Opponent (singles) or opposing pair lead">
            <select className={inputCls} value={recOpp} onChange={(e) => setRecOpp(e.target.value)}>
              {PLAYERS.slice(0, 6).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.rating}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Your team score">
              <input className={`${inputCls} font-mono text-lg text-center`} type="number" min={0} max={15} value={recMy} onChange={(e) => setRecMy(Math.max(0, +e.target.value || 0))} />
            </Field>
            <Field label="Their score">
              <input className={`${inputCls} font-mono text-lg text-center`} type="number" min={0} max={15} value={recTheir} onChange={(e) => setRecTheir(Math.max(0, +e.target.value || 0))} />
            </Field>
          </div>
          <div className="rounded-xl border border-chalk/10 bg-court-900/70 px-4 py-3 flex items-center justify-between">
            <span className="text-[12.5px] text-chalk/55">Projected rating change (Elo K=24)</span>
            <span className={`font-mono font-bold ${recDelta >= 0 ? "text-teal" : "text-blood"}`}>{recDelta >= 0 ? `+${recDelta}` : recDelta}</span>
          </div>
          <p className="text-[11.5px] text-chalk/45 leading-relaxed">Both sides must confirm before ratings move. Unconfirmed results expire in 48h; disputes route to the organizer with full audit history.</p>
          <div className="flex justify-end gap-2.5">
            <Button variant="ghost" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button icon="check" disabled={recMy === recTheir} onClick={() => {
              setRecordOpen(false);
              toast({ icon: "trophy", title: "Result submitted", body: `${recMy}–${recTheir} vs ${recOpponent.name} — sent for opponent confirmation. Ratings update once both sides agree.` });
            }}>Submit for confirmation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- discovery ---------------- */
function Discover({ joined, onJoin }: { joined: string[]; onJoin: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [indoor, setIndoor] = useState<string>("any");
  const [maxKm, setMaxKm] = useState(10);
  const [level, setLevel] = useState("any");
  const [sort, setSort] = useState<"match" | "distance" | "activity">("match");
  const [selected, setSelected] = useState("c1");
  const [detail, setDetail] = useState<ClubInfo | null>(null);

  const scored = useMemo(
    () =>
      CLUBS.map((c) => ({ club: c, m: clubMatchScore({ level: VIEWER.level, days: VIEWER.days, window: VIEWER.window, formats: VIEWER.formats, km: VIEWER.km }, c) }))
        .filter(({ club }) => club.km <= maxKm)
        .filter(({ club }) => (indoor === "any" ? true : indoor === "in" ? club.indoor : club.outdoor))
        .filter(({ club }) => (level === "any" ? true : club.levels.includes(level)))
        .filter(({ club }) => (onlyVerified ? club.verified : true))
        .filter(({ club }) => club.name.toLowerCase().includes(q.toLowerCase()) || club.area.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => (sort === "match" ? b.m.score - a.m.score : sort === "distance" ? a.club.km - b.club.km : b.club.activity - a.club.activity)),
    [q, onlyVerified, indoor, maxKm, level, sort]
  );

  const chip = (on: boolean) => `px-3 py-1.5 rounded-full border text-[12px] font-semibold transition ${on ? "border-lime/60 bg-lime/12 text-lime" : "border-chalk/15 text-chalk/55 hover:border-chalk/35"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black tracking-tight text-3xl">Find your club</h1>
          <p className="mt-1.5 text-chalk/55 text-[14px]"><span className="font-mono text-lime font-bold">{scored.length} clubs within {maxKm} km</span> · ranked by explained compatibility, not just distance.</p>
        </div>
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/35" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clubs or areas…" className="rounded-xl bg-court-900 border border-chalk/12 pl-10 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:border-lime/60" />
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button className={chip(onlyVerified)} onClick={() => setOnlyVerified(!onlyVerified)}><span className="inline-flex items-center gap-1.5"><Icon name="shieldCheck" size={13} /> Verified only</span></button>
        {["any", "in", "out"].map((v) => (
          <button key={v} className={chip(indoor === v)} onClick={() => setIndoor(v)}>{v === "any" ? "Indoor + Outdoor" : v === "in" ? "Indoor" : "Outdoor"}</button>
        ))}
        {["any", "Beginner", "Intermediate", "Advanced"].map((v) => (
          <button key={v} className={chip(level === v)} onClick={() => setLevel(v)}>{v === "any" ? "All levels" : v}</button>
        ))}
        <label className="flex items-center gap-2.5 ml-auto text-[12px] text-chalk/55 font-mono">
          ≤ {maxKm} km
          <input type="range" min={2} max={12} value={maxKm} onChange={(e) => setMaxKm(+e.target.value)} className="accent-[#c8f13f] w-28" />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg bg-court-900 border border-chalk/12 px-3 py-1.5 text-[12px] font-semibold focus:outline-none">
          <option value="match">Sort: Best match</option>
          <option value="distance">Sort: Nearest</option>
          <option value="activity">Sort: Most active</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-6 items-start">
        <div className="lg:sticky lg:top-24 space-y-4">
          <DiscoveryMap clubs={scored.map((s) => s.club)} selected={selected} onSelect={(id) => { setSelected(id); setDetail(scored.find((s) => s.club.id === id)?.club ?? null); }} />
          {detail && (
            <Card className="p-5 anim-fadeUp">
              <div className="flex items-center justify-between">
                <p className="font-display font-extrabold tracking-tight">{detail.name}</p>
                <Chip tone="lime">{detail.km} km</Chip>
              </div>
              <p className="mt-1.5 text-[13px] text-chalk/55">{detail.blurb}</p>
              <Button size="sm" className="mt-4" onClick={() => { onJoin(detail.id); setDetail(null); }} disabled={joined.includes(detail.id)}>
                {joined.includes(detail.id) ? "Already a member" : "Request membership"}
              </Button>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {scored.length === 0 && (
            <Card><EmptyState icon="search" title="No clubs match those filters" body="Widen the distance or clear a filter — new clubs join RallyPoint every week." action={<Button variant="dark" size="sm" onClick={() => { setMaxKm(12); setIndoor("any"); setLevel("any"); setOnlyVerified(false); }}>Reset filters</Button>} /></Card>
          )}
          {scored.map(({ club: c, m }, i) => (
            <Card key={c.id} hover className="overflow-hidden" onClick={() => { setSelected(c.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <div className="grid sm:grid-cols-[220px_1fr]">
                <div className="relative h-40 sm:h-full overflow-hidden">
                  <img src={c.cover} alt={c.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-court-950/80 to-transparent" />
                  <span className="absolute bottom-3 left-3 font-mono text-[11px] text-chalk/85 bg-court-950/70 rounded-md px-2 py-0.5">{c.km} km · {c.area}</span>
                  {i === 0 && <span className="absolute top-3 left-3"><Chip tone="lime" className="text-[10px]!">BEST MATCH</Chip></span>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-extrabold tracking-tight text-lg leading-tight">{c.name}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {c.verified && <VerifyBadge />}
                        {c.locationVerified && <Chip tone="teal"><Icon name="pin" size={11} /> Location</Chip>}
                        {c.official && <Chip tone="gold"><Icon name="star" size={11} /> Official</Chip>}
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="relative w-14 h-14">
                        <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(241,245,232,0.08)" strokeWidth="5" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke={m.score >= 85 ? "#c8f13f" : m.score >= 65 ? "#3ecfad" : "#f2c14e"} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(m.score / 100) * 150.8} 150.8`} />
                        </svg>
                        <span className="absolute inset-0 grid place-items-center font-mono font-bold text-[13px]">{m.score}%</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-chalk/40">match</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.reasons.slice(0, 3).map((r) => <Chip key={r.text} className="text-[10.5px]! font-medium!">{r.text}</Chip>)}
                  </div>
                  <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-chalk/50 font-mono">
                    <span>{c.indoor ? "Indoor" : ""}{c.indoor && c.outdoor ? " + " : ""}{c.outdoor ? "Outdoor" : ""} · {c.courts} courts</span>
                    <span>{c.members} members</span>
                    <span>{c.window}</span>
                    <span className="text-lime">{c.fee}</span>
                  </div>
                  <div className="mt-4 flex gap-2.5">
                    <Button size="sm" disabled={joined.includes(c.id)} onClick={(e) => { e.stopPropagation(); onJoin(c.id); }}>
                      {joined.includes(c.id) ? "Joined ✓" : "Join club"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(c.id); setDetail(c); }}>View on map</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- play now ---------------- */
function PlayNow() {
  const toast = useToast();
  const [phase, setPhase] = useState<"idle" | "scan" | "done">("idle");
  const [scanStep, setScanStep] = useState(0);
  const [accepted, setAccepted] = useState<string[]>([]);
  const matches = useMemo(() => fairMatch(VIEWER, PLAYERS), []);

  const scan = () => {
    setPhase("scan");
    setScanStep(0);
    const iv = setInterval(() => {
      setScanStep((s) => {
        if (s >= 5) { clearInterval(iv); setPhase("done"); return s; }
        return s + 1;
      });
    }, 420);
  };

  const scanLabels = ["Reading your availability window…", "Checking nearby clubs & open courts…", "Scanning 214 verified players within 6 km…", "Weighing form, style DNA & reliability…", "Balancing skill spread for doubles…", "Done — 3 compatible games found"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Play Now</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">One button. The engine evaluates time, courts, players and compatibility — then proposes games worth playing.</p>
      </div>

      <Card className="p-8 relative overflow-hidden">
        <div className="absolute inset-0 court-grid opacity-50" />
        <div className="relative flex flex-col sm:flex-row items-center gap-8">
          <button
            onClick={scan}
            disabled={phase === "scan"}
            className="relative shrink-0 w-40 h-40 rounded-full bg-lime text-court-950 grid place-items-center font-display font-black text-lg tracking-tight transition-transform hover:scale-[1.04] active:scale-95 disabled:opacity-80 shadow-[0_0_70px_-12px_rgba(200,241,63,0.7)]"
          >
            {phase === "scan" && <span className="absolute inset-0 rounded-full border-4 border-lime/30 anim-spin-slow border-t-court-950" />}
            <span className="text-center leading-tight">{phase === "scan" ? "SCANNING" : "FIND ME<br/>A GAME"}</span>
          </button>
          <div className="flex-1 w-full">
            {phase === "idle" && (
              <div className="space-y-2 text-[13.5px] text-chalk/55">
                <p className="flex items-center gap-2.5"><Icon name="clock" size={15} className="text-lime" /> Tonight, 18:45 — prime window for {VIEWER.days.join(" / ")} players</p>
                <p className="flex items-center gap-2.5"><Icon name="pin" size={15} className="text-lime" /> 4 clubs with open courts within 6 km</p>
                <p className="flex items-center gap-2.5"><Icon name="users" size={15} className="text-lime" /> 11 verified players free in your skill band (1300–1550)</p>
              </div>
            )}
            {phase === "scan" && (
              <div className="space-y-2.5">
                {scanLabels.slice(0, scanStep + 1).map((s, i) => (
                  <p key={s} className={`flex items-center gap-2.5 text-[13.5px] anim-fadeUp ${i === scanStep ? "text-lime" : "text-chalk/45"}`}>
                    <Icon name={i === scanStep ? "clock" : "check"} size={14} /> {s}
                  </p>
                ))}
              </div>
            )}
            {phase === "done" && (
              <div className="anim-fadeUp">
                <p className="font-display font-extrabold text-xl tracking-tight"><span className="text-lime">3 compatible games</span> available within 6 km.</p>
                <p className="text-[13px] text-chalk/55 mt-1">Ranked by balanced competitiveness — the Fair Match Engine skipped 2 lopsided options on purpose.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {phase === "done" && (
        <div className="grid lg:grid-cols-3 gap-5">
          {matches.slice(0, 3).map((m, i) => {
            const group = [VIEWER.rating, m.opponent.rating, PLAYERS[(i + 3) % PLAYERS.length].rating, PLAYERS[(i + 5) % PLAYERS.length].rating];
            const bal = skillBalance(group);
            return (
              <Card key={m.opponent.id} className="p-6 anim-fadeUp" >
                <div className="flex items-center justify-between">
                  <Chip tone={i === 0 ? "lime" : "dim"}>{i === 0 ? "TOP PICK" : `OPTION ${i + 1}`}</Chip>
                  <span className="font-mono text-[11px] text-chalk/40">in {2 + i * 2} km</span>
                </div>
                <div className="mt-4 flex items-center gap-3.5">
                  <Avatar name={m.opponent.name} hue={m.opponent.avatarHue} size={48} verified />
                  <div>
                    <p className="font-display font-extrabold tracking-tight">{m.opponent.name}</p>
                    <p className="text-[12px] text-chalk/50">{m.opponent.level} · {m.opponent.rating} · {m.opponent.style}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-chalk/10 bg-court-900/70 p-2.5 text-center">
                    <p className="font-mono font-bold text-lg text-teal">{m.compat}%</p>
                    <p className="text-[9.5px] uppercase tracking-widest text-chalk/40">compatibility</p>
                  </div>
                  <div className="rounded-lg border border-chalk/10 bg-court-900/70 p-2.5 text-center">
                    <p className="font-mono font-bold text-lg text-lime">{m.balance}%</p>
                    <p className="text-[9.5px] uppercase tracking-widest text-chalk/40">competitive balance</p>
                  </div>
                </div>
                <div className={`mt-3 rounded-lg px-3 py-2 text-[11.5px] font-semibold ${bal.tone === "good" ? "bg-lime/8 text-lime" : bal.tone === "ok" ? "bg-gold/8 text-gold" : "bg-clay/8 text-clay"}`}>
                  Skill balance: {bal.label} · foursome spread checked
                </div>
                <ul className="mt-3.5 space-y-1.5">
                  {m.reasons.map((r) => (
                    <li key={r} className="text-[12.5px] text-chalk/60 flex items-start gap-2"><Icon name="check" size={12} className="text-lime mt-0.5 shrink-0" /> {r}</li>
                  ))}
                </ul>
                <div className="mt-4 rounded-lg border border-chalk/10 bg-court-900/70 px-3.5 py-2.5 flex items-center justify-between text-[12px]">
                  <span className="font-mono text-chalk/60">Tonight · 19:00 · Court {i + 2}</span>
                  <span className="text-chalk/45">{CLUBS[i].name.split(" ")[0]}</span>
                </div>
                {accepted.includes(m.opponent.id) ? (
                  <div className="mt-4"><Chip tone="lime" className="w-full justify-center py-2!"><Icon name="check" size={13} /> Invite sent — awaiting confirmation</Chip></div>
                ) : (
                  <Button className="mt-4 w-full" onClick={() => { setAccepted((p) => [...p, m.opponent.id]); toast({ icon: "zap", title: "Game proposal sent", body: `${m.opponent.name} has 30 minutes to accept. You'll both get a notification.` }); }}>
                    Propose this game
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {phase !== "done" && (
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-chalk/45">WHY NOT JUST MATCH RATINGS?</p>
          <div className="mt-4 grid sm:grid-cols-3 gap-4 text-[13px] text-chalk/60">
            <p><span className="text-lime font-bold">1500 vs 1500</span> can still be a blowout — one player is fatigued, the other is peaking. Form matters.</p>
            <p>Two baseliners with <span className="text-lime font-bold">zero net play</span> make a dull game. Style DNA compatibility fixes that.</p>
            <p>A <span className="text-lime font-bold">60% no-show rate</span> ruins more games than rating gaps ever will. Reliability is weighted heavily.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- shell ---------------- */
export default function PlayerApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const toast = useToast();
  const [view, setView] = useState<PlayerView>("home");
  const [joined, setJoined] = useState<string[]>(["c1"]);
  const [registered, setRegistered] = useState<string[]>(["e1"]);
  const [notifs, setNotifs] = useState(NOTIFICATIONS_SEED);

  const unread = notifs.filter((n) => n.unread).length;

  const joinClub = (id: string) => {
    if (joined.includes(id)) return;
    setJoined((p) => [...p, id]);
    const c = CLUBS.find((x) => x.id === id)!;
    toast({ icon: "users", title: "Membership requested", body: `${c.name} typically approves within a day. Verified players get fast-track approval.` });
  };

  const go = (v: PlayerView) => { setView(v); window.scrollTo({ top: 0 }); };

  const viewProps = { registered, setRegistered, notifs, setNotifs, joined };

  return (
    <div className="min-h-screen bg-court-950 text-chalk">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-chalk/8 bg-court-900/70 backdrop-blur z-40">
        <div className="h-16 flex items-center px-5 border-b border-chalk/8"><Logo /></div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-display font-bold tracking-tight transition-all ${view === n.id ? "bg-lime/12 text-lime border border-lime/20" : "text-chalk/55 hover:text-chalk hover:bg-chalk/5 border border-transparent"}`}>
              <Icon name={n.icon} size={17} />
              {n.label}
              {n.id === "alerts" && unread > 0 && <span className="ml-auto font-mono text-[10px] bg-lime text-court-950 rounded-full px-1.5 py-0.5 font-bold">{unread}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3.5 border-t border-chalk/8">
          <div className="flex items-center gap-3 rounded-xl bg-court-850 border border-chalk/8 p-3">
            <Avatar name={user.name} hue={user.avatarHue} size={38} verified={user.verified === "VERIFIED"} />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-[13px] tracking-tight truncate">{user.name}</p>
              <p className="text-[10.5px] text-chalk/40">{user.verified === "VERIFIED" ? "Verified player" : "Review pending"}</p>
            </div>
            <button onClick={onLogout} className="text-chalk/40 hover:text-blood transition" title="Sign out"><Icon name="logout" size={16} /></button>
          </div>
          <p className="mt-2.5 text-center font-mono text-[9.5px] tracking-[0.2em] uppercase text-chalk/30">Build by <span className="text-chalk/55">Jonric Manisan</span></p>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 z-40 bg-court-950/90 backdrop-blur border-b border-chalk/8 flex items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-3">
          <button onClick={() => go("alerts")} className="relative text-chalk/60 hover:text-chalk">
            <Icon name="bell" size={19} />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lime" />}
          </button>
          <button onClick={onLogout} className="text-chalk/40"><Icon name="logout" size={18} /></button>
        </div>
      </header>

      {/* content */}
      <main className="lg:pl-60 pt-14 lg:pt-0 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 lg:py-9">
          {view === "home" && <Dashboard go={go} registered={registered} joined={joined} user={user} />}
          {view === "discover" && <Discover joined={joined} onJoin={joinClub} />}
          {view === "playnow" && <PlayNow />}
          {view === "dna" && <DnaView />}
          {view === "events" && <EventsView registered={viewProps.registered} setRegistered={viewProps.setRegistered} />}
          {view === "rankings" && <RankingsView />}
          {view === "badges" && <AchievementsView />}
          {view === "messages" && <MessagesView />}
          {view === "alerts" && <NotificationsView notifs={viewProps.notifs} setNotifs={viewProps.setNotifs} />}
          {view === "profile" && <ProfileView user={user} />}
        </div>
      </main>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-court-900/95 backdrop-blur border-t border-chalk/10 grid grid-cols-5">
        {([["home", "home", "Home"], ["discover", "search", "Discover"], ["playnow", "zap", "Games"], ["events", "calendar", "Events"], ["profile", "users", "Profile"]] as [PlayerView, IconName, string][]).map(([id, ic, l]) => (
          <button key={id} onClick={() => go(id)} className={`py-2.5 flex flex-col items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide transition ${view === id ? "text-lime" : "text-chalk/45"}`}>
            <Icon name={ic} size={19} /> {l}
          </button>
        ))}
      </nav>
    </div>
  );
}
