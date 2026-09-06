import { useState } from "react";
import { DAYS } from "../lib/data";
import { Button, Card, Chip, Field, Icon, inputCls, useToast, VerifyBadge } from "../components/ui";
import type { IconName } from "../components/ui";
import type { SessionUser } from "./Onboarding";

const STEPS = ["Club identity", "Location", "Courts", "Rules", "Verification", "Review"];

export interface CreatedClub {
  name: string;
  desc: string;
  hue: number;
  cover: string;
  address: string;
  city: string;
  region: string;
  country: string;
  pin: [number, number];
  courts: number;
  indoor: boolean;
  outdoor: boolean;
  surface: string;
  lit: boolean;
  open: string;
  close: string;
  days: string[];
  membership: string;
  levels: string[];
  guests: string;
  conduct: boolean;
  cancellation: string;
}

const COVERS = [
  "https://image.qwenlm.ai/generated-images/9d96a787-7ffa-42b2-9dd0-f9a53ce528b2/_result.png",
  "https://image.qwenlm.ai/generated-images/1e8c1de1-85cc-42de-96c1-e8ddc9a2e353/_result.png",
  "https://image.qwenlm.ai/generated-images/f5da48b7-30e0-48b2-8e63-265d59179db1/_result.png",
];

export default function ClubWizard({ user, onDone, onBack }: { user: SessionUser; onDone: (clubName: string) => void; onBack: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [c, setC] = useState<CreatedClub>({
    name: "", desc: "", hue: 84, cover: COVERS[0],
    address: "", city: "", region: "", country: "United States", pin: [210, 150],
    courts: 4, indoor: true, outdoor: false, surface: "Cushioned acrylic", lit: true,
    open: "07:00", close: "22:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    membership: "approval", levels: ["Beginner", "Intermediate"], guests: "members-only",
    conduct: false, cancellation: "6h",
  });
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof CreatedClub>(k: K, v: CreatedClub[K]) => setC((p) => ({ ...p, [k]: v }));

  const stepValid = [
    c.name.trim().length >= 3 && c.desc.trim().length >= 20,
    c.address.trim().length >= 4 && c.city.trim().length >= 2 && c.region.trim().length >= 2,
    c.courts >= 1 && (c.indoor || c.outdoor) && c.days.length > 0,
    c.levels.length > 0 && c.conduct,
    user.verified === "VERIFIED" || user.verified === "NEEDS_REVIEW",
    true,
  ][step];

  const publish = () => {
    toast({ icon: "court", title: "Club published!", body: `${c.name} is live in discovery. Club verification review typically completes within 24h.` });
    onDone(c.name);
  };

  return (
    <div className="min-h-screen bg-court-950 text-chalk noise relative">
      <div className="absolute inset-0 court-grid [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)]" />
      <header className="relative z-10 max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <p className="font-display font-extrabold tracking-tight text-lg">Create your club</p>
        <div className="flex items-center gap-3">
          <VerifyBadge state={user.verified} />
          <Button variant="ghost" size="sm" icon="logout" onClick={onBack}>Exit</Button>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-5 pb-24">
        {/* step rail */}
        <div className="flex items-center gap-1.5 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span className={`w-8 h-8 rounded-full grid place-items-center font-mono text-[11px] font-bold border transition-colors ${i < step ? "bg-lime text-court-950 border-lime" : i === step ? "border-lime text-lime" : "border-chalk/15 text-chalk/35"}`}>
                  {i < step ? <Icon name="check" size={13} strokeWidth={2.4} /> : i + 1}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${i === step ? "text-lime" : "text-chalk/35"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <span className={`h-px flex-1 mb-5 ${i < step ? "bg-lime/50" : "bg-chalk/10"}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1 — identity */}
        {step === 0 && (
          <div className="anim-fadeUp space-y-6">
            <div>
              <h1 className="font-display font-black tracking-tight text-3xl">Give your club a face</h1>
              <p className="mt-2 text-chalk/55 text-[14px]">Name, story and visuals — this is what players see first in discovery.</p>
            </div>
            <Field label="Club name" error={touched && c.name.trim().length < 3 ? "At least 3 characters" : undefined}>
              <input className={inputCls} value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Riverside Rally Club" />
            </Field>
            <Field label="Description" hint={`${c.desc.length}/240`} error={touched && c.desc.trim().length < 20 ? "Give players at least a sentence (20+ chars)" : undefined}>
              <textarea className={`${inputCls} min-h-[110px] resize-y`} maxLength={240} value={c.desc} onChange={(e) => set("desc", e.target.value)} placeholder="What makes your club special? Community, surfaces, coaching, vibe…" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[12.5px] font-semibold text-chalk/75 mb-2">Brand colour</p>
                <div className="flex gap-2.5 flex-wrap">
                  {[84, 160, 200, 260, 20, 320, 40].map((h) => (
                    <button key={h} onClick={() => set("hue", h)} className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${c.hue === h ? "border-chalk scale-110" : "border-transparent"}`} style={{ background: `hsl(${h} 60% 40%)` }} aria-label={`hue ${h}`} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-chalk/10 bg-court-900/70 p-3.5">
                  <span className="w-11 h-11 rounded-xl grid place-items-center font-display font-black text-lg" style={{ background: `hsl(${c.hue} 55% 30%)`, color: `hsl(${c.hue} 90% 75%)` }}>
                    {(c.name || "RC").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <p className="text-[12px] text-chalk/50">Live logo preview — auto-generated from initials & colour. Upload a custom mark any time.</p>
                </div>
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-chalk/75 mb-2">Cover photo</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {COVERS.map((url) => (
                    <button key={url} onClick={() => set("cover", url)} className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition ${c.cover === url ? "border-lime" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <img src={url} alt="Cover option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — location */}
        {step === 1 && (
          <div className="anim-fadeUp space-y-6">
            <div>
              <h1 className="font-display font-black tracking-tight text-3xl">Where do you play?</h1>
              <p className="mt-2 text-chalk/55 text-[14px]">Location powers discovery radius and the map. Address details stay private until club verification passes.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Street address" error={touched && c.address.trim().length < 4 ? "Required" : undefined}>
                <input className={inputCls} value={c.address} onChange={(e) => set("address", e.target.value)} placeholder="88 Kitchen Line Ave" />
              </Field>
              <Field label="City" error={touched && c.city.trim().length < 2 ? "Required" : undefined}>
                <input className={inputCls} value={c.city} onChange={(e) => set("city", e.target.value)} placeholder="Riverside District" />
              </Field>
              <Field label="Region / state" error={touched && c.region.trim().length < 2 ? "Required" : undefined}>
                <input className={inputCls} value={c.region} onChange={(e) => set("region", e.target.value)} placeholder="CA" />
              </Field>
              <Field label="Country">
                <select className={inputCls} value={c.country} onChange={(e) => set("country", e.target.value)}>
                  {["United States", "Canada", "United Kingdom", "Germany", "Spain", "Australia", "India", "Japan", "Other"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-chalk/75 mb-2">Pin your exact location <span className="text-chalk/40 font-normal">(click the map)</span></p>
              <div className="rounded-2xl overflow-hidden border border-chalk/10">
                <svg viewBox="0 0 420 220" className="w-full bg-court-900 cursor-crosshair" onClick={(e) => {
                  const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                  set("pin", [((e.clientX - r.left) / r.width) * 420, ((e.clientY - r.top) / r.height) * 220]);
                }}>
                  <g stroke="rgba(241,245,232,0.07)" strokeWidth="6" strokeLinecap="round">
                    <path d="M0 150 C 120 130, 260 180, 420 140" fill="none" />
                    <path d="M80 0 C 110 90, 60 150, 110 220" fill="none" />
                    <path d="M0 60 C 160 40, 300 90, 420 50" fill="none" />
                  </g>
                  <path d="M330 0 C 360 60, 380 120, 420 160 L 420 0 Z" fill="rgba(62,207,173,0.08)" />
                  <g>
                    <circle cx={c.pin[0]} cy={c.pin[1]} r="14" fill="rgba(200,241,63,0.15)" />
                    <circle cx={c.pin[0]} cy={c.pin[1]} r="6" fill="#c8f13f" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — courts */}
        {step === 2 && (
          <div className="anim-fadeUp space-y-6">
            <div>
              <h1 className="font-display font-black tracking-tight text-3xl">Configure your courts</h1>
              <p className="mt-2 text-chalk/55 text-[14px]">This feeds court-utilization intelligence and game-gap finding from day one.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="p-5">
                <p className="text-[12.5px] font-semibold text-chalk/75">Number of courts</p>
                <div className="mt-3 flex items-center gap-4">
                  <button onClick={() => set("courts", Math.max(1, c.courts - 1))} className="w-10 h-10 rounded-xl border border-chalk/15 grid place-items-center hover:border-lime/50 transition"><Icon name="minus" size={16} /></button>
                  <span className="font-mono font-bold text-3xl text-lime w-10 text-center">{c.courts}</span>
                  <button onClick={() => set("courts", Math.min(20, c.courts + 1))} className="w-10 h-10 rounded-xl border border-chalk/15 grid place-items-center hover:border-lime/50 transition"><Icon name="plus" size={16} /></button>
                </div>
              </Card>
              <Card className="p-5">
                <p className="text-[12.5px] font-semibold text-chalk/75">Facility type</p>
                <div className="mt-3 flex gap-2.5">
                  <button onClick={() => set("indoor", !c.indoor)} className={`flex-1 rounded-xl border px-3 py-3 text-[13px] font-bold transition ${c.indoor ? "border-lime/60 bg-lime/10 text-lime" : "border-chalk/15 text-chalk/50"}`}>Indoor</button>
                  <button onClick={() => set("outdoor", !c.outdoor)} className={`flex-1 rounded-xl border px-3 py-3 text-[13px] font-bold transition ${c.outdoor ? "border-lime/60 bg-lime/10 text-lime" : "border-chalk/15 text-chalk/50"}`}>Outdoor</button>
                </div>
                {!c.indoor && !c.outdoor && <p className="mt-2 text-[11.5px] text-blood">Pick at least one.</p>}
              </Card>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Court surface">
                <select className={inputCls} value={c.surface} onChange={(e) => set("surface", e.target.value)}>
                  {["Cushioned acrylic", "Post-tension concrete", "Sport tile", "Asphalt seal-coat"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Opens">
                <select className={inputCls} value={c.open} onChange={(e) => set("open", e.target.value)}>
                  {["06:00", "07:00", "08:00", "09:00", "10:00"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Closes">
                <select className={inputCls} value={c.close} onChange={(e) => set("close", e.target.value)}>
                  {["20:00", "21:00", "22:00", "23:00"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-chalk/10 bg-court-900/70 px-4 py-3.5">
              <p className="text-[13px] font-semibold flex items-center gap-2"><Icon name="sun" size={16} className="text-gold" /> Floodlighting for evening play</p>
              <button onClick={() => set("lit", !c.lit)} className={`w-12 h-7 rounded-full border transition-colors relative ${c.lit ? "bg-lime/80 border-lime" : "bg-court-800 border-chalk/20"}`}>
                <span className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-court-950 transition-all ${c.lit ? "left-6" : "left-0.5"}`} style={{ width: 22, height: 22 }} />
              </button>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-chalk/75 mb-2.5">Operating days {touched && c.days.length === 0 && <span className="text-blood">— pick at least one</span>}</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const on = c.days.includes(d);
                  return <button key={d} onClick={() => set("days", on ? c.days.filter((x) => x !== d) : [...c.days, d])} className={`px-4 py-2 rounded-xl border font-display font-bold text-[13px] transition ${on ? "border-lime/60 bg-lime/12 text-lime" : "border-chalk/15 text-chalk/50 hover:border-chalk/35"}`}>{d}</button>;
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — rules */}
        {step === 3 && (
          <div className="anim-fadeUp space-y-6">
            <div>
              <h1 className="font-display font-black tracking-tight text-3xl">Set the rules of the house</h1>
              <p className="mt-2 text-chalk/55 text-[14px]">Clear rules reduce moderation load by ~60%. The platform enforces them automatically where possible.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Card className={`p-5 cursor-pointer transition ${c.membership === "open" ? "border-lime/50!" : ""}`} onClick={() => set("membership", "open")}>
                <p className="font-display font-bold text-[15px] flex items-center gap-2">{c.membership === "open" && <Icon name="check" size={15} className="text-lime" />} Open membership</p>
                <p className="mt-1.5 text-[12.5px] text-chalk/55">Anyone verified joins instantly. Best for growing fast.</p>
              </Card>
              <Card className={`p-5 cursor-pointer transition ${c.membership === "approval" ? "border-lime/50!" : ""}`} onClick={() => set("membership", "approval")}>
                <p className="font-display font-bold text-[15px] flex items-center gap-2">{c.membership === "approval" && <Icon name="check" size={15} className="text-lime" />} Approval required</p>
                <p className="mt-1.5 text-[12.5px] text-chalk/55">Admins review each request. Verified players get fast-track.</p>
              </Card>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-chalk/75 mb-2.5">Skill levels you cater to {touched && c.levels.length === 0 && <span className="text-blood">— pick at least one</span>}</p>
              <div className="flex flex-wrap gap-2">
                {["Beginner", "Beginner+", "Intermediate", "Intermediate+", "Advanced", "Pro"].map((l) => {
                  const on = c.levels.includes(l);
                  return <button key={l} onClick={() => set("levels", on ? c.levels.filter((x) => x !== l) : [...c.levels, l])} className={`px-4 py-2 rounded-xl border text-[13px] font-semibold transition ${on ? "border-teal/60 bg-teal/12 text-teal" : "border-chalk/15 text-chalk/50 hover:border-chalk/35"}`}>{l}</button>;
                })}
              </div>
            </div>
            <Field label="Guest policy">
              <select className={inputCls} value={c.guests} onChange={(e) => set("guests", e.target.value)}>
                <option value="members-only">Members only</option>
                <option value="guest-fee">Guests welcome with day fee</option>
                <option value="open-guests">Open guests (sign waiver)</option>
              </select>
            </Field>
            <Field label="Cancellation policy (events)">
              <select className={inputCls} value={c.cancellation} onChange={(e) => set("cancellation", e.target.value)}>
                <option value="6h">Free cancellation until 6h before</option>
                <option value="24h">Free cancellation until 24h before</option>
                <option value="none">No penalty — reliability score tracks no-shows</option>
              </select>
            </Field>
            <label className={`flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition ${c.conduct ? "border-lime/40 bg-lime/6" : touched ? "border-blood/40" : "border-chalk/12"}`}>
              <input type="checkbox" checked={c.conduct} onChange={(e) => set("conduct", e.target.checked)} className="mt-0.5 accent-[#c8f13f]" />
              <span className="text-[13px] text-chalk/70 leading-relaxed">We adopt the <span className="font-bold text-chalk">RallyPoint Community Code of Conduct</span> — sportsmanship standards, anti-harassment rules and the warn → restrict → suspend escalation ladder.</span>
            </label>
          </div>
        )}

        {/* STEP 5 — verification */}
        {step === 4 && (
          <div className="anim-fadeUp space-y-6 max-w-2xl">
            <div>
              <h1 className="font-display font-black tracking-tight text-3xl">Organizer verification</h1>
              <p className="mt-2 text-chalk/55 text-[14px]">Club creators carry the platform's highest trust bar — you'll approve members, run payments-ready events and hold moderation tools.</p>
            </div>
            <Card className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <span className={`w-12 h-12 rounded-xl grid place-items-center ${user.verified === "VERIFIED" ? "bg-lime/12 text-lime border border-lime/25" : "bg-gold/12 text-gold border border-gold/25"}`}>
                    <Icon name={user.verified === "VERIFIED" ? "shieldCheck" : "clock"} size={24} />
                  </span>
                  <div>
                    <p className="font-display font-extrabold tracking-tight">{user.verified === "VERIFIED" ? "Your identity is verified" : "Verification in manual review"}</p>
                    <p className="text-[13px] text-chalk/55 mt-0.5">{user.name} · {user.email}</p>
                  </div>
                </div>
                <VerifyBadge state={user.verified} size="md" />
              </div>
              <div className="mt-5 space-y-2.5">
                {[
                  { ok: true, t: "Personal verification — creator identity confirmed" },
                  { ok: false, t: "Club verification — information reviewed by our team (~24h)" },
                  { ok: false, t: "Location verification — courts confirmed (on-site or photo evidence)" },
                ].map((v) => (
                  <div key={v.t} className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${v.ok ? "border-lime/25 bg-lime/6" : "border-chalk/10 bg-court-900/60"}`}>
                    <Icon name={v.ok ? "check" : "clock"} size={15} className={v.ok ? "text-lime" : "text-gold"} />
                    <span className="text-[13.5px] font-semibold">{v.t}</span>
                    {v.ok ? <Chip tone="lime" className="ml-auto">Done</Chip> : <Chip tone="gold" className="ml-auto">Queued</Chip>}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[12px] text-chalk/40 leading-relaxed">You can publish immediately — the “Verified Club” badge appears only after club review actually passes. We never grant it upfront.</p>
            </Card>
          </div>
        )}

        {/* STEP 6 — review */}
        {step === 5 && (
          <div className="anim-fadeUp space-y-6">
            <div>
              <h1 className="font-display font-black tracking-tight text-3xl">One last look</h1>
              <p className="mt-2 text-chalk/55 text-[14px]">This is your public club card exactly as players will see it.</p>
            </div>
            <Card className="overflow-hidden max-w-2xl">
              <div className="relative h-44">
                <img src={c.cover} alt="Club cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-court-950/90 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-3.5">
                  <span className="w-13 h-13 rounded-xl grid place-items-center font-display font-black text-xl border-2 border-court-950" style={{ width: 52, height: 52, background: `hsl(${c.hue} 55% 30%)`, color: `hsl(${c.hue} 90% 75%)` }}>
                    {(c.name || "RC").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div>
                    <p className="font-display font-black tracking-tight text-xl">{c.name}</p>
                    <p className="text-[12px] text-chalk/60 font-mono">{c.city}, {c.country} · {c.indoor ? "Indoor" : ""}{c.indoor && c.outdoor ? "+" : ""}{c.outdoor ? "Outdoor" : ""} · {c.courts} courts</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[14px] text-chalk/70 leading-relaxed">{c.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Chip>{c.surface}</Chip>
                  {c.lit && <Chip tone="gold"><Icon name="sun" size={11} /> Lit courts</Chip>}
                  <Chip tone="teal">{c.levels.join(" · ")}</Chip>
                  <Chip>{c.days.join(" ")} · {c.open}–{c.close}</Chip>
                  <Chip tone={c.membership === "approval" ? "gold" : "lime"}>{c.membership === "approval" ? "Approval required" : "Open membership"}</Chip>
                </div>
                <div className="mt-5 grid sm:grid-cols-3 gap-3 text-[12.5px]">
                  <p className="rounded-lg bg-court-900/70 border border-chalk/8 px-3.5 py-2.5"><span className="text-chalk/40 block text-[10px] uppercase tracking-widest mb-0.5">Guests</span>{c.guests.replace(/-/g, " ")}</p>
                  <p className="rounded-lg bg-court-900/70 border border-chalk/8 px-3.5 py-2.5"><span className="text-chalk/40 block text-[10px] uppercase tracking-widest mb-0.5">Cancellation</span>Free until {c.cancellation} before</p>
                  <p className="rounded-lg bg-court-900/70 border border-chalk/8 px-3.5 py-2.5"><span className="text-chalk/40 block text-[10px] uppercase tracking-widest mb-0.5">Conduct</span>Code adopted ✓</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* nav */}
        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={() => (step === 0 ? onBack() : setStep(step - 1))}>{step === 0 ? "Cancel" : "Back"}</Button>
          {step < 5 ? (
            <Button size="lg" icon="arrow" onClick={() => { if (!stepValid) { setTouched(true); toast({ icon: "alert", tone: "gold", title: "Almost there", body: "Fill the highlighted fields before continuing." }); return; } setTouched(false); setStep(step + 1); }}>
              Continue
            </Button>
          ) : (
            <Button size="lg" icon="court" onClick={publish}>Publish club</Button>
          )}
        </div>
      </div>
    </div>
  );
}
