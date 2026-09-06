import { useEffect, useRef, useState } from "react";
import { ACTIVITY_FEED, IMG_MATCH_TOP, PLAYERS } from "../lib/data";
import { DNA_LABELS } from "../lib/engine";
import { Button, Chip, CountUp, Icon, Logo, Radar, Reveal, SectionHead } from "../components/ui";
import type { IconName } from "../components/ui";

/* scramble-decode hook */
function useScramble(text: string, active: boolean) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOut(text); return; }
    const chars = "▓▒░<>/\\|=+*";
    let frame = 0;
    const iv = setInterval(() => {
      frame++;
      const reveal = Math.floor(frame / 2.4);
      setOut(
        text.split("").map((c, i) => (c === " " ? " " : i < reveal ? c : chars[Math.floor(Math.random() * chars.length)])).join("")
      );
      if (reveal >= text.length) clearInterval(iv);
    }, 34);
    return () => clearInterval(iv);
  }, [text, active]);
  return out;
}

/* ------- the live court (top-down SVG) ------- */
function LiveCourt() {
  const [score, setScore] = useState<[number, number]>([7, 6]);
  const [serving, setServing] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const iv = setInterval(() => {
      setScore(([a, b]) => {
        const side = Math.random() > 0.48 ? 0 : 1;
        const next: [number, number] = side === 0 ? [a + 1, b] : [a, b + 1];
        if (next[side] >= 11 && next[side] - next[1 - side] >= 2) return [side === 0 ? 11 : 0, side === 0 ? 0 : 11];
        return next;
      });
      setServing((s) => (Math.random() > 0.6 ? 1 - s : s));
    }, 2600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative">
      {/* score bug */}
      <div className="absolute -top-4 left-4 z-10 flex items-center gap-3 rounded-xl border border-chalk/12 bg-court-900/95 px-4 py-2.5 shadow-lift">
        <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-blood">
          <span className="w-1.5 h-1.5 rounded-full bg-blood pulse-dot" /> LIVE
        </span>
        <span className="font-mono font-bold text-xl text-lime score-tick" key={`a${score[0]}`}>{score[0]}</span>
        <span className="text-chalk/30 font-mono">–</span>
        <span className="font-mono font-bold text-xl text-chalk score-tick" key={`b${score[1]}`}>{score[1]}</span>
        <span className="text-[10px] font-mono text-chalk/40">GAME 3 · COURT 2</span>
      </div>

      <svg viewBox="0 0 460 300" className="w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
        {/* surrounds */}
        <rect x="0" y="0" width="460" height="300" rx="18" fill="#0c1b14" />
        <rect x="0" y="0" width="460" height="300" rx="18" fill="url(#surround)" />
        <defs>
          <radialGradient id="surround" cx="50%" cy="40%">
            <stop offset="0%" stopColor="rgba(200,241,63,0.08)" />
            <stop offset="70%" stopColor="rgba(200,241,63,0)" />
          </radialGradient>
        </defs>
        {/* court */}
        <rect x="50" y="34" width="360" height="232" rx="6" fill="#1c3a2c" />
        <rect x="50" y="34" width="360" height="116" rx="6" fill="#21422f" />
        {/* lines */}
        <g stroke="#c8f13f" strokeWidth="2.5" fill="none" opacity="0.9">
          <rect x="50" y="34" width="360" height="232" rx="4" />
          <line x1="230" y1="34" x2="230" y2="266" />
          <line x1="50" y1="150" x2="410" y2="150" strokeWidth="3.5" />
          <line x1="122" y1="34" x2="122" y2="266" />
          <line x1="338" y1="34" x2="338" y2="266" />
          <line x1="122" y1="92" x2="338" y2="92" />
          <line x1="122" y1="208" x2="338" y2="208" />
        </g>
        {/* NVZ hatching */}
        <g stroke="rgba(200,241,63,0.16)" strokeWidth="1">
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={126 + i * 15} y1="92" x2={118 + i * 15} y2="208" />
          ))}
        </g>
        {/* players */}
        {[
          [100, 95], [100, 205], [360, 95], [360, 205],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill={i < 2 ? "#c8f13f" : "#3ecfad"} opacity="0.9" className="anim-breathe" style={{ animationDelay: `${i * 0.6}s` }} />
            <circle cx={x} cy={y} r="19" fill="none" stroke={i < 2 ? "#c8f13f" : "#3ecfad"} opacity="0.35" />
            <text x={x} y={y + 32} textAnchor="middle" fontSize="9" fontFamily="Space Mono" fill="rgba(241,245,232,0.55)">
              {["MAYA", "JUNE", "MARCUS", "PRIYA"][i]}
            </text>
          </g>
        ))}
        {/* serve indicator */}
        <circle cx={serving === 0 ? 78 : 382} cy="150" r="4" fill="#f2c14e" className="pulse-dot" />
        {/* the ball */}
        <g className="anim-rally" style={{ transformOrigin: "84px 146px" }}>
          <circle cx="84" cy="146" r="7.5" fill="#f2f14e" stroke="#0c1b14" strokeWidth="1.5" />
          <circle cx="81.5" cy="144" r="1.1" fill="#0c1b14" />
          <circle cx="86.5" cy="143.5" r="1.1" fill="#0c1b14" />
          <circle cx="84" cy="148.5" r="1.1" fill="#0c1b14" />
        </g>
      </svg>

      {/* floating chips */}
      <div className="absolute -left-3 sm:-left-8 bottom-16 anim-breathe">
        <div className="rounded-xl border border-lime/25 bg-court-900/95 px-3.5 py-2.5 shadow-lift">
          <p className="font-mono text-[10px] text-chalk/45">FAIR MATCH ENGINE</p>
          <p className="font-display font-extrabold text-lime text-sm">Competitive balance 87%</p>
        </div>
      </div>
      <div className="absolute -right-2 sm:-right-6 top-24 anim-breathe" style={{ animationDelay: "1.2s" }}>
        <div className="rounded-xl border border-teal/25 bg-court-900/95 px-3.5 py-2.5 shadow-lift">
          <p className="font-mono text-[10px] text-chalk/45">GAME GAP FINDER</p>
          <p className="font-display font-extrabold text-teal text-sm">1 player needed · 19:00</p>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const items = [...ACTIVITY_FEED, ...ACTIVITY_FEED];
  return (
    <div className="border-y border-chalk/8 bg-court-900/60 overflow-hidden py-3">
      <div className="anim-marquee flex gap-10 whitespace-nowrap w-max">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-2.5 text-[12.5px] text-chalk/55 font-mono">
            <Icon name="ball" size={13} className="text-lime/70" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

const QUESTIONS: { q: string; a: string; icon: IconName }[] = [
  { q: "Where should I play?", a: "Verified clubs ranked by real fit — distance, your level, your schedule, your format.", icon: "pin" },
  { q: "Who should I play with?", a: "The Fair Match Engine balances rating, form, style DNA and reliability — not just numbers.", icon: "target" },
  { q: "When should I play?", a: "Game Gap Finder scans open court slots tonight and finds the missing fourth.", icon: "clock" },
  { q: "How can my club get better?", a: "Health Score, court-utilization intel and retention signals — with concrete next moves.", icon: "trend" },
];

export default function Landing({ onStart }: { onStart: (role: "player" | "club") => void }) {
  const kicker = useScramble("THE PICKLEBALL OPERATING SYSTEM", true);
  const [dnaDemo] = useState(() =>
    DNA_LABELS.slice(0, 8).map((d) => ({ label: d.label.split(" ")[0], value: PLAYERS[0].dna[d.key] }))
  );

  return (
    <div className="min-h-screen bg-court-950 text-chalk overflow-x-clip">
      {/* ================= header ================= */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-chalk/8 bg-court-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-semibold text-chalk/65">
            <a href="#questions" className="hover:text-lime transition">The Platform</a>
            <a href="#features" className="hover:text-lime transition">Features</a>
            <a href="#how" className="hover:text-lime transition">How it works</a>
            <a href="#trust" className="hover:text-lime transition">Trust & Safety</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => onStart("player")}>Sign in</Button>
            <Button size="sm" onClick={() => onStart("player")}>Get started</Button>
          </div>
        </div>
      </header>

      {/* ================= opening: the court ================= */}
      <section className="relative noise topo-glow pt-28 lg:pt-36 pb-16">
        <div className="absolute inset-0 court-grid [mask-image:radial-gradient(80%_70%_at_50%_30%,black,transparent)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-lime mb-6 min-h-[16px]">{kicker}</p>
            <h1 className="font-display font-black tracking-[-0.03em] leading-[0.95] text-[clamp(2.7rem,6.4vw,5.2rem)]">
              <span className="line-mask"><span style={{ animationDelay: "0.1s" }}>FIND YOUR GAME.</span></span>
              <span className="line-mask"><span style={{ animationDelay: "0.25s" }}>FIND YOUR CLUB.</span></span>
              <span className="line-mask"><span className="text-lime" style={{ animationDelay: "0.4s" }}>PLAY BETTER.</span></span>
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-chalk/65 max-w-xl">
              RallyPoint connects <em className="not-italic text-chalk">verified players</em> with <em className="not-italic text-chalk">verified clubs</em> through intelligent matchmaking, live scheduling, rankings and club-management intelligence — one system for the whole pickleball community.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button size="lg" icon="search" onClick={() => onStart("player")}>Find a Club</Button>
              <Button size="lg" variant="outline" icon="court" onClick={() => onStart("club")}>Create a Club</Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <div className="font-mono font-bold text-2xl text-lime"><CountUp to={12847} /></div>
                <div className="text-[10.5px] uppercase tracking-widest text-chalk/40 mt-1">Verified players</div>
              </div>
              <div>
                <div className="font-mono font-bold text-2xl text-teal"><CountUp to={316} /></div>
                <div className="text-[10.5px] uppercase tracking-widest text-chalk/40 mt-1">Active clubs</div>
              </div>
              <div>
                <div className="font-mono font-bold text-2xl text-gold"><CountUp to={48210} /></div>
                <div className="text-[10.5px] uppercase tracking-widest text-chalk/40 mt-1">Matches recorded</div>
              </div>
            </div>
          </div>
          <Reveal delay={150}>
            <LiveCourt />
          </Reveal>
        </div>
      </section>

      <Ticker />

      {/* ================= four questions ================= */}
      <section id="questions" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal><SectionHead kicker="Why RallyPoint exists" title={<>Every player asks four questions.<br />We answer all of them.</>} /></Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUESTIONS.map((q, i) => (
              <Reveal key={q.q} delay={i * 90}>
                <div className="group h-full rounded-2xl border border-chalk/10 bg-court-850/70 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-lime/35">
                  <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-lime/10 text-lime border border-lime/20 group-hover:bg-lime group-hover:text-court-950 transition-colors duration-300">
                    <Icon name={q.icon} size={20} />
                  </span>
                  <p className="mt-5 font-display font-extrabold tracking-tight text-lg leading-snug">{q.q}</p>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-chalk/55">{q.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= features bento ================= */}
      <section id="features" className="py-24 relative noise">
        <div className="absolute inset-0 court-grid opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
        <div className="relative max-w-7xl mx-auto px-5">
          <Reveal><SectionHead kicker="Platform capabilities" title={<>Not a club directory.<br />An <span className="text-lime">intelligent match system.</span></>} sub="Eight systems working together — from identity verification to court-utilization intelligence — each one explained, none of them magic." /></Reveal>

          <div className="mt-14 grid lg:grid-cols-12 gap-4">
            {/* smart matchmaking — big */}
            <Reveal className="lg:col-span-7">
              <div className="h-full rounded-2xl border border-chalk/10 bg-court-850/80 p-7 relative overflow-hidden group">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-lime/6 blur-3xl group-hover:bg-lime/10 transition" />
                <div className="flex items-start justify-between">
                  <div>
                    <Chip tone="lime">Smart Matchmaking</Chip>
                    <h3 className="mt-4 font-display font-black tracking-tight text-2xl">Fair Match Engine</h3>
                    <p className="mt-2 text-[14px] text-chalk/55 max-w-md leading-relaxed">
                      Rating parity is just the entry ticket. The engine weighs current form, fatigue, play-style DNA, doubles compatibility and attendance reliability to predict whether a game will actually be <span className="text-chalk">competitive and fun</span>.
                    </p>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3 max-w-lg">
                  {[["Rating gap", "34 pts", 82], ["Current form", "Aligned", 91], ["Style tempo", "Compatible", 76], ["Reliability", "96% / 94%", 95]].map(([l, v, w], i) => (
                    <div key={i} className="rounded-xl border border-chalk/10 bg-court-900/80 p-3.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10.5px] uppercase tracking-widest text-chalk/40">{l}</span>
                        <span className="font-mono text-[12px] text-lime">{v}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-chalk/8 overflow-hidden">
                        <div className="h-full rounded-full bg-lime transition-all duration-700" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 font-mono text-[13px] text-chalk/70">
                  → Competitive Balance: <span className="text-lime font-bold">87%</span> · recommended pairing sent to both players
                </p>
              </div>
            </Reveal>

            {/* play style DNA */}
            <Reveal className="lg:col-span-5" delay={100}>
              <div className="h-full rounded-2xl border border-chalk/10 bg-court-850/80 p-7">
                <Chip tone="teal">Unique · Play Style DNA</Chip>
                <h3 className="mt-4 font-display font-black tracking-tight text-2xl">Your game, decoded.</h3>
                <p className="mt-2 text-[14px] text-chalk/55 leading-relaxed">An 8-dimension behaviour profile computed from real match stats — aggression, placement, patience, net play — that evolves with every verified result.</p>
                <div className="mt-4 flex justify-center">
                  <Radar data={dnaDemo} size={250} stroke="#3ecfad" fill="rgba(62,207,173,0.13)" />
                </div>
              </div>
            </Reveal>

            {/* club health */}
            <Reveal className="lg:col-span-4">
              <div className="h-full rounded-2xl border border-chalk/10 bg-court-850/80 p-7">
                <Chip tone="gold">Unique · Club Health</Chip>
                <h3 className="mt-4 font-display font-extrabold tracking-tight text-xl">Community Health Score</h3>
                <p className="mt-2 text-[13.5px] text-chalk/55 leading-relaxed">Attendance, retention, fill-rate, sportsmanship — one honest number plus the actions that move it.</p>
                <div className="mt-4 flex items-center gap-5">
                  <div className="font-mono font-bold text-5xl text-gold">87</div>
                  <div className="text-[11px] leading-relaxed text-chalk/50">
                    /100 this month<br /><span className="text-teal">▲ 4 vs. last month</span><br />“Add a Tuesday beginner event”
                  </div>
                </div>
              </div>
            </Reveal>

            {/* game gap finder */}
            <Reveal className="lg:col-span-4" delay={80}>
              <div className="h-full rounded-2xl border border-chalk/10 bg-court-850/80 p-7 relative overflow-hidden">
                <Chip tone="clay">Unique · Game Gap Finder</Chip>
                <h3 className="mt-4 font-display font-extrabold tracking-tight text-xl">“1 player needed.”</h3>
                <p className="mt-2 text-[13.5px] text-chalk/55 leading-relaxed">Three players booked Court 4 at 19:00. The finder matches a compatible verified fourth — court utilization goes up, everyone plays.</p>
                <div className="mt-5 rounded-xl border border-chalk/10 bg-court-900/80 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex -space-x-2">
                      {[160, 84, 200].map((h, i) => (
                        <span key={i} className="w-8 h-8 rounded-full border-2 border-court-900 grid place-items-center text-[10px] font-bold" style={{ background: `hsl(${h} 45% 26%)`, color: `hsl(${h} 80% 70%)` }}>P{i + 1}</span>
                      ))}
                    </span>
                    <span className="w-8 h-8 rounded-full border-2 border-dashed border-clay/60 grid place-items-center text-clay"><Icon name="plus" size={13} /></span>
                  </div>
                  <span className="font-mono text-[11px] text-clay">Court 4 · 19:00</span>
                </div>
              </div>
            </Reveal>

            {/* verification */}
            <Reveal className="lg:col-span-4" delay={160}>
              <div className="h-full rounded-2xl border border-chalk/10 bg-court-850/80 p-7">
                <Chip tone="lime">Verified Communities</Chip>
                <h3 className="mt-4 font-display font-extrabold tracking-tight text-xl">Real people. Real clubs.</h3>
                <p className="mt-2 text-[13.5px] text-chalk/55 leading-relaxed">Document authenticity, face-match, liveness and name matching — powered by a KYC provider, never a plain photo upload.</p>
                <div className="mt-5 space-y-2">
                  {["Identity Verified", "Profile Verified", "Location Verified"].map((t) => (
                    <div key={t} className="flex items-center gap-2.5 rounded-lg bg-court-900/80 border border-chalk/8 px-3.5 py-2.5">
                      <span className="text-lime"><Icon name="shieldCheck" size={16} /></span>
                      <span className="text-[13px] font-semibold">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* events, rankings, management strip */}
            {[
              { icon: "calendar" as IconName, tone: "teal" as const, title: "Events & Smart Waitlists", body: "Open play, ladders, tournaments — with waitlist auto-fill and expiry timers when slots open." },
              { icon: "trophy" as IconName, tone: "gold" as const, title: "Rankings & Progress", body: "Club, local, global and per-format ladders with transparent Elo math. Achievements that mean something." },
              { icon: "chart" as IconName, tone: "clay" as const, title: "Club Management OS", body: "Members, roles, courts, analytics, retention alerts and weather-aware scheduling for organizers." },
            ].map((f, i) => (
              <Reveal key={f.title} className="lg:col-span-4" delay={i * 80}>
                <div className="h-full rounded-2xl border border-chalk/10 bg-court-850/80 p-7">
                  <span className={`inline-grid place-items-center w-10 h-10 rounded-xl border ${f.tone === "teal" ? "text-teal border-teal/25 bg-teal/10" : f.tone === "gold" ? "text-gold border-gold/25 bg-gold/10" : "text-clay border-clay/25 bg-clay/10"}`}>
                    <Icon name={f.icon} size={19} />
                  </span>
                  <h3 className="mt-4 font-display font-extrabold tracking-tight text-lg">{f.title}</h3>
                  <p className="mt-2 text-[13.5px] text-chalk/55 leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= how it works ================= */}
      <section id="how" className="py-24 bg-chalk text-ink relative noise">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-[0.9fr_1.4fr] gap-16">
          <div className="lg:sticky lg:top-28 self-start">
            <SectionHead light kicker="Two doors in" title={<>One for players.<br />One for builders.</>} sub="Both paths require identity verification — that's the price of a community where “verified” actually means something." />
            <div className="mt-8 flex flex-col gap-3">
              <Button variant="dark" icon="paddle" className="bg-ink! text-chalk! justify-start" onClick={() => onStart("player")}>Start as a player</Button>
              <Button variant="dark" icon="court" className="bg-ink! text-chalk! justify-start" onClick={() => onStart("club")}>Start as a club creator</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-0">
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] text-lime-3 mb-6">PLAYER PATH</p>
              {[
                ["Create your account", "Email, phone, strong password, bot-check."],
                ["Verify identity", "Document + selfie via our KYC provider."],
                ["Build your profile", "Level, style, availability, Play Style DNA."],
                ["Find your club", "Explained match scores, not black boxes."],
                ["Join & play", "Events, ladders, open play, gap-finder games."],
                ["Grow your game", "Results, ratings, achievements, trust profile."],
              ].map(([t, b], i) => (
                <div key={t} className="flex gap-4 pb-7 relative">
                  {i < 5 && <span className="absolute left-[15px] top-9 bottom-0 w-px bg-ink/12" />}
                  <span className="shrink-0 w-8 h-8 rounded-full bg-ink text-lime grid place-items-center font-mono text-[12px] font-bold">{i + 1}</span>
                  <div>
                    <p className="font-display font-extrabold tracking-tight">{t}</p>
                    <p className="text-[13.5px] text-ink/60 mt-1 leading-relaxed">{b}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] text-lime-3 mb-6">CLUB CREATOR PATH</p>
              {[
                ["Create your account", "Same verified onboarding as players."],
                ["Verify identity", "Organizers carry the highest trust bar."],
                ["Create your club", "Guided wizard: identity → location → courts."],
                ["Configure courts", "Surfaces, lighting, hours, utilization grid."],
                ["Build community", "Approve members, assign roles, post events."],
                ["Run it intelligently", "Health score, retention alerts, smart recs."],
              ].map(([t, b], i) => (
                <div key={t} className="flex gap-4 pb-7 relative">
                  {i < 5 && <span className="absolute left-[15px] top-9 bottom-0 w-px bg-ink/12" />}
                  <span className="shrink-0 w-8 h-8 rounded-full border-2 border-ink text-ink grid place-items-center font-mono text-[12px] font-bold">{i + 1}</span>
                  <div>
                    <p className="font-display font-extrabold tracking-tight">{t}</p>
                    <p className="text-[13.5px] text-ink/60 mt-1 leading-relaxed">{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= trust & safety ================= */}
      <section id="trust" className="py-24 relative noise">
        <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_20%_20%,rgba(62,207,173,0.08),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-5">
          <Reveal><SectionHead kicker="Trust & Safety" title={<>Verification is a pipeline,<br />not a photo upload.</>} sub="We never treat an uploaded image as proof of identity. Automated checks run first; anything uncertain goes to a human reviewer — and sensitive documents are purged on a strict retention policy." /></Reveal>

          <div className="mt-14 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
            <Reveal>
              <div className="rounded-2xl border border-chalk/10 bg-court-850/80 p-7">
                <p className="font-mono text-[11px] tracking-widest text-chalk/40 mb-6">VERIFICATION PIPELINE</p>
                <div className="space-y-0">
                  {[
                    ["Document capture", "MIME, size & tamper checks on upload", "check"],
                    ["Authenticity + OCR", "Provider-side document classification & extraction", "check"],
                    ["Selfie + liveness", "Face-match against the document portrait", "check"],
                    ["Name matching", "Fuzzy token match vs. configured policy threshold", "check"],
                    ["Fraud-risk scoring", "Weighted signals → LOW / MEDIUM / REVIEW / HIGH", "check"],
                    ["Human review (if needed)", "Uncertain cases route to reviewers, never auto-punished", "eye"],
                  ].map(([t, b, ic], i, arr) => (
                    <div key={t} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`w-8 h-8 shrink-0 rounded-full grid place-items-center border ${ic === "eye" ? "border-gold/40 text-gold bg-gold/10" : "border-lime/35 text-lime bg-lime/10"}`}>
                          <Icon name={ic as IconName} size={15} />
                        </span>
                        {i < arr.length - 1 && <span className="w-px flex-1 bg-chalk/12 my-1" />}
                      </div>
                      <div className="pb-6">
                        <p className="font-display font-bold tracking-tight text-[15px]">{t}</p>
                        <p className="text-[13px] text-chalk/50 mt-0.5">{b}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="space-y-4">
              {[
                { icon: "lock" as IconName, title: "Privacy by design", body: "We store the verification result, provider reference and timestamp — not your raw documents. IDs purge automatically after the retention window. Nothing identity-sensitive is ever shown publicly." },
                { icon: "shield" as IconName, title: "Anti-fraud, without accusation", body: "Risk signals are weighted and routed. LOW and MEDIUM never block a real player; REVIEW REQUIRED goes to a human. Every action is logged to an audit trail." },
                { icon: "flag" as IconName, title: "Community moderation", body: "Report harassment, spam or fake profiles. Warn → restrict → suspend escalation, dispute workflow included, moderator decisions always reviewable." },
                { icon: "eye" as IconName, title: "Your data, your rules", body: "Granular privacy controls, session revocation, suspicious-login alerts and MFA-ready authentication from day one." },
              ].map((c, i) => (
                <Reveal key={c.title} delay={i * 80}>
                  <div className="rounded-2xl border border-chalk/10 bg-court-850/80 p-6 flex gap-4 hover:border-teal/30 transition-colors">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-teal/10 border border-teal/25 text-teal grid place-items-center">
                      <Icon name={c.icon} size={18} />
                    </span>
                    <div>
                      <p className="font-display font-extrabold tracking-tight">{c.title}</p>
                      <p className="text-[13px] text-chalk/55 mt-1.5 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= final CTA ================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG_MATCH_TOP} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-court-950 via-court-950/70 to-court-950" />
        </div>
        <div className="relative max-w-4xl mx-auto px-5 text-center">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.3em] text-lime mb-5">SERVE IT UP</p>
            <h2 className="font-display font-black tracking-[-0.02em] text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">
              The courts are waiting.<br /><span className="text-lime">Your people are out there.</span>
            </h2>
            <div className="mt-9 flex flex-wrap justify-center gap-3.5">
              <Button size="lg" icon="paddle" onClick={() => onStart("player")}>I want to play</Button>
              <Button size="lg" variant="outline" icon="court" onClick={() => onStart("club")}>I want to build a club</Button>
            </div>
            <p className="mt-6 text-[12.5px] text-chalk/40 font-mono">Free for players · Verified onboarding in ~4 minutes · No card required</p>
          </Reveal>
        </div>
      </section>

      {/* ================= footer ================= */}
      <footer className="border-t border-chalk/8 py-12">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <p className="font-mono text-[11px] text-chalk/35 text-center">The operating system for pickleball communities · verified people, verified clubs, intelligent play.</p>
          <div className="flex gap-5 text-[12.5px] text-chalk/45">
            <a href="#trust" className="hover:text-lime transition">Privacy</a>
            <a href="#trust" className="hover:text-lime transition">Safety</a>
            <a href="#how" className="hover:text-lime transition">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
