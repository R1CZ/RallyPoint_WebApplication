import { useMemo, useState } from "react";
import { AUDIT_LOG, DAYS, EVENTS, HOURS, MEMBERS_SEED, RISK_QUEUE, utilizationGrid } from "../lib/data";
import { clubHealth, riskLevel, utilizationInsight } from "../lib/engine";
import type { RiskLevel } from "../lib/engine";
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

function EventsAdmin() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Open Play");
  const [cap, setCap] = useState(16);
  const [created, setCreated] = useState<{ id: string; title: string; type: string; cap: number }[]>([]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black tracking-tight text-3xl">Events</h1>
          <p className="mt-1.5 text-chalk/55 text-[14px]">Create, cap and waitlist-manage. Full events auto-enable smart waitlists with timed offers.</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>Create event</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {[...created.map((c) => ({ id: c.id, title: c.title, type: c.type, capacity: c.cap, filled: 0, waitlist: 0 })), ...EVENTS.filter((e) => e.clubId === "c1")].map((e) => {
          const full = e.filled >= e.capacity;
          return (
            <Card key={e.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex gap-1.5 mb-2"><Chip tone="gold">{e.type}</Chip>{full && <Chip tone="blood">Full</Chip>}{e.waitlist > 0 && <Chip tone="gold">{e.waitlist} waiting</Chip>}</div>
                  <p className="font-display font-extrabold tracking-tight text-lg leading-tight">{e.title}</p>
                </div>
                <p className="font-mono text-[12px] text-chalk/45 shrink-0">{e.filled}/{e.capacity}</p>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-chalk/8"><div className={`h-full rounded-full ${full ? "bg-blood" : "bg-lime"}`} style={{ width: `${Math.min(100, (e.filled / e.capacity) * 100)}%` }} /></div>
              <div className="mt-4 flex flex-wrap gap-2">
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
          <Field label="Capacity">
            <input className={inputCls} type="number" min={2} max={128} value={cap} onChange={(e) => setCap(Math.max(2, +e.target.value || 2))} />
          </Field>
          <div className="rounded-lg bg-gold/6 border border-gold/25 px-3.5 py-2.5 text-[12px] text-chalk/60">
            Skill-balance check runs automatically once 4+ players register — organizers get a “Good / Playable / Significant gap” read with override.
          </div>
          <div className="flex gap-2.5 justify-end pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button icon="check" disabled={title.trim().length < 4} onClick={() => {
              setCreated((p) => [...p, { id: `new${Date.now()}`, title: title.trim(), type, cap }]);
              setTitle(""); setOpen(false);
              toast({ icon: "calendar", title: "Event published", body: "Registration open. Waitlist arms automatically at capacity." });
            }}>Publish</Button>
          </div>
        </div>
      </Modal>
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
