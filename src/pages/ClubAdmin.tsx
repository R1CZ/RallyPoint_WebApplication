import { useMemo, useState } from "react";
import { AUDIT_LOG, DAYS, EVENTS, HOURS, MEMBERS_SEED, PLAYERS, RISK_QUEUE, playerName, utilizationGrid } from "../lib/data";
import { advanceBracket, clubHealth, generateBracket, riskLevel, shufflePairs, utilizationInsight } from "../lib/engine";
import type { BracketMatch, EventChatMessage, RiskLevel } from "../lib/engine";
import { Avatar, Bars, Button, Card, Chip, Gauge, HeatCell, Icon, Logo, Modal, StatPill, useToast, VerifyBadge, inputCls, Field, Tabs } from "../components/ui";
import type { IconName } from "../components/ui";
import type { SessionUser } from "./Onboarding";

type AdminTab = "overview" | "insights" | "members" | "events" | "security";

const TABS: { id: AdminTab; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "gauge" },
  { id: "insights", label: "Insights", icon: "trend" },
  { id: "members", label: "Members", icon: "users" },
  { id: "events", label: "Events", icon: "calendar" },
  { id: "security", label: "Security", icon: "shield" },
];

const HEALTH = clubHealth({ attendance: 78, retention: 82, eventFill: 86, matchCompletion: 91, sportsmanship: 94, engagement: 74, cancelRate: 8 });

const RISK_TONE: Record<RiskLevel, "lime" | "gold" | "clay" | "blood"> = { LOW: "lime", MEDIUM: "gold", "REVIEW REQUIRED": "clay", HIGH: "blood" };

function Overview({ clubName }: { clubName: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-lime uppercase">Club OS</p>
          <h1 className="mt-2 font-display font-black tracking-tight text-3xl">{clubName}</h1>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <VerifyBadge />
            <Chip tone="teal"><Icon name="pin" size={11} /> Location verified</Chip>
            <Chip tone="gold"><Icon name="clock" size={11} /> Club review: in queue (~24h)</Chip>
          </div>
        </div>
        <Button icon="plus" onClick={() => {}}>New announcement</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatPill icon="users" label="Total members" value="342" />
        <StatPill icon="flame" label="Active this week" value="168" tone="teal" />
        <StatPill icon="calendar" label="Events · 7 days" value="9" tone="gold" />
        <StatPill icon="court" label="Avg utilization" value="78%" tone="clay" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-gold flex items-center gap-2"><Icon name="heart" size={14} /> COMMUNITY HEALTH SCORE</p>
          <div className="mt-4 flex items-center gap-6">
            <Gauge value={HEALTH.score} size={150} label="/100" tone="gold" />
            <div className="flex-1 space-y-2">
              {HEALTH.parts.slice(0, 4).map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-[11px] text-chalk/55 mb-1"><span>{p.label}</span><span className="font-mono">{p.value}</span></div>
                  <div className="h-1 rounded-full bg-chalk/8"><div className="h-full rounded-full bg-gold/70" style={{ width: `${p.value}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-gold/25 bg-gold/6 px-4 py-3">
            <p className="text-[12px] font-bold text-gold flex items-center gap-2"><Icon name="spark" size={13} /> Recommended action</p>
            <p className="text-[12.5px] text-chalk/65 mt-1 leading-relaxed">{HEALTH.recs[0]}</p>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] tracking-widest text-teal flex items-center gap-2"><Icon name="trend" size={14} /> MEMBER GROWTH & MATCH ACTIVITY</p>
            <Chip tone="teal">+38 members · 90d</Chip>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[11.5px] text-chalk/45 mb-2">New members / week</p>
              <Bars values={[4, 6, 5, 8, 7, 9, 11, 10, 8, 12, 9, 14]} labels={["W1", "", "W3", "", "W5", "", "W7", "", "W9", "", "W11", ""]} height={130} tone="teal" />
            </div>
            <div>
              <p className="text-[11.5px] text-chalk/45 mb-2">Recorded matches / week</p>
              <Bars values={[42, 51, 38, 60, 55, 66, 71, 58, 63, 75, 69, 81]} labels={["W1", "", "W3", "", "W5", "", "W7", "", "W9", "", "W11", ""]} height={130} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-court-900/70 border border-chalk/8 py-3"><p className="font-mono font-bold text-lg text-lime">91%</p><p className="text-[10px] uppercase tracking-widest text-chalk/40 mt-1">match completion</p></div>
            <div className="rounded-xl bg-court-900/70 border border-chalk/8 py-3"><p className="font-mono font-bold text-lg text-gold">8%</p><p className="text-[10px] uppercase tracking-widest text-chalk/40 mt-1">cancellation rate</p></div>
            <div className="rounded-xl bg-court-900/70 border border-chalk/8 py-3"><p className="font-mono font-bold text-lg text-teal">82%</p><p className="text-[10px] uppercase tracking-widest text-chalk/40 mt-1">90-day retention</p></div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-chalk/45">UPCOMING EVENTS</p>
          <div className="mt-4 space-y-3">
            {EVENTS.filter((e) => e.clubId === "c1").map((e) => (
              <div key={e.id} className="flex items-center gap-3.5 rounded-xl border border-chalk/8 bg-court-900/60 p-3">
                <span className="shrink-0 w-11 h-11 rounded-lg bg-gold/10 border border-gold/20 text-gold grid place-items-center font-mono font-bold text-[11px] text-center leading-none">{e.day}<br />{e.time.slice(0, 2)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[13.5px] tracking-tight truncate">{e.title}</p>
                  <div className="mt-1 h-1 rounded-full bg-chalk/8"><div className={`h-full rounded-full ${e.filled >= e.capacity ? "bg-blood" : "bg-lime"}`} style={{ width: `${(e.filled / e.capacity) * 100}%` }} /></div>
                </div>
                <span className="font-mono text-[11.5px] text-chalk/50 shrink-0">{e.filled}/{e.capacity}{e.waitlist > 0 && <span className="text-gold"> +{e.waitlist}W</span>}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-chalk/45">ANNOUNCEMENTS</p>
          <div className="mt-4 space-y-3">
            {[
              { t: "Court 2 resurfacing complete", b: "Play resumes tonight. Ladder matches get priority booking until Sunday.", ts: "1h ago", tone: "lime" as const },
              { t: "Tuesday Beginner Night added", b: "Based on utilization intel — 18:00, coach Dana, capped at 12.", ts: "Yesterday", tone: "gold" as const },
              { t: "Summer ladder resets Jun 30", b: "Mid-table players: your seeding carries 60% forward.", ts: "3d ago", tone: "teal" as const },
            ].map((a) => (
              <div key={a.t} className="rounded-xl border border-chalk/8 bg-court-900/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-[13.5px] tracking-tight">{a.t}</p>
                  <span className="font-mono text-[10px] text-chalk/35">{a.ts}</span>
                </div>
                <p className="text-[12.5px] text-chalk/55 mt-1">{a.b}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Insights() {
  const toast = useToast();
  const cells = useMemo(() => utilizationGrid(), []);
  const insight = utilizationInsight(cells);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Court & community intelligence</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Aggregate, privacy-conscious analytics — patterns, never individual surveillance.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-widest text-clay flex items-center gap-2"><Icon name="court" size={14} /> COURT UTILIZATION — THIS WEEK (COURT BLOCK 1)</p>
          <div className="flex items-center gap-4 text-[10.5px] font-mono text-chalk/45">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-clay/40" /> &lt;30%</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gold/50" /> 30–60%</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-lime/70" /> 60%+</span>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid gap-1" style={{ gridTemplateColumns: `70px repeat(${HOURS.length}, 1fr)` }}>
              <span />
              {HOURS.map((h) => <span key={h} className="font-mono text-[10px] text-chalk/40 text-center">{h}</span>)}
              {DAYS.map((d) => (
                <DayRow key={d} day={d} cells={cells.filter((c) => c.day === d)} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-clay/25 bg-clay/6 px-4 py-3.5 flex items-start gap-3">
          <Icon name="spark" size={16} className="text-clay mt-0.5 shrink-0" />
          <p className="text-[13px] text-chalk/70 leading-relaxed"><span className="font-bold text-clay">Court Utilization Intelligence:</span> {insight}</p>
        </div>
        <Button size="sm" variant="dark" icon="plus" className="mt-4" onClick={() => toast({ icon: "calendar", title: "Draft event created", body: "Beginner Open Play — Tue 15:00, Court block 1. Review it in Events." })}>Schedule the suggested session</Button>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-blood flex items-center gap-2"><Icon name="users" size={14} /> RETENTION RADAR</p>
          <div className="mt-4 rounded-xl border border-blood/25 bg-blood/6 px-4 py-3.5">
            <p className="font-mono font-bold text-blood text-lg">18 members</p>
            <p className="text-[13px] text-chalk/65 mt-0.5">haven't played in 21+ days — historic churn window. A Friday Social Open Play recovers ~⅓ of them.</p>
          </div>
          <div className="mt-4 space-y-2.5">
            {[["Week 1 → 2", 92], ["Week 2 → 3", 71], ["Week 3 → 4", 64], ["Month 2+", 82]].map(([l, v]) => (
              <div key={l as string}>
                <div className="flex justify-between text-[11.5px] text-chalk/55 mb-1"><span>{l}</span><span className="font-mono">{v}% stay</span></div>
                <div className="h-1.5 rounded-full bg-chalk/8"><div className={`h-full rounded-full ${(v as number) < 70 ? "bg-blood/70" : "bg-teal/70"}`} style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="dark" icon="calendar" className="mt-4" onClick={() => toast({ icon: "calendar", title: "Friday Social Open Play drafted", body: "Targeted invite list ready: 18 at-risk members (aggregate, anonymized)." })}>Create recovery event</Button>
        </Card>

        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-lime flex items-center gap-2"><Icon name="spark" size={14} /> SMART CLUB RECOMMENDATIONS</p>
          <div className="mt-4 space-y-3">
            {[
              { icon: "star" as IconName, t: "Your beginner sessions are consistently full", b: "3 of the last 4 hit capacity within 6 hours. Add a second weekly beginner block — projected +22 members/quarter." },
              { icon: "wave" as IconName, t: "Thursday attendance runs 40% below Saturday", b: "Try a social doubles format with mixed levels — social events lift weekday turnout ~28% platform-wide." },
              { icon: "trophy" as IconName, t: "12 members crossed 1500 rating this month", b: "Enough for an Advanced challenge night. High-skill events improve your Health Score's engagement component." },
            ].map((r) => (
              <div key={r.t} className="rounded-xl border border-chalk/10 bg-court-900/60 p-4 hover:border-lime/25 transition group">
                <p className="font-display font-bold text-[13.5px] tracking-tight flex items-center gap-2.5"><span className="text-lime"><Icon name={r.icon} size={15} /></span> {r.t}</p>
                <p className="text-[12.5px] text-chalk/55 mt-1.5 leading-relaxed">{r.b}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DayRow({ day, cells }: { day: string; cells: { pct: number }[] }) {
  return (
    <>
      <span className="font-mono text-[11px] text-chalk/55 flex items-center">{day}</span>
      {cells.map((c, i) => <HeatCell key={i} pct={c.pct} />)}
    </>
  );
}

function Members() {
  const toast = useToast();
  const [rows, setRows] = useState(MEMBERS_SEED);
  const roleTone = (r: string) => (r === "Admin" || r === "Owner" ? "gold" : r === "Moderator" ? "teal" : r === "Coach" ? "clay" : r === "Event Manager" ? "lime" : "dim") as "gold" | "teal" | "clay" | "lime" | "dim";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black tracking-tight text-3xl">Member management</h1>
          <p className="mt-1.5 text-chalk/55 text-[14px]">Granular RBAC — every action here is authorized server-side and written to the audit log.</p>
        </div>
        <Button icon="plus" onClick={() => toast({ icon: "users", title: "Invite link created", body: "Expires in 72h · limited to 10 uses · requires full onboarding + verification." })}>Invite member</Button>
      </div>

      {/* pending approvals */}
      {rows.some((r) => r.status === "Pending") && (
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-gold flex items-center gap-2"><Icon name="clock" size={14} /> PENDING APPROVAL</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {rows.filter((r) => r.status === "Pending").map((m) => (
              <div key={m.id} className="rounded-xl border border-chalk/10 bg-court-900/60 p-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name={m.name} hue={(m.name.length * 47) % 360} size={42} />
                  <div className="flex-1">
                    <p className="font-display font-bold text-[14px] tracking-tight">{m.name}</p>
                    <div className="mt-1"><VerifyBadge state={m.verify as never} /></div>
                  </div>
                </div>
                <div className="mt-3.5 flex gap-2">
                  <Button size="sm" className="flex-1" icon="check" disabled={m.verify !== "VERIFIED"} onClick={() => { setRows((rs) => rs.map((x) => (x.id === m.id ? { ...x, status: "Active" } : x))); toast({ icon: "users", title: `${m.name} approved`, body: "Welcome notification sent. Fast-track applied: identity verified." }); }}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => { setRows((rs) => rs.filter((x) => x.id !== m.id)); toast({ icon: "x", tone: "blood", title: "Request declined", body: "The applicant can re-apply in 30 days. Reason logged." }); }}>Decline</Button>
                </div>
                {m.verify !== "VERIFIED" && <p className="mt-2 text-[11px] text-gold/80">Approval unlocks once identity verification completes.</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-widest text-chalk/35 border-b border-chalk/8">
                <th className="px-5 py-3.5 font-semibold">Member</th>
                <th className="px-2 py-3.5 font-semibold">Role</th>
                <th className="px-2 py-3.5 font-semibold hidden sm:table-cell">Verification</th>
                <th className="px-2 py-3.5 font-semibold hidden md:table-cell text-right">Reliability</th>
                <th className="px-2 py-3.5 font-semibold hidden md:table-cell text-right">Games</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.filter((r) => r.status !== "Pending").map((m) => (
                <tr key={m.id} className={`border-b border-chalk/5 hover:bg-chalk/3 transition ${m.status === "Suspended" ? "opacity-55" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} hue={(m.name.length * 47) % 360} size={34} verified={m.verify === "VERIFIED"} />
                      <div>
                        <p className="font-display font-bold tracking-tight text-[13.5px]">{m.name}</p>
                        <p className="text-[10.5px] text-chalk/40">joined {m.joined} · <span className={m.status === "Suspended" ? "text-blood" : "text-teal"}>{m.status}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <select value={m.role} onChange={(e) => { setRows((rs) => rs.map((x) => (x.id === m.id ? { ...x, role: e.target.value } : x))); toast({ icon: "shield", title: "Role updated", body: `${m.name} → ${e.target.value}. Change authorized & audit-logged.` }); }} className="rounded-lg bg-court-900 border border-chalk/12 px-2 py-1 text-[12px] font-semibold focus:outline-none">
                      {["Owner", "Admin", "Moderator", "Coach", "Event Manager", "Member"].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-3 hidden sm:table-cell"><VerifyBadge state={m.verify as never} /></td>
                  <td className="px-2 py-3 hidden md:table-cell text-right font-mono">{m.reliability || "—"}</td>
                  <td className="px-2 py-3 hidden md:table-cell text-right font-mono">{m.games}</td>
                  <td className="px-5 py-3 text-right">
                    {m.status === "Suspended" ? (
                      <Button size="sm" variant="dark" onClick={() => { setRows((rs) => rs.map((x) => (x.id === m.id ? { ...x, status: "Active" } : x))); toast({ icon: "check", title: "Suspension lifted", body: `${m.name} restored to active. Logged.` }); }}>Reinstate</Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-blood! hover:bg-blood/10!" onClick={() => { setRows((rs) => rs.map((x) => (x.id === m.id ? { ...x, status: "Suspended" } : x))); toast({ icon: "alert", tone: "blood", title: "Member suspended", body: "Appeal link sent automatically. Action logged with your admin ID." }); }}>Suspend</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface ManagedEvent {
  id: string; title: string; type: string; cap: number; filled: number; waitlist: number; fee: number;
  elimination: "single" | "double"; pairing: "blind" | "pair";
  chatOpen: boolean; chat: EventChatMessage[]; participants: string[]; paid: string[];
  pairs: [string, string][] | null; bracket: BracketMatch[] | null; champion: string | null;
}

function EventsAdmin() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Open Play");
  const [cap, setCap] = useState(16);
  const [elim, setElim] = useState<"single" | "double">("single");
  const [pairing, setPairing] = useState<"blind" | "pair">("blind");
  const [opsId, setOpsId] = useState<string | null>(null);
  const [events, setEvents] = useState<ManagedEvent[]>(() =>
    EVENTS.filter((e) => e.clubId === "c1").map((e) => ({
      id: e.id, title: e.title, type: e.type, cap: e.capacity, filled: e.filled, waitlist: e.waitlist, fee: e.fee,
      elimination: e.elimination ?? "single",
      pairing: e.pairing ?? (e.type === "Open Play" ? "blind" : "pair"),
      chatOpen: e.chatOpen ?? false, chat: e.chat ?? [], participants: e.participants ?? [], paid: e.paid ?? [],
      pairs: null, bracket: null, champion: null,
    }))
  );
  const opsEvent = events.find((e) => e.id === opsId) ?? null;
  const patch = (id: string, p: Partial<ManagedEvent>) => setEvents((ev) => ev.map((e) => (e.id === id ? { ...e, ...p } : e)));
  const isOP = type === "Open Play";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black tracking-tight text-3xl">Events</h1>
          <p className="mt-1.5 text-chalk/55 text-[14px]">Create, cap and waitlist-manage. Open Play events get an automatic group chat, receipt verification, shuffle and bracket generation.</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>Create event</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {events.map((e) => {
          const full = e.filled >= e.cap;
          return (
            <Card key={e.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Chip tone="gold">{e.type}</Chip>
                    {e.type === "Open Play" || e.type === "Tournament" ? (
                      <>
                        <Chip tone="teal">{e.elimination === "double" ? "Double Elim" : "Single Elim"}</Chip>
                        <Chip>{e.pairing === "blind" ? "Blind Pairing" : "By Pair"}</Chip>
                      </>
                    ) : null}
                    {full && <Chip tone="blood">FULL</Chip>}
                    {e.waitlist > 0 && <Chip tone="gold">{e.waitlist} waiting</Chip>}
                    {!e.chatOpen && e.type === "Open Play" && e.chat.length > 0 && <Chip tone="dim">Chat closed</Chip>}
                  </div>
                  <p className="font-display font-extrabold tracking-tight text-lg leading-tight">{e.title}</p>
                </div>
                <p className="font-mono text-[12px] text-chalk/45 shrink-0">{e.filled}/{e.cap}</p>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-chalk/8"><div className={`h-full rounded-full ${full ? "bg-blood" : "bg-lime"}`} style={{ width: `${Math.min(100, (e.filled / e.cap) * 100)}%` }} /></div>
              <div className="mt-4 flex flex-wrap gap-2">
                {e.type === "Open Play" && (
                  <Button size="sm" icon="chat" onClick={() => setOpsId(e.id)}>Manage Open Play</Button>
                )}
                <Button size="sm" variant="dark" onClick={() => toast({ icon: "users", title: "Waitlist processed", body: e.waitlist > 0 ? `Top eligible player offered the next opening (30-min claim window).` : "No active waitlist for this event." })}>Run waitlist fill</Button>
                <Button size="sm" variant="ghost" onClick={() => toast({ icon: "bell", title: "Reminder queued", body: "All registrants notified 3h before start." })}>Send reminder</Button>
                <Button size="sm" variant="ghost" className="text-blood! hover:bg-blood/10!" onClick={() => toast({ icon: "x", tone: "blood", title: "Event cancelled", body: "Registrants refunded/notified per policy. Fee-ready hook triggered (no charge in sandbox)." })}>Cancel</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create event">
        <div className="space-y-4">
          <Field label="Event title">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunday Mixed Round-Robin" />
          </Field>
          <Field label="Format">
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
              {["Open Play", "Training", "Tournament", "Beginner Night", "Doubles Night", "Social Night", "League", "Challenge Match"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          {(isOP || type === "Tournament") && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Elimination">
                <div className="grid grid-cols-2 gap-2">
                  {([["single", "Single Elim"], ["double", "Double Elim"]] as const).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setElim(v)}
                      className={`rounded-lg border px-3 py-2.5 text-[12.5px] font-bold transition ${elim === v ? "border-lime/60 bg-lime/12 text-lime" : "border-chalk/15 text-chalk/55 hover:border-chalk/30"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Pairing">
                {isOP ? (
                  <div className="rounded-lg border border-chalk/12 bg-court-900/70 px-3 py-2.5 flex items-center gap-2.5">
                    <Icon name="lock" size={14} className="text-chalk/40 shrink-0" />
                    <div>
                      <p className="text-[12.5px] font-bold text-chalk/80">Blind Pairing</p>
                      <p className="text-[10.5px] text-chalk/40 leading-snug">Automatic for Open Play — paid players are shuffled into random pairs.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {([["blind", "Blind Pairing"], ["pair", "By Pair"]] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setPairing(v)}
                        className={`rounded-lg border px-3 py-2.5 text-[12.5px] font-bold transition ${pairing === v ? "border-lime/60 bg-lime/12 text-lime" : "border-chalk/15 text-chalk/55 hover:border-chalk/30"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          )}

          <Field label="Capacity">
            <input className={inputCls} type="number" min={2} max={128} value={cap} onChange={(e) => setCap(Math.max(2, +e.target.value || 2))} />
          </Field>
          {isOP && (
            <div className="rounded-lg bg-teal/6 border border-teal/25 px-3.5 py-2.5 text-[12px] text-chalk/65 flex items-start gap-2.5">
              <Icon name="chat" size={14} className="text-teal shrink-0 mt-0.5" />
              <span>On publish, a <span className="font-bold text-chalk/85">group chat is created automatically</span> — only players who join are added. They send payment receipts there, you verify them, then shuffle paid players into the bracket.</span>
            </div>
          )}
          <div className="rounded-lg bg-gold/6 border border-gold/25 px-3.5 py-2.5 text-[12px] text-chalk/60">
            Skill-balance check runs automatically once 4+ players register — organizers get a “Good / Playable / Significant gap” read with override.
          </div>
          <div className="flex gap-2.5 justify-end pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button icon="check" disabled={title.trim().length < 4} onClick={() => {
              const id = `new${Date.now()}`;
              const chat: EventChatMessage[] = isOP
                ? [{ id: `${id}-sys`, author: "System", playerId: "sys", time: "now", text: "Group chat created automatically — only registered players are added." }]
                : [];
              setEvents((p) => [...p, {
                id, title: title.trim(), type, cap, filled: 0, waitlist: 0, fee: 5,
                elimination: elim, pairing: isOP ? "blind" : pairing,
                chatOpen: isOP, chat, participants: [], paid: [], pairs: null, bracket: null, champion: null,
              }]);
              setTitle(""); setOpen(false);
              toast({ icon: "calendar", title: "Event published", body: isOP ? "Registration open — the group chat is live and waiting for joiners." : "Registration open. Waitlist arms automatically at capacity." });
            }}>Publish</Button>
          </div>
        </div>
      </Modal>

      {opsEvent && <OpenPlayOps e={opsEvent} patch={patch} onClose={() => setOpsId(null)} />}
    </div>
  );
}

/* ---------------- Open Play operations ---------------- */
function OpenPlayOps({ e, patch, onClose }: { e: ManagedEvent; patch: (id: string, p: Partial<ManagedEvent>) => void; onClose: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<"chat" | "payments" | "shuffle" | "bracket">("chat");
  const [msg, setMsg] = useState("");
  const [shuffling, setShuffling] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const full = e.filled >= e.cap;
  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sysMsg = (text: string): EventChatMessage => ({ id: `s${Date.now()}${Math.random().toString(36).slice(2, 6)}`, author: "System", playerId: "sys", time: now(), text });

  const simulateSignups = () => {
    const candidates = PLAYERS.filter((p) => !e.participants.includes(p.id)).slice(0, 3);
    if (candidates.length === 0) { toast({ icon: "users", tone: "gold", title: "No more club players", body: "Everyone in the demo roster is already registered for this event." }); return; }
    const newFilled = Math.min(e.cap, e.filled + candidates.length);
    const newChat = [...e.chat];
    candidates.forEach((p, i) => {
      newChat.push({ id: `j${Date.now()}${i}`, author: p.name, playerId: p.id, time: now(), text: "Joined from the player app — slot confirmed." });
      if (i === 0) newChat.push({ id: `r${Date.now()}${i}`, author: p.name, playerId: p.id, time: now(), receipt: { fileName: `receipt-${p.id}-${Date.now().toString().slice(-4)}.png` } });
    });
    if (newFilled >= e.cap) newChat.push(sysMsg("Event is now FULL — further joiners go to the smart waitlist."));
    patch(e.id, { filled: newFilled, participants: [...e.participants, ...candidates.map((p) => p.id)], chat: newChat });
    toast({ icon: "users", title: `${candidates.length} player${candidates.length > 1 ? "s" : ""} registered`, body: newFilled >= e.cap ? "Event hit capacity — FULL status is now live for players." : "Added to the event and the group chat." });
  };

  const markPaid = (pid: string) => {
    if (e.paid.includes(pid)) return;
    patch(e.id, {
      paid: [...e.paid, pid],
      chat: [...e.chat, sysMsg(`${playerName(pid)} verified as Paid — moved to the shuffle pool.`)],
    });
    toast({ icon: "check", tone: "teal", title: "Payment verified", body: `${playerName(pid)} is now in the shuffle pool.` });
  };

  const doShuffle = () => {
    setShuffling(true);
    setTimeout(() => {
      const pairs = shufflePairs(e.paid, e.pairing);
      patch(e.id, { pairs });
      setShuffling(false);
      toast({ icon: "spark", title: e.pairing === "blind" ? "Blind shuffle complete" : "Pairs locked", body: `${pairs.length} pair${pairs.length > 1 ? "s" : ""} formed from ${e.paid.length} paid players.` });
    }, 1100);
  };

  const sendOrg = () => {
    if (!msg.trim()) return;
    patch(e.id, { chat: [...e.chat, { id: `o${Date.now()}`, author: "Organizer", playerId: "org", time: now(), text: msg.trim() }] });
    setMsg("");
  };

  const TABS: { id: typeof tab; label: string; icon: IconName }[] = [
    { id: "chat", label: "Group chat", icon: "chat" },
    { id: "payments", label: "Payments", icon: "doc" },
    { id: "shuffle", label: "Shuffle", icon: "spark" },
    { id: "bracket", label: "Bracket", icon: "trophy" },
  ];

  return (
    <Modal open onClose={onClose} title={e.title} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="gold">{e.type}</Chip>
          <Chip tone="teal">{e.elimination === "double" ? "Double Elim" : "Single Elim"}</Chip>
          <Chip>{e.pairing === "blind" ? "Blind Pairing" : "By Pair"}</Chip>
          <Chip tone={full ? "blood" : "lime"}>{e.filled}/{e.cap}{full ? " · FULL" : ""}</Chip>
          <span className="flex-1" />
          <Button size="sm" variant="dark" icon="users" onClick={simulateSignups}>Simulate sign-ups</Button>
          {e.chatOpen ? (
            confirmClose ? (
              <span className="flex items-center gap-2">
                <Button size="sm" variant="danger" onClick={() => {
                  patch(e.id, { chatOpen: false, chat: [...e.chat, sysMsg("The organizer closed this group chat. It is no longer available to players.")] });
                  setConfirmClose(false);
                  toast({ icon: "lock", tone: "blood", title: "Group chat closed", body: "The temporary event chat has been removed for players." });
                }}>Confirm close</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmClose(false)}>Keep open</Button>
              </span>
            ) : (
              <Button size="sm" variant="ghost" className="text-blood! hover:bg-blood/10!" icon="x" onClick={() => setConfirmClose(true)}>Close group chat</Button>
            )
          ) : (
            <Chip tone="dim"><Icon name="lock" size={11} /> Chat closed</Chip>
          )}
        </div>

        <div className="flex gap-1.5 border-b border-chalk/10 pb-2 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-bold whitespace-nowrap transition ${tab === t.id ? "bg-lime/12 text-lime border border-lime/25" : "text-chalk/50 hover:text-chalk border border-transparent"}`}>
              <Icon name={t.icon} size={14} /> {t.label}
              {t.id === "payments" && <span className="font-mono text-[10px] text-teal">{e.paid.length}/{e.participants.length}</span>}
              {t.id === "shuffle" && e.pairs && <Icon name="check" size={12} className="text-lime" />}
              {t.id === "bracket" && e.bracket && <Icon name="check" size={12} className="text-lime" />}
            </button>
          ))}
        </div>

        {/* -------- CHAT -------- */}
        {tab === "chat" && (
          <div>
            {!e.chatOpen ? (
              <div className="rounded-xl border border-chalk/10 bg-court-900/60 px-6 py-10 text-center">
                <Icon name="lock" size={26} className="text-chalk/30 mx-auto" />
                <p className="mt-3 font-display font-bold text-chalk/70">Group chat closed</p>
                <p className="mt-1 text-[12.5px] text-chalk/45 max-w-sm mx-auto">The temporary event chat was removed after the event wrapped up. The message history stays in the organizer audit log only.</p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-chalk/10 bg-court-950/60 h-72 overflow-y-auto p-3.5 space-y-2.5">
                  {e.chat.length === 0 && <p className="text-[12.5px] text-chalk/40 text-center pt-16">No messages yet — players are added automatically when they join.</p>}
                  {e.chat.map((m) => (
                    <div key={m.id} className={`max-w-[85%] ${m.playerId === "org" ? "ml-auto" : ""}`}>
                      {m.playerId === "sys" ? (
                        <p className="text-center text-[11px] text-chalk/40 font-mono py-1">— {m.text} · {m.time}</p>
                      ) : (
                        <div className={`rounded-xl px-3.5 py-2.5 border ${m.playerId === "org" ? "bg-lime/10 border-lime/20" : "bg-court-900 border-chalk/10"}`}>
                          <p className="flex items-baseline gap-2 text-[11px] font-mono mb-1">
                            <span className={m.playerId === "org" ? "text-lime font-bold" : "text-teal font-bold"}>{m.author}</span>
                            <span className="text-chalk/35">{m.time}</span>
                            {m.receipt && !e.paid.includes(m.playerId) && m.playerId !== "org" && (
                              <button onClick={() => markPaid(m.playerId)} className="ml-auto text-[10px] font-bold text-court-950 bg-lime rounded px-2 py-0.5 hover:bg-lime-3 transition">Mark Paid</button>
                            )}
                            {m.receipt && e.paid.includes(m.playerId) && <span className="ml-auto text-[10px] font-bold text-lime flex items-center gap-1"><Icon name="check" size={10} /> Paid</span>}
                          </p>
                          {m.text && <p className="text-[13px] text-chalk/85 leading-snug">{m.text}</p>}
                          {m.receipt && (
                            <p className="flex items-center gap-2 rounded-lg bg-chalk/6 border border-chalk/12 px-3 py-2 text-[12px] font-mono text-chalk/75">
                              <Icon name="doc" size={14} className="text-gold" /> {m.receipt.fileName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input className={inputCls} value={msg} onChange={(ev) => setMsg(ev.target.value)} onKeyDown={(ev) => ev.key === "Enter" && sendOrg()} placeholder="Message the group as organizer…" />
                  <Button icon="arrow" onClick={sendOrg} disabled={!msg.trim()}>Send</Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* -------- PAYMENTS -------- */}
        {tab === "payments" && (
          <div className="space-y-2">
            {e.participants.length === 0 && (
              <p className="text-[13px] text-chalk/45 text-center py-10">No registrants yet — use “Simulate sign-ups” or wait for players to join from the player app.</p>
            )}
            {e.participants.map((pid) => {
              const receipt = [...e.chat].reverse().find((m) => m.playerId === pid && m.receipt);
              const isPaid = e.paid.includes(pid);
              return (
                <div key={pid} className="flex items-center gap-3 rounded-xl border border-chalk/10 bg-court-900/60 px-4 py-3">
                  <Avatar name={playerName(pid)} hue={(pid.charCodeAt(1) * 47) % 360} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold truncate">{playerName(pid)}</p>
                    <p className="text-[11px] font-mono text-chalk/45 truncate flex items-center gap-1.5">
                      {receipt ? <><Icon name="doc" size={11} className="text-gold" /> {receipt.receipt!.fileName}</> : "No receipt sent yet"}
                    </p>
                  </div>
                  {isPaid ? (
                    <Chip tone="lime"><Icon name="check" size={11} /> Paid</Chip>
                  ) : (
                    <Button size="sm" variant="dark" disabled={!receipt} onClick={() => markPaid(pid)}>{receipt ? "Verify & mark Paid" : "Awaiting receipt"}</Button>
                  )}
                </div>
              );
            })}
            {e.participants.length > 0 && (
              <p className="text-[11.5px] text-chalk/40 pt-1">Fee: ${e.fee} per player · verifying a receipt moves the player into the shuffle pool automatically.</p>
            )}
          </div>
        )}

        {/* -------- SHUFFLE -------- */}
        {tab === "shuffle" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-chalk/10 bg-court-900/60 p-4">
              <p className="font-mono text-[11px] tracking-widest text-chalk/45">PAID PLAYERS — SHUFFLE POOL ({e.paid.length})</p>
              <div className="mt-3 flex flex-wrap gap-2 min-h-9">
                {e.paid.length === 0 && <p className="text-[12.5px] text-chalk/40">No paid players yet. Verify receipts in the Payments tab first.</p>}
                {e.paid.map((pid) => (
                  <span key={pid} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${shuffling ? "animate-pulse border-gold/50 text-gold bg-gold/8" : "border-teal/40 text-teal bg-teal/8"}`}>
                    <Icon name="users" size={12} /> {playerName(pid)}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button icon="spark" disabled={e.paid.length < 2 || shuffling} onClick={doShuffle}>
                  {shuffling ? "Shuffling…" : e.pairing === "blind" ? "Shuffle paid players (Blind Pairing)" : "Lock pairs (By Pair)"}
                </Button>
                {e.pairs && (
                  <Button variant="dark" icon="trophy" disabled={!!e.bracket} onClick={() => {
                    patch(e.id, { bracket: generateBracket(e.pairs!, e.elimination) });
                    toast({ icon: "trophy", title: "Bracket generated", body: `${e.elimination === "double" ? "Double" : "Single"} elimination bracket built from the shuffled pairs.` });
                  }}>
                    {e.bracket ? "Bracket ready" : `Generate ${e.elimination === "double" ? "double" : "single"}-elim bracket`}
                  </Button>
                )}
              </div>
              <p className="mt-3 text-[11.5px] text-chalk/40">
                {e.pairing === "blind"
                  ? "Blind Pairing randomizes matchups from the paid pool — no seeding, no favorites. Odd pools get a bye."
                  : "By Pair keeps players in their registered pairs and seeds them straight into the bracket."}
              </p>
            </div>
            {e.pairs && (
              <div className="rounded-xl border border-lime/20 bg-lime/5 p-4">
                <p className="font-mono text-[11px] tracking-widest text-lime">GENERATED PAIRS</p>
                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                  {e.pairs.map((pr, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-court-900/70 border border-chalk/10 px-3 py-2 text-[12.5px] font-semibold">
                      <span className="font-mono text-[10px] text-lime">M{i + 1}</span>
                      <span className="truncate">{playerName(pr[0])}</span>
                      <span className="text-chalk/35 font-mono text-[10px]">vs</span>
                      <span className="truncate">{playerName(pr[1])}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------- BRACKET -------- */}
        {tab === "bracket" && (
          <div>
            {!e.bracket ? (
              <div className="rounded-xl border border-dashed border-chalk/15 px-6 py-12 text-center">
                <Icon name="trophy" size={26} className="text-chalk/25 mx-auto" />
                <p className="mt-3 font-display font-bold text-chalk/60">No bracket yet</p>
                <p className="mt-1 text-[12.5px] text-chalk/40">Shuffle the paid players first — the bracket generates automatically from those pairs.</p>
              </div>
            ) : (
              <BracketBoard bracket={e.bracket} elim={e.elimination} champion={e.champion}
                onPick={(mid, side) => {
                  const res = advanceBracket(e.bracket!, mid, side);
                  patch(e.id, { bracket: res.bracket, champion: res.champion ?? e.champion });
                  if (res.champion) toast({ icon: "trophy", tone: "gold", title: "Champion crowned", body: `${playerName(res.champion)} takes the event. Results feed rankings and Play Style DNA.` });
                }} />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function BracketBoard({ bracket, elim, champion, onPick }: {
  bracket: BracketMatch[]; elim: "single" | "double"; champion: string | null;
  onPick: (id: string, side: "a" | "b") => void;
}) {
  const winners = bracket.filter((m) => !m.losers);
  const losers = bracket.filter((m) => m.losers && m.id !== "gf");
  const gf = bracket.find((m) => m.id === "gf");
  const wRounds = Math.max(...winners.map((m) => m.round)) + 1;
  const lRounds = losers.length ? Math.max(...losers.map((m) => m.round)) + 1 : 0;

  const renderMatch = (m: BracketMatch) => {
    const ready = !!m.a && !!m.b && m.a !== "BYE" && m.b !== "BYE" && !m.winner;
    return (
      <div key={m.id} className="rounded-lg border border-chalk/12 bg-court-900/80 overflow-hidden w-[164px] shrink-0">
        {(["a", "b"] as const).map((s) => {
          const val = m[s];
          const name = val ? playerName(val) : "TBD";
          const won = m.winner === s;
          return (
            <button key={s} disabled={!ready} onClick={() => onPick(m.id, s)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11.5px] font-bold border-b border-chalk/8 last:border-b-0 transition-colors ${won ? "bg-lime/15 text-lime" : m.winner ? "text-chalk/30" : ready ? "text-chalk/85 hover:bg-lime/10 cursor-pointer" : "text-chalk/40"}`}>
              <span className="truncate">{name}</span>
              {won && <Icon name="check" size={11} />}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {champion && (
        <div className="rounded-xl border border-gold/40 bg-gold/8 px-5 py-4 flex items-center gap-3.5">
          <Icon name="trophy" size={22} className="text-gold" />
          <div>
            <p className="font-mono text-[10.5px] tracking-widest text-gold">EVENT CHAMPION</p>
            <p className="font-display font-black text-xl tracking-tight">{playerName(champion)}</p>
          </div>
        </div>
      )}
      <div>
        <p className="font-mono text-[11px] tracking-widest text-chalk/45 mb-2.5">WINNERS BRACKET — click a side to advance the winner</p>
        <div className="flex gap-4 overflow-x-auto pb-2 items-start">
          {Array.from({ length: wRounds }).map((_, r) => (
            <div key={r} className="flex flex-col gap-3">
              <p className="font-mono text-[10px] text-lime tracking-widest text-center">{r === wRounds - 1 ? "FINAL" : `ROUND ${r + 1}`}</p>
              {winners.filter((m) => m.round === r).map(renderMatch)}
            </div>
          ))}
        </div>
      </div>
      {elim === "double" && (
        <div>
          <p className="font-mono text-[11px] tracking-widest text-blood/80 mb-2.5">LOSERS BRACKET — one more life, then it's over</p>
          <div className="flex gap-4 overflow-x-auto pb-2 items-start">
            {Array.from({ length: lRounds }).map((_, r) => (
              <div key={r} className="flex flex-col gap-3">
                <p className="font-mono text-[10px] text-blood/70 tracking-widest text-center">LOSERS R{r + 1}</p>
                {losers.filter((m) => m.round === r).map(renderMatch)}
              </div>
            ))}
            {gf && (
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[10px] text-gold tracking-widest text-center">GRAND FINAL</p>
                {renderMatch(gf)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Security() {
  const [queue, setQueue] = useState(RISK_QUEUE);
  const toast = useToast();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Security & trust center</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Risk signals are weighted and reviewed — the engine recommends, humans decide. Nothing auto-punishes on weak signals.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatPill icon="shieldCheck" label="Verified members" value="318/342" />
        <StatPill icon="id" label="Verifications · 30d" value="57" tone="teal" />
        <StatPill icon="alert" label="Failed attempts" value="4" tone="clay" />
        <StatPill icon="flag" label="Open reports" value="2" tone="clay" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-blood flex items-center gap-2"><Icon name="radar" size={14} /> FRAUD / RISK QUEUE</p>
          <div className="mt-4 space-y-3">
            {queue.map((r) => {
              const lvl = riskLevel(r.points);
              return (
                <div key={r.id} className="rounded-xl border border-chalk/10 bg-court-900/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-semibold leading-snug">{r.label}</p>
                    <Chip tone={RISK_TONE[lvl]}>{lvl}</Chip>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {r.signals.map((s) => <span key={s} className="font-mono text-[10px] px-2 py-0.5 rounded bg-chalk/6 text-chalk/50">#{s}</span>)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="dark" onClick={() => { setQueue((q) => q.filter((x) => x.id !== r.id)); toast({ icon: "check", title: "Marked reviewed", body: "No action taken — signal logged as benign. Decision audit-logged." }); }}>Dismiss</Button>
                    <Button size="sm" variant="danger" onClick={() => { setQueue((q) => q.filter((x) => x.id !== r.id)); toast({ icon: "flag", tone: "blood", title: "Escalated to platform review", body: "Account features limited pending human review. User notified with appeal path." }); }}>Escalate</Button>
                  </div>
                </div>
              );
            })}
            {queue.length === 0 && <p className="text-[13px] text-chalk/45 text-center py-6">Queue clear — nice and boring, exactly how it should be.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-teal flex items-center gap-2"><Icon name="doc" size={14} /> AUDIT LOG (recent)</p>
          <div className="mt-4 space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
            {AUDIT_LOG.map((a) => (
              <div key={a.id} className="rounded-lg border border-chalk/8 bg-court-900/60 px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-mono text-[10px] font-bold ${a.severity === "high" ? "text-blood" : a.severity === "warn" ? "text-gold" : "text-teal"}`}>{a.severity.toUpperCase()}</span>
                  <span className="font-mono text-[10px] text-chalk/35">{a.ts}</span>
                </div>
                <p className="text-[12.5px] font-semibold mt-1">{a.action}</p>
                <p className="font-mono text-[10.5px] text-chalk/40 mt-0.5">{a.actor} → {a.target}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] text-chalk/40 leading-relaxed">Logs never contain passwords, secrets or raw identity data. Retention: 12 months, exportable for compliance.</p>
        </Card>
      </div>
    </div>
  );
}

export default function ClubAdmin({ user, clubName, onLogout }: { user: SessionUser; clubName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  return (
    <div className="min-h-screen bg-court-950 text-chalk">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-chalk/8 bg-court-900/70 backdrop-blur z-40">
        <div className="h-16 flex items-center px-5 border-b border-chalk/8"><Logo /></div>
        <div className="px-5 py-4 border-b border-chalk/8">
          <p className="text-[10px] uppercase tracking-widest text-chalk/35">Managing</p>
          <p className="font-display font-extrabold tracking-tight text-[15px] mt-0.5 leading-tight">{clubName}</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); window.scrollTo({ top: 0 }); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-display font-bold tracking-tight transition-all ${tab === t.id ? "bg-lime/12 text-lime border border-lime/20" : "text-chalk/55 hover:text-chalk hover:bg-chalk/5 border border-transparent"}`}>
              <Icon name={t.icon} size={17} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3.5 border-t border-chalk/8">
          <div className="flex items-center gap-3 rounded-xl bg-court-850 border border-chalk/8 p-3">
            <Avatar name={user.name} hue={user.avatarHue} size={38} verified />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-[13px] tracking-tight truncate">{user.name}</p>
              <p className="text-[10.5px] text-gold">Owner · full RBAC</p>
            </div>
            <button onClick={onLogout} className="text-chalk/40 hover:text-blood transition" title="Sign out"><Icon name="logout" size={16} /></button>
          </div>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 inset-x-0 h-14 z-40 bg-court-950/90 backdrop-blur border-b border-chalk/8 flex items-center justify-between px-4">
        <Logo compact />
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-[13px] truncate max-w-[40vw]">{clubName}</span>
          <button onClick={onLogout} className="text-chalk/40"><Icon name="logout" size={18} /></button>
        </div>
      </header>

      <main className="lg:pl-60 pt-14 lg:pt-0 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 lg:py-9">
          <div className="lg:hidden mb-5 overflow-x-auto">
            <Tabs active={tab} onChange={(t) => setTab(t as AdminTab)} tabs={TABS.map((t) => ({ id: t.id, label: t.label }))} />
          </div>
          {tab === "overview" && <Overview clubName={clubName} />}
          {tab === "insights" && <Insights />}
          {tab === "members" && <Members />}
          {tab === "events" && <EventsAdmin />}
          {tab === "security" && <Security />}
        </div>
      </main>
    </div>
  );
}
