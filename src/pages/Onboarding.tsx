import { useEffect, useRef, useState } from "react";
import {
  analyzePhoto, classifyNameMatch, nameMatchRatio, nameSanity, passwordStrength,
  validEmail, validPhone, NAME_MATCH_THRESHOLD,
} from "../lib/engine";
import type { PhotoCheck, Role, VerifyState } from "../lib/engine";
import { Button, Chip, Field, Icon, Logo, useToast, VerifyBadge, inputCls } from "../components/ui";
import type { IconName } from "../components/ui";

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  verified: VerifyState;
  photoVerified: boolean;
  avatarHue: number;
  clubName?: string;
}

const STEPS = ["Role", "Account", "Codes", "Identity", "Done"];

/* hold-to-confirm human check */
function HumanCheck({ onPass }: { onPass: () => void }) {
  const [p, setP] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef(0);
  const passed = useRef(false);
  const tick = (t: number) => {
    const v = Math.min(100, ((t - start.current) / 1400) * 100);
    setP(v);
    if (v >= 100) {
      if (!passed.current) { passed.current = true; onPass(); }
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };
  const down = () => { start.current = performance.now(); raf.current = requestAnimationFrame(tick); };
  const up = () => { cancelAnimationFrame(raf.current); if (!passed.current) setP(0); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <button
      type="button"
      onMouseDown={down} onMouseUp={up} onMouseLeave={up}
      onTouchStart={down} onTouchEnd={up}
      className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-[13px] font-semibold transition-colors select-none ${p >= 100 ? "border-lime/50 text-lime bg-lime/10" : "border-chalk/15 text-chalk/70 bg-court-900/70"}`}
    >
      <span className="absolute inset-y-0 left-0 bg-lime/15 transition-none" style={{ width: `${p}%` }} />
      <span className="relative flex items-center justify-center gap-2">
        <Icon name={p >= 100 ? "check" : "shield"} size={15} />
        {p >= 100 ? "Human confirmed" : "Press & hold — quick bot check"}
      </span>
    </button>
  );
}

/* verification step card with animated pipeline */
function VerifyPipeline({ stage }: { stage: number }) {
  const steps = ["Document integrity", "OCR extraction", "Face match", "Liveness", "Name policy check"];
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => (
        <div key={s} className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-all duration-500 ${i < stage ? "border-lime/30 bg-lime/6" : i === stage ? "border-gold/30 bg-gold/6" : "border-chalk/8 bg-court-900/60 opacity-50"}`}>
          <span className={i < stage ? "text-lime" : i === stage ? "text-gold" : "text-chalk/30"}>
            <Icon name={i < stage ? "check" : i === stage ? "clock" : "doc"} size={15} />
          </span>
          <span className="text-[13px] font-semibold flex-1">{s}</span>
          {i === stage && <span className="font-mono text-[10px] text-gold">running…</span>}
          {i < stage && <span className="font-mono text-[10px] text-lime">pass</span>}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding({ initialRole, onDone, onBack }: { initialRole: Role; onDone: (u: SessionUser) => void; onBack: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>(initialRole);

  // account form
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("Philippines");
  const [pw, setPw] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [human, setHuman] = useState(false);
  const [consent, setConsent] = useState(false);

  // codes
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [resends, setResends] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // identity
  const [docType, setDocType] = useState("Passport");
  const [docName, setDocName] = useState("");
  const [docScanned, setDocScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [photo, setPhoto] = useState<PhotoCheck | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [liveness, setLiveness] = useState(false);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<{ state: VerifyState; label: string; note: string; ratio: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fullName = `${first.trim()} ${last.trim()}`.trim();
  const sanity = fullName ? nameSanity(fullName) : { ok: true, reasons: [] };
  const pwCheck = passwordStrength(pw);

  const accountValid =
    sanity.ok && first.trim().length >= 2 && last.trim().length >= 2 && validEmail(email) &&
    validPhone(phone) && dob !== "" && pwCheck.score >= 3 && human && consent;

  const codesValid = emailCode === "424242" && phoneCode === "424242";

  const startScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setDocScanned(true); }, 1400);
  };

  const onPhoto = async (f: File | undefined) => {
    if (!f) return;
    const res = await analyzePhoto(f);
    setPhoto(res);
    setPhotoUrl(URL.createObjectURL(f));
    if (res.passed) toast({ icon: "camera", tone: "teal", title: "Photo pre-check passed", body: "Brightness & detail look good. Final face-match happens in the provider pipeline." });
  };

  const runVerification = () => {
    setRunning(true);
    setResult(null);
    setStage(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      if (s < 5) setStage(s);
      else {
        clearInterval(iv);
        setStage(5);
        const ratio = nameMatchRatio(fullName, docName);
        setResult({ ...classifyNameMatch(ratio), ratio });
        setRunning(false);
      }
    }, 620);
  };

  const finish = () => {
    onDone({
      name: fullName || "Alex Rivera",
      email: email || "alex@rallypoint.app",
      role,
      verified: result?.state === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "VERIFIED",
      photoVerified: true,
      avatarHue: Math.abs(fullName.length * 37) % 360,
    });
  };

  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  return (
    <div className="min-h-screen bg-court-950 text-chalk noise relative">
      <div className="absolute inset-0 court-grid [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <header className="relative z-10 max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={onBack} className="hover:opacity-80 transition"><Logo /></button>
        <Button variant="ghost" size="sm" icon="logout" onClick={onBack}>Exit</Button>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-5 pb-24">
        {/* progress rail */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? "text-chalk" : "text-chalk/30"}`}>
                <span className={`w-7 h-7 rounded-full grid place-items-center font-mono text-[11px] font-bold border transition-colors ${i < step ? "bg-lime text-court-950 border-lime" : i === step ? "border-lime text-lime" : "border-chalk/15"}`}>
                  {i < step ? <Icon name="check" size={13} strokeWidth={2.4} /> : i + 1}
                </span>
                <span className="hidden sm:block text-[11px] font-display font-bold tracking-wide uppercase">{s}</span>
              </div>
              {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-lime/50" : "bg-chalk/10"}`} />}
            </div>
          ))}
        </div>

        {/* ============ STEP 0 — ROLE ============ */}
        {step === 0 && (
          <div className="anim-fadeUp">
            <h1 className="font-display font-black tracking-tight text-3xl sm:text-4xl">How will you use RallyPoint?</h1>
            <p className="mt-3 text-chalk/55">You can hold both roles later — once you're verified, switching takes one click.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {([
                { r: "player" as Role, icon: "paddle" as IconName, title: "I want to play", body: "Find clubs, get matched with balanced games, track ratings and Play Style DNA.", perks: ["Smart club matching", "Fair Match Engine", "Events & ladders"] },
                { r: "club" as Role, icon: "court" as IconName, title: "I want to build a club", body: "Create a verified club, configure courts, grow a community, run it with data.", perks: ["Club wizard", "Health Score", "Member & court OS"] },
              ]).map((o) => (
                <button
                  key={o.r}
                  onClick={() => setRole(o.r)}
                  className={`text-left rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 ${role === o.r ? "border-lime bg-lime/8 shadow-lift" : "border-chalk/12 bg-court-850/70 hover:border-chalk/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-12 h-12 rounded-xl grid place-items-center ${role === o.r ? "bg-lime text-court-950" : "bg-chalk/8 text-chalk/70"}`}>
                      <Icon name={o.icon} size={24} />
                    </span>
                    <span className={`w-5 h-5 rounded-full border-2 grid place-items-center ${role === o.r ? "border-lime" : "border-chalk/25"}`}>
                      {role === o.r && <span className="w-2.5 h-2.5 rounded-full bg-lime" />}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display font-extrabold tracking-tight text-xl">{o.title}</h3>
                  <p className="mt-2 text-[13.5px] text-chalk/55 leading-relaxed">{o.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {o.perks.map((p) => <Chip key={p}>{p}</Chip>)}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button size="lg" icon="arrow" onClick={() => setStep(1)}>Continue</Button>
            </div>
          </div>
        )}

        {/* ============ STEP 1 — ACCOUNT ============ */}
        {step === 1 && (
          <div className="anim-fadeUp">
            <h1 className="font-display font-black tracking-tight text-3xl">Create your account</h1>
            <p className="mt-2 text-chalk/55 text-[14px]">Use your <span className="text-chalk">legal name</span> — it's checked against your identity document later. Nonsense names fail verification, not just this form.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              <Field label="Legal first name" error={touched.first && !sanity.ok && first ? sanity.reasons[0] : touched.first && first.trim().length < 2 ? "Required" : undefined}>
                <input className={inputCls} value={first} onChange={(e) => setFirst(e.target.value)} onBlur={() => blur("first")} placeholder="e.g. Alex" autoComplete="given-name" />
              </Field>
              <Field label="Legal last name" error={touched.last && last.trim().length < 2 ? "Required" : undefined}>
                <input className={inputCls} value={last} onChange={(e) => setLast(e.target.value)} onBlur={() => blur("last")} placeholder="e.g. Rivera" autoComplete="family-name" />
              </Field>
            </div>

            {/* live name sanity panel */}
            {fullName.length > 1 && (
              <div className={`mt-4 rounded-xl border px-4 py-3 flex items-start gap-3 ${sanity.ok ? "border-lime/25 bg-lime/6" : "border-blood/30 bg-blood/8"}`}>
                <span className={sanity.ok ? "text-lime" : "text-blood"}><Icon name={sanity.ok ? "shieldCheck" : "alert"} size={17} /></span>
                <div>
                  <p className="text-[13px] font-bold">{sanity.ok ? "Name passes pre-screening" : "Name rejected by pre-screening"}</p>
                  {!sanity.ok && (
                    <ul className="mt-1 space-y-0.5">
                      {sanity.reasons.map((r) => <li key={r} className="text-[12px] text-chalk/60">· {r}</li>)}
                    </ul>
                  )}
                  {sanity.ok && <p className="text-[12px] text-chalk/50">Final confirmation happens against your document via the verification provider — middle names, accents and formatting are tolerated.</p>}
                </div>
              </div>
            )}

            <div className="mt-5 grid sm:grid-cols-2 gap-5">
              <Field label="Email" error={touched.email && !validEmail(email) ? "Enter a valid email address" : undefined}>
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => blur("email")} placeholder="you@example.com" autoComplete="email" />
              </Field>
              <Field label="Phone" error={touched.phone && !validPhone(phone) ? "Enter a valid phone number" : undefined}>
                <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => blur("phone")} placeholder="+63 917 555 0142" autoComplete="tel" />
              </Field>
              <Field label="Date of birth" hint="Used only for age-gated events">
                <input className={inputCls} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </Field>
              <Field label="Country / region">
                <select className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)}>
                  {["Philippines", "United States", "Canada", "United Kingdom", "Germany", "Spain", "France", "Australia", "India", "Brazil", "Japan", "Other"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Password" error={touched.pw && pwCheck.score < 3 ? pwCheck.issues[0] : undefined}>
                <input className={inputCls} type="password" value={pw} onChange={(e) => setPw(e.target.value)} onBlur={() => blur("pw")} placeholder="Min. 10 characters" autoComplete="new-password" />
              </Field>
              <div className="mt-2.5 flex items-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${pwCheck.score > i ? ["bg-blood", "bg-clay", "bg-gold", "bg-lime"][pwCheck.score - 1] : "bg-chalk/10"}`} />
                ))}
                <span className="font-mono text-[11px] text-chalk/50 w-20 text-right">{pw ? pwCheck.label : "—"}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3.5">
              <HumanCheck onPass={() => setHuman(true)} />
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#c8f13f]" />
                <span className="text-[12.5px] text-chalk/60 leading-relaxed">
                  I agree to the Terms of Service and Privacy Notice, and I consent to identity verification processing (documents are handled by our KYC provider and purged after the retention period).
                </span>
              </label>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              <Button size="lg" icon="arrow" disabled={!accountValid} onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        )}

        {/* ============ STEP 2 — CODES ============ */}
        {step === 2 && (
          <div className="anim-fadeUp max-w-lg">
            <h1 className="font-display font-black tracking-tight text-3xl">Confirm it's really you</h1>
            <p className="mt-2 text-chalk/55 text-[14px]">We sent 6-digit codes to <span className="text-chalk font-semibold">{email || "your email"}</span> and <span className="text-chalk font-semibold">{phone || "your phone"}</span>. Registration is rate-limited — three resend attempts trigger a cooldown.</p>
            <div className="mt-6 rounded-xl border border-gold/25 bg-gold/6 px-4 py-3 flex items-center gap-3">
              <Icon name="spark" size={16} className="text-gold" />
              <p className="text-[12.5px] text-chalk/70"><span className="font-bold text-gold">Sandbox provider:</span> use code <span className="font-mono font-bold text-chalk">424242</span> for both channels.</p>
            </div>
            <div className="mt-6 space-y-5">
              <Field label="Email code" error={touched.ec && emailCode !== "424242" ? "Code doesn't match — check the sandbox hint above" : undefined}>
                <input className={`${inputCls} font-mono tracking-[0.4em]`} maxLength={6} value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))} onBlur={() => blur("ec")} placeholder="······" inputMode="numeric" />
              </Field>
              <Field label="SMS code" error={touched.pc && phoneCode !== "424242" ? "Code doesn't match — check the sandbox hint above" : undefined}>
                <input className={`${inputCls} font-mono tracking-[0.4em]`} maxLength={6} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ""))} onBlur={() => blur("pc")} placeholder="······" inputMode="numeric" />
              </Field>
            </div>
            <button
              className="mt-4 text-[13px] font-semibold text-chalk/60 hover:text-lime transition disabled:opacity-40"
              disabled={cooldown > 0 || resends >= 3}
              onClick={() => {
                setResends((r) => r + 1);
                setCooldown(20);
                toast({ icon: "bell", tone: "gold", title: resends >= 2 ? "Rate limit hit" : "Codes re-sent", body: resends >= 2 ? "Too many attempts — resends paused for 20s. This mirrors server-side brute-force protection." : "Fresh codes on the way (sandbox: 424242)." });
              }}
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : resends >= 3 ? "Resends temporarily locked" : "Resend codes"}
            </button>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button size="lg" icon="arrow" disabled={!codesValid} onClick={() => setStep(3)}>Verify & continue</Button>
            </div>
          </div>
        )}

        {/* ============ STEP 3 — IDENTITY ============ */}
        {step === 3 && (
          <div className="anim-fadeUp">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display font-black tracking-tight text-3xl">Identity verification</h1>
                <p className="mt-2 text-chalk/55 text-[14px] max-w-xl">Simulated end-to-end run of the provider pipeline: document authenticity → OCR → face-match → liveness → name policy. Uploading a picture is never enough on its own.</p>
              </div>
              <VerifyBadge state={result ? result.state : "IN_PROGRESS"} size="md" />
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                {/* document */}
                <div className="rounded-2xl border border-chalk/12 bg-court-850/70 p-5">
                  <p className="flex items-center gap-2 font-display font-bold text-[14px]"><Icon name="id" size={16} className="text-lime" /> 1 · Government document</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {["Passport", "Driver licence", "National ID"].map((d) => (
                      <button key={d} onClick={() => { setDocType(d); setDocScanned(false); }} className={`rounded-lg border px-2 py-2 text-[12px] font-semibold transition ${docType === d ? "border-lime/50 bg-lime/10 text-lime" : "border-chalk/12 text-chalk/60 hover:border-chalk/30"}`}>{d}</button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Field label="Name printed on the document" hint="simulates OCR output">
                      <input className={inputCls} value={docName} onChange={(e) => { setDocName(e.target.value); setDocScanned(false); }} placeholder="e.g. John Michael Smith" />
                    </Field>
                  </div>
                  <Button variant="dark" size="sm" icon={scanning ? "clock" : "doc"} className="mt-3" disabled={!docName.trim() || scanning} onClick={startScan}>
                    {scanning ? "Scanning document…" : docScanned ? "Re-scan document" : "Scan document"}
                  </Button>
                  {docScanned && (
                    <div className="mt-3 rounded-lg border border-lime/25 bg-lime/6 px-3.5 py-2.5 text-[12.5px] flex items-center gap-2.5">
                      <Icon name="check" size={14} className="text-lime" />
                      <span><span className="font-bold text-lime">{docType} accepted</span> — authenticity features OK · OCR extracted: <span className="font-mono">{docName}</span></span>
                    </div>
                  )}
                </div>

                {/* photo */}
                <div className="rounded-2xl border border-chalk/12 bg-court-850/70 p-5">
                  <p className="flex items-center gap-2 font-display font-bold text-[14px]"><Icon name="camera" size={16} className="text-teal" /> 2 · Profile photo pre-check</p>
                  <p className="mt-1.5 text-[12.5px] text-chalk/50">Local luminance/detail pre-screen. Cartoons, pets, blanks and dark photos are rejected — final face-match is provider-side.</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
                  <div className="mt-3 flex items-center gap-4">
                    <button onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-xl border-2 border-dashed border-chalk/25 hover:border-teal/60 grid place-items-center text-chalk/40 hover:text-teal transition overflow-hidden">
                      {photoUrl ? <img src={photoUrl} alt="Profile preview" className="w-full h-full object-cover" /> : <Icon name="camera" size={22} />}
                    </button>
                    <div className="text-[12.5px] space-y-1">
                      {photo ? (
                        photo.passed ? (
                          <>
                            <p className="text-teal font-semibold flex items-center gap-1.5"><Icon name="check" size={13} /> Suitable for a profile photo</p>
                            <p className="font-mono text-[11px] text-chalk/45">brightness {photo.brightness} · detail {photo.contrast}</p>
                          </>
                        ) : (
                          <p className="text-blood flex items-center gap-1.5"><Icon name="alert" size={13} /> {photo.reasons[0]}</p>
                        )
                      ) : (
                        <p className="text-chalk/50">Upload a clear, well-lit photo of your face.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* liveness */}
                <div className="rounded-2xl border border-chalk/12 bg-court-850/70 p-5">
                  <p className="flex items-center gap-2 font-display font-bold text-[14px]"><Icon name="eye" size={16} className="text-gold" /> 3 · Liveness selfie</p>
                  <p className="mt-1.5 text-[12.5px] text-chalk/50">Hold to simulate the guided selfie (turn head / blink). This binds the submission to a live human, matched against the document portrait.</p>
                  <div className="mt-3">
                    {liveness ? (
                      <p className="rounded-lg border border-lime/25 bg-lime/6 px-3.5 py-2.5 text-[12.5px] text-lime font-semibold flex items-center gap-2"><Icon name="check" size={14} /> Liveness passed — face match 98.2%</p>
                    ) : (
                      <HumanCheck onPass={() => setLiveness(true)} />
                    )}
                  </div>
                </div>
              </div>

              {/* pipeline + result */}
              <div className="space-y-5">
                <div className="rounded-2xl border border-chalk/12 bg-court-850/70 p-5">
                  <p className="flex items-center gap-2 font-display font-bold text-[14px]"><Icon name="radar" size={16} className="text-lime" /> Provider pipeline</p>
                  <div className="mt-4">
                    <VerifyPipeline stage={running ? stage : result ? 5 : -1} />
                  </div>
                  <Button className="mt-5 w-full" size="lg" icon={running ? "clock" : "shieldCheck"} disabled={!docScanned || !liveness || !photo?.passed || running} onClick={runVerification}>
                    {running ? "Verifying…" : "Run identity verification"}
                  </Button>
                  {(!docScanned || !liveness || !photo?.passed) && !running && (
                    <p className="mt-2.5 text-[11.5px] text-chalk/40 text-center">Requires: scanned document + passed photo pre-check + liveness.</p>
                  )}
                </div>

                {result && (
                  <div className={`anim-fadeUp rounded-2xl border-2 p-5 ${result.state === "VERIFIED" ? "border-lime/50 bg-lime/8" : result.state === "NEEDS_REVIEW" ? "border-gold/50 bg-gold/8" : "border-blood/50 bg-blood/8"}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-display font-extrabold text-lg tracking-tight">{result.label}</p>
                      <span className="font-mono text-[12px] text-chalk/50">match {(result.ratio * 100).toFixed(0)}% / threshold {(NAME_MATCH_THRESHOLD * 100).toFixed(0)}%</span>
                    </div>
                    <p className="mt-1.5 text-[13px] text-chalk/65 leading-relaxed">{result.note}</p>
                    <div className="mt-3 text-[12.5px] text-chalk/55">
                      <p>Submitted: <span className="font-mono text-chalk">{fullName}</span></p>
                      <p>Document: <span className="font-mono text-chalk">{docName}</span></p>
                    </div>
                    <p className="mt-3 text-[11.5px] text-chalk/40 leading-relaxed">
                      {result.state === "VERIFIED"
                        ? "Only the verification result, provider reference and timestamp are stored — never the raw document. “Dragon Slayer 999” would not have made it here."
                        : result.state === "NEEDS_REVIEW"
                          ? "Routed to a human reviewer. The account stays usable with limited trust features — no automatic punishment."
                          : "You can retry with correct details. Repeated failures raise a fraud-risk signal for review, not an instant ban."}
                    </p>
                  </div>
                )}

                {result && result.state !== "REJECTED" && (
                  <Button size="lg" className="w-full" icon="arrow" onClick={finish}>
                    {result.state === "NEEDS_REVIEW" ? "Enter with review-pending status" : `Enter RallyPoint as a ${role}`}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6"><Button variant="ghost" onClick={() => setStep(2)}>Back</Button></div>
          </div>
        )}
      </div>
    </div>
  );
}
