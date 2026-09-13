import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { VerifyState } from "../lib/engine";

/* ============================================================
   RallyPoint design system — custom inline SVG icons, controls,
   charts. No third-party icon fonts.
   ============================================================ */

export type IconName =
  | "ball" | "paddle" | "court" | "shield" | "shieldCheck" | "radar" | "dna"
  | "users" | "calendar" | "bell" | "chat" | "trophy" | "pin" | "search"
  | "filter" | "check" | "x" | "arrow" | "spark" | "clock" | "trend"
  | "zap" | "target" | "gauge" | "id" | "camera" | "lock" | "doc" | "alert"
  | "star" | "heart" | "sun" | "wave" | "eye" | "flag" | "gear" | "logout"
  | "home" | "grid" | "chart" | "plus" | "minus" | "chevD" | "globe" | "flame"
  | "mail" | "phone";

const PATHS: Record<IconName, React.ReactNode> = {
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <path d="M8.4 3.6 10 7.2c.3.7.1 1.4-.4 1.9l-1.3 1.2a13.6 13.6 0 0 0 5.4 5.4l1.2-1.3c.5-.5 1.2-.7 1.9-.4l3.6 1.6c.8.4 1.2 1.3.9 2.1l-.8 2.2c-.3.8-1 1.3-1.9 1.2C10.6 20.6 3.4 13.4 2.9 5.4c-.1-.9.4-1.6 1.2-1.9l2.2-.8c.8-.3 1.7.1 2.1.9Z" />
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9.4" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="8.4" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="14.6" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.4" cy="13.6" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  paddle: (
    <>
      <path d="M14.5 3.2a6.6 6.6 0 0 1 4.7 8 6.7 6.7 0 0 1-6.4 4.9l-1.2 4.2a1.3 1.3 0 0 1-2.5-.2l-.4-4.4a6.7 6.7 0 0 1 5.8-12.5Z" />
      <path d="M11 20.5 10 22" />
    </>
  ),
  court: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" />
      <path d="M12 4.5v15M6.5 12h11M3.5 9.5h17M3.5 14.5h17" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.6 3 8.3 7 9.5 4-1.2 7-4.9 7-9.5V6l-7-3Z" />,
  shieldCheck: (
    <>
      <path d="M12 3 5 6v5c0 4.6 3 8.3 7 9.5 4-1.2 7-4.9 7-9.5V6l-7-3Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.6" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l6-6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  dna: (
    <>
      <path d="M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9s8 5 8 9" />
      <path d="M8.6 6.5h6.8M8.6 17.5h6.8M9.5 12h5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5" />
      <path d="M15.5 5.8a3.2 3.2 0 0 1 0 5.4M17.5 14.9c1.6.7 2.7 2.2 3 4.6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <circle cx="8" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  bell: (
    <>
      <path d="M12 4a5.5 5.5 0 0 1 5.5 5.5c0 4.2 1.5 5.5 1.5 5.5H5s1.5-1.3 1.5-5.5A5.5 5.5 0 0 1 12 4Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </>
  ),
  chat: <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4h-1A2.5 2.5 0 0 1 4 13.5v-7Z" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H4.5c0 3.5 1.5 5.5 3.8 5.8M16 5h3.5c0 3.5-1.5 5.5-3.8 5.8" />
      <path d="M12 13v3.5M8.5 20h7M10 16.5h4l.8 3.5H9.2l.8-3.5Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.3" r="2.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15.5 15.5 4.5 4.5" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  spark: <path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  trend: <path d="M3.5 17.5 9 12l3.5 3.5 7.5-8M15 7.5h5v5" />,
  zap: <path d="M13 3 5 13.5h5.5L10 21l8-10.5h-5.5L13 3Z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.8" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 16.5a8.5 8.5 0 1 1 16 0" />
      <path d="m12 16 4-6.5" />
      <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  id: (
    <>
      <rect x="3" y="5.5" width="18" height="13" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 15.8c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4M14 9.5h5M14 12.5h5M14 15.5h3" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2.5h6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-8Z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  doc: (
    <>
      <path d="M6.5 3.5h7.5l4 4v13H6.5v-17Z" />
      <path d="M14 3.5V8h4M9.5 12h5.5M9.5 15.5h5.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4L12 4Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  star: <path d="m12 3.8 2.4 5 5.6.7-4.1 3.8 1.1 5.5-5-2.8-5 2.8 1.1-5.5L4 9.5l5.6-.7 2.4-5Z" />,
  heart: <path d="M12 20s-7.5-4.7-7.5-10A4.4 4.4 0 0 1 12 7.6 4.4 4.4 0 0 1 19.5 10c0 5.3-7.5 10-7.5 10Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  wave: <path d="M3 14c2-4 4-4 6 0s4 4 6 0 4-4 6 0M3 8.5c2-4 4-4 6 0" />,
  eye: (
    <>
      <path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  flag: <path d="M5.5 21V4.5M5.5 5c4-2.4 8 2.4 12.5 0v9c-4.5 2.4-8.5-2.4-12.5 0" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5 13 6h-2l1-2.5ZM12 20.5 11 18h2l-1 2.5ZM3.5 12 6 11v2l-2.5-1ZM20.5 12 18 13v-2l2.5 1ZM6 6l2.3 1.2L6.9 8.6 6 6ZM18 18l-2.3-1.2 1.4-1.4L18 18ZM18 6l-1.2 2.3-1.4-1.4L18 6ZM6 18l1.2-2.3 1.4 1.4L6 18Z" />
    </>
  ),
  logout: <path d="M14 4H6v16h8M10 12h10M16.5 8.5 20 12l-3.5 3.5" />,
  home: <path d="m4 11 8-7 8 7v9.5H4V11ZM9.5 20.5v-6h5v6" />,
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" />
    </>
  ),
  chart: <path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chevD: <path d="m6 9.5 6 6 6-6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5S14.6 18.1 12 20.5C9.4 18.1 8.1 15.3 8.1 12S9.4 5.9 12 3.5Z" />
    </>
  ),
  flame: <path d="M12 3c1 3-3.5 5-3.5 9a5.5 5.5 0 0 0 11 0c0-2.5-1.2-4-2.5-5.5.2 2-.8 3-1.8 3.4C16 7.5 14.5 4.5 12 3ZM9.5 14.5a2.5 2.5 0 0 0 5 0c0-1.5-1.2-2.3-2.5-3.6-1.3 1.3-2.5 2.1-2.5 3.6Z" />,
};

export function Icon({ name, size = 18, className = "", strokeWidth = 1.7 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className="relative grid place-items-center w-9 h-9 rounded-full bg-lime text-court-950 shadow-[0_0_24px_-4px_rgba(200,241,63,0.6)]">
        <Icon name="ball" size={22} strokeWidth={1.9} />
      </span>
      {!compact && (
        <span className="font-display font-extrabold tracking-tight text-[17px] leading-none">
          Rally<span className="text-lime">Point</span>
        </span>
      )}
    </span>
  );
}

/* ---------------- buttons ---------------- */
export function Button({
  children, variant = "primary", size = "md", className = "", icon, onClick, disabled, type = "button",
}: {
  children?: React.ReactNode; variant?: "primary" | "ghost" | "outline" | "dark" | "danger"; size?: "sm" | "md" | "lg";
  className?: string; icon?: IconName; onClick?: (e: React.MouseEvent) => void; disabled?: boolean; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-2 font-display font-bold tracking-tight transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime";
  const sizes = { sm: "text-[13px] px-3.5 py-2 rounded-lg", md: "text-sm px-5 py-2.5 rounded-xl", lg: "text-[15px] px-7 py-3.5 rounded-xl" };
  const variants = {
    primary: "bg-lime text-court-950 hover:bg-[#d8fa63] shadow-[0_8px_24px_-8px_rgba(200,241,63,0.55)]",
    ghost: "text-chalk/80 hover:text-chalk hover:bg-chalk/8",
    outline: "border border-chalk/20 text-chalk hover:border-lime/60 hover:text-lime bg-transparent",
    dark: "bg-court-800 text-chalk border border-chalk/10 hover:border-chalk/25",
    danger: "bg-blood/15 text-blood border border-blood/30 hover:bg-blood/25",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
    </button>
  );
}

/* ---------------- badges & status ---------------- */
export function Chip({ children, tone = "dim", className = "" }: { children: React.ReactNode; tone?: "lime" | "teal" | "gold" | "clay" | "blood" | "dim"; className?: string }) {
  const tones = {
    lime: "bg-lime/12 text-lime border-lime/25",
    teal: "bg-teal/12 text-teal border-teal/25",
    gold: "bg-gold/12 text-gold border-gold/25",
    clay: "bg-clay/12 text-clay border-clay/25",
    blood: "bg-blood/12 text-blood border-blood/30",
    dim: "bg-chalk/6 text-chalk/70 border-chalk/12",
  };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] font-semibold tracking-wide ${tones[tone]} ${className}`}>{children}</span>;
}

export function VerifyBadge({ state = "VERIFIED", size = "sm" }: { state?: VerifyState; size?: "sm" | "md" }) {
  const map: Record<VerifyState, { icon: IconName; label: string; cls: string }> = {
    VERIFIED: { icon: "shieldCheck", label: "Identity Verified", cls: "text-lime bg-lime/10 border-lime/30" },
    IN_PROGRESS: { icon: "clock", label: "Verifying…", cls: "text-gold bg-gold/10 border-gold/30" },
    NEEDS_REVIEW: { icon: "eye", label: "In manual review", cls: "text-gold bg-gold/10 border-gold/30" },
    NOT_STARTED: { icon: "id", label: "Verification required", cls: "text-chalk/60 bg-chalk/5 border-chalk/15" },
    REJECTED: { icon: "alert", label: "Verification failed", cls: "text-blood bg-blood/10 border-blood/30" },
    EXPIRED: { icon: "alert", label: "Verification expired", cls: "text-clay bg-clay/10 border-clay/30" },
  };
  const m = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${size === "sm" ? "px-2 py-0.5 text-[10.5px]" : "px-3 py-1 text-xs"} ${m.cls}`}>
      <Icon name={m.icon} size={size === "sm" ? 12 : 14} />
      {m.label}
    </span>
  );
}

/* ---------------- avatar ---------------- */
export function Avatar({ name, hue, size = 40, verified = false }: { name: string; hue: number; size?: number; verified?: boolean }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="relative inline-grid place-items-center shrink-0 rounded-full font-display font-bold" style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${hue} 45% 26%), hsl(${hue} 55% 15%))`, color: `hsl(${hue} 85% 72%)`, fontSize: size * 0.34, border: `1.5px solid hsl(${hue} 50% 38%)` }}>
      {initials}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-lime text-court-950" style={{ width: size * 0.38, height: size * 0.38 }}>
          <Icon name="check" size={size * 0.24} strokeWidth={2.6} />
        </span>
      )}
    </span>
  );
}

/* ---------------- cards & layout ---------------- */
export function Card({ children, className = "", hover = false, onClick }: { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-chalk/10 bg-court-850/80 backdrop-blur-sm ${hover ? "transition-all duration-300 hover:-translate-y-1 hover:border-lime/30 hover:shadow-lift cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHead({ kicker, title, sub, light = false }: { kicker: string; title: React.ReactNode; sub?: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={`font-mono text-[11px] tracking-[0.28em] uppercase mb-3 ${light ? "text-lime-3" : "text-lime"}`}>
        <span className="inline-block w-6 h-px bg-current align-middle mr-2" />
        {kicker}
      </p>
      <h2 className={`font-display font-black tracking-tight text-3xl sm:text-4xl leading-[1.02] ${light ? "text-ink" : "text-chalk"}`}>{title}</h2>
      {sub && <p className={`mt-4 text-[15px] leading-relaxed ${light ? "text-ink/70" : "text-chalk/60"}`}>{sub}</p>}
    </div>
  );
}

/* ---------------- form field ---------------- */
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-semibold tracking-wide text-chalk/75">{label}</span>
        {hint && !error && <span className="text-[11px] text-chalk/40">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[12px] text-blood">
          <Icon name="alert" size={13} /> {error}
        </span>
      )}
    </label>
  );
}

export const inputCls = "w-full rounded-xl bg-court-900/90 border border-chalk/12 px-3.5 py-2.5 text-sm text-chalk placeholder:text-chalk/30 focus:outline-none focus:border-lime/60 focus:ring-2 focus:ring-lime/15 transition";

/* ---------------- modal ---------------- */
export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-court-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`anim-fadeUp relative w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border border-chalk/12 bg-court-850 shadow-lift max-h-[88vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="font-display font-extrabold text-lg tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-chalk/50 hover:text-chalk hover:bg-chalk/8 transition" aria-label="Close dialog">
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- tabs ---------------- */
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-court-900 border border-chalk/10 gap-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-display font-bold tracking-tight transition-all ${active === t.id ? "bg-lime text-court-950 shadow" : "text-chalk/55 hover:text-chalk"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- gauges & charts (pure SVG) ---------------- */
export function Gauge({ value, size = 120, label, tone = "lime" }: { value: number; size?: number; label?: string; tone?: "lime" | "teal" | "gold" | "clay" }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.72;
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 120);
    return () => clearTimeout(t);
  }, [value]);
  const colors = { lime: "#c8f13f", teal: "#3ecfad", gold: "#f2c14e", clay: "#ff7a45" };
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} className="-rotate-[216deg]">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(241,245,232,0.09)" strokeWidth="9" strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={colors[tone]} strokeWidth="9" strokeDasharray={`${(arc * v) / 100} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.22,1,0.36,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono font-bold text-[26px] leading-none" style={{ color: colors[tone] }}>{value}</div>
          {label && <div className="text-[10px] uppercase tracking-widest text-chalk/45 mt-1">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function Radar({ data, size = 240, stroke = "#c8f13f", fill = "rgba(200,241,63,0.14)", labels = true }: { data: { label: string; value: number }[]; size?: number; stroke?: string; fill?: string; labels?: boolean }) {
  const n = data.length;
  const cx = size / 2, cy = size / 2;
  const R = size / 2 - (labels ? 34 : 12);
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)] as const;
  };
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setScale(1), 150);
    return () => clearTimeout(t);
  }, []);
  const poly = data.map((d, i) => pt(i, d.value * scale).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }}>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon key={g} points={data.map((_, i) => pt(i, g * 100).join(",")).join(" ")} fill="none" stroke="rgba(241,245,232,0.09)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(241,245,232,0.07)" strokeWidth="1" />;
      })}
      <polygon points={poly} fill={fill} stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" style={{ transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)" }} />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value * scale);
        return <circle key={i} cx={x} cy={y} r="3" fill={stroke} style={{ transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)" }} />;
      })}
      {labels &&
        data.map((d, i) => {
          const [x, y] = pt(i, 124);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="rgba(241,245,232,0.6)" fontSize="9.5" fontFamily="Space Mono, monospace">
              {d.label}
            </text>
          );
        })}
    </svg>
  );
}

export function Spark({ values, width = 130, height = 40, stroke = "#c8f13f" }: { values: number[]; width?: number; height?: number; stroke?: string }) {
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 6) + 3, height - 5 - ((v - min) / (max - min || 1)) * (height - 10)] as const);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <path d={`${d} L${last[0]},${height} L3,${height} Z`} fill={stroke} opacity="0.09" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3.2" fill={stroke} />
    </svg>
  );
}

export function Bars({ values, labels, height = 120, tone = "lime" }: { values: number[]; labels?: string[]; height?: number; tone?: "lime" | "teal" }) {
  const max = Math.max(...values);
  const colors = { lime: "#c8f13f", teal: "#3ecfad" };
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          {hover === i && <span className="font-mono text-[10px] text-chalk/80">{v}</span>}
          <div className="w-full rounded-t-md bar-grow transition-opacity" style={{ height: `${(v / max) * 78}%`, background: hover === i ? colors[tone] : `${colors[tone]}55`, animationDelay: `${i * 45}ms`, minWidth: 8 }} />
          {labels && <span className="font-mono text-[9px] text-chalk/35">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

export function HeatCell({ pct }: { pct: number }) {
  const a = pct / 100;
  const bg = pct < 30 ? `rgba(255,122,69,${0.14 + a})` : pct < 60 ? `rgba(242,193,78,${0.16 + a * 0.5})` : `rgba(200,241,63,${0.18 + a * 0.7})`;
  return <div className="h-7 rounded-[5px] grid place-items-center font-mono text-[9.5px] transition-transform hover:scale-110 cursor-default" style={{ background: bg, color: pct > 55 ? "#0c1b14" : "rgba(241,245,232,0.75)" }} title={`${pct}% utilized`}>{pct}</div>;
}

/* ---------------- counters & reveals ---------------- */
export function CountUp({ to, suffix = "", duration = 1200, className = "" }: { to: number; suffix?: string; duration?: number; className?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (reduced) { setV(to); return; }
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className={className}>{v.toLocaleString()}{suffix}</span>;
}

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------- toasts ---------------- */
interface Toast { id: number; title: string; body?: string; icon?: IconName; tone?: "lime" | "gold" | "blood" | "teal" }
const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4600);
  }, []);
  const tones = { lime: "border-lime/40 text-lime", gold: "border-gold/40 text-gold", blood: "border-blood/40 text-blood", teal: "border-teal/40 text-teal" };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(92vw,360px)]" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`anim-toast rounded-xl border bg-court-850/95 backdrop-blur px-4 py-3 shadow-lift flex gap-3 ${tones[t.tone ?? "lime"]}`}>
            <span className="mt-0.5"><Icon name={t.icon ?? "spark"} size={17} /></span>
            <div className="min-w-0">
              <p className="font-display font-bold text-[13.5px] text-chalk tracking-tight">{t.title}</p>
              {t.body && <p className="text-[12px] text-chalk/60 mt-0.5 leading-snug">{t.body}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- misc ---------------- */
export function StatPill({ icon, label, value, tone = "lime" }: { icon: IconName; label: string; value: React.ReactNode; tone?: "lime" | "teal" | "gold" | "clay" }) {
  const tones = { lime: "text-lime", teal: "text-teal", gold: "text-gold", clay: "text-clay" };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-chalk/10 bg-court-900/70 px-4 py-3">
      <span className={tones[tone]}><Icon name={icon} size={19} /></span>
      <div>
        <div className="font-mono font-bold text-[17px] leading-none text-chalk">{value}</div>
        <div className="text-[10.5px] uppercase tracking-widest text-chalk/40 mt-1">{label}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto w-14 h-14 rounded-2xl border border-dashed border-chalk/20 grid place-items-center text-chalk/35 mb-4">
        <Icon name={icon} size={24} />
      </div>
      <p className="font-display font-bold tracking-tight">{title}</p>
      <p className="text-[13px] text-chalk/50 mt-1 max-w-xs mx-auto">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
