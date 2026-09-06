/* ============================================================
   RallyPoint core engine — deterministic, testable logic.
   In production these run server-side (/api/v1/...) with the
   client as a thin consumer. Nothing security-critical here is
   trusted from the client alone.
   ============================================================ */

export type Role = "player" | "club";
export type VerifyState = "NOT_STARTED" | "IN_PROGRESS" | "VERIFIED" | "NEEDS_REVIEW" | "REJECTED" | "EXPIRED";

export interface PlayerProfile {
  id: string;
  name: string;
  city: string;
  km: number; // distance from viewer
  rating: number;
  level: string; // DUPR-like label
  position: string;
  style: string;
  hand: "Right" | "Left";
  formats: string[];
  days: string[]; // availability
  window: string; // preferred time window
  reliability: number; // 0-100
  sportsmanship: number;
  wins: number;
  losses: number;
  streak: number;
  form: number; // recent form -1..1
  clubs: string[];
  trust: string[];
  dna: DnaVector;
  avatarHue: number;
  verified: boolean;
  photoVerified: boolean;
}

export interface DnaVector {
  aggression: number;
  consistency: number;
  speed: number;
  defense: number;
  placement: number;
  netPlay: number;
  patience: number;
  variety: number;
}

export const DNA_LABELS: { key: keyof DnaVector; label: string }[] = [
  { key: "aggression", label: "Aggression" },
  { key: "consistency", label: "Consistency" },
  { key: "speed", label: "Speed" },
  { key: "defense", label: "Defense" },
  { key: "placement", label: "Placement" },
  { key: "netPlay", label: "Net play" },
  { key: "patience", label: "Patience" },
  { key: "variety", label: "Shot variety" },
];

export interface ClubInfo {
  id: string;
  name: string;
  area: string;
  km: number;
  indoor: boolean;
  outdoor: boolean;
  courts: number;
  surface: string;
  members: number;
  activeWeekly: number;
  levels: string[];
  days: string[];
  window: string;
  formats: string[];
  fee: string;
  verified: boolean;
  locationVerified: boolean;
  official: boolean;
  health: number;
  activity: number; // 0-100
  cover: string;
  hue: number;
  blurb: string;
  utilization: number; // avg %
}

export interface EventChatMessage {
  id: string;
  author: string;
  playerId: string; // "sys" for system, "org" for organizer
  time: string;
  text?: string;
  receipt?: { fileName: string };
}

export interface BracketMatch {
  id: string;
  round: number;
  idx: number;
  a: string | null;
  b: string | null;
  winner: "a" | "b" | null;
  losers?: boolean;
}

export interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  type: string;
  day: string;
  date: string;
  time: string;
  capacity: number;
  filled: number;
  level: string;
  fee: number;
  organizer: string;
  waitlist: number;
  outdoor: boolean;
  rainRisk?: number;
  elimination?: "single" | "double";
  pairing?: "blind" | "pair";
  chatOpen?: boolean;
  chat?: EventChatMessage[];
  participants?: string[];
  paid?: string[];
}

/* ---------------------------------------------------------------
   TOURNAMENT PIPELINE — shuffle, bracket build, advancement.
   Blind pairing shuffles paid players; "By Pair" keeps
   registration order. Double elimination routes losers bracket
   drops per standard layout.
--------------------------------------------------------------- */
export function shufflePairs(ids: string[], mode: "blind" | "pair"): [string, string][] {
  const pool = [...ids];
  if (mode === "blind") {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  const pairs: [string, string][] = [];
  for (let i = 0; i + 1 < pool.length; i += 2) pairs.push([pool[i], pool[i + 1]]);
  if (pool.length % 2 === 1) pairs.push([pool[pool.length - 1], "BYE"]);
  return pairs;
}

export function generateBracket(pairs: [string, string][], elimination: "single" | "double"): BracketMatch[] {
  const P = 2 ** Math.max(1, Math.ceil(Math.log2(Math.max(2, pairs.length))));
  const padded: [string, string][] = [...pairs];
  while (padded.length < P) padded.push(["BYE", "BYE"]);
  const R = Math.round(Math.log2(P));
  const out: BracketMatch[] = [];
  for (let r = 0; r < R; r++) {
    const count = P / 2 ** (r + 1);
    for (let i = 0; i < count; i++) {
      const m: BracketMatch = { id: `w${r}-${i}`, round: r, idx: i, a: null, b: null, winner: null };
      if (r === 0) {
        m.a = padded[i * 2][0];
        m.b = padded[i * 2][1];
        if (m.a === "BYE") m.winner = "b";
        else if (m.b === "BYE") m.winner = "a";
      }
      out.push(m);
    }
  }
  if (elimination === "double" && R >= 2) {
    const L = 2 * R - 3;
    for (let j = 0; j <= L; j++) {
      const count = Math.max(1, Math.floor(P / 2 ** (Math.floor(j / 2) + 2)));
      for (let i = 0; i < count; i++) out.push({ id: `l${j}-${i}`, round: j, idx: i, a: null, b: null, winner: null, losers: true });
    }
    out.push({ id: "gf", round: L + 1, idx: 0, a: null, b: null, winner: null, losers: true });
  }
  // auto-advance byes from round zero
  out.forEach((m) => {
    if (m.round === 0 && !m.losers && m.winner && (m.a === "BYE" || m.b === "BYE")) {
      const w = (m.winner === "a" ? m.a : m.b)!;
      const t = out.find((x) => x.id === `w1-${Math.floor(m.idx / 2)}`);
      const slot = m.idx % 2 === 0 ? "a" : "b";
      if (t && !t[slot]) t[slot] = w;
    }
  });
  return out;
}

export function advanceBracket(br: BracketMatch[], id: string, side: "a" | "b"): { bracket: BracketMatch[]; champion: string | null } {
  const b = br.map((m) => ({ ...m }));
  const m = b.find((x) => x.id === id);
  if (!m || m.winner) return { bracket: b, champion: null };
  const winner = side === "a" ? m.a : m.b;
  const loser = side === "a" ? m.b : m.a;
  if (!winner || winner === "BYE" || !loser || loser === "BYE") return { bracket: b, champion: null };
  m.winner = side;
  const hasGF = b.some((x) => x.id === "gf");
  const R = Math.max(...b.filter((x) => !x.losers).map((x) => x.round)) + 1;
  const lastL = hasGF ? Math.max(...b.filter((x) => x.losers && x.id !== "gf").map((x) => x.round)) : -1;
  const put = (tid: string, slot: "a" | "b", name: string) => {
    const t = b.find((x) => x.id === tid);
    if (t && !t[slot]) t[slot] = name;
  };
  let champion: string | null = null;
  if (!m.losers) {
    if (m.round < R - 1) put(`w${m.round + 1}-${Math.floor(m.idx / 2)}`, m.idx % 2 === 0 ? "a" : "b", winner);
    else if (hasGF) put("gf", "a", winner);
    else champion = winner;
    if (hasGF) {
      if (m.round === 0) put(`l0-${Math.floor(m.idx / 2)}`, m.idx % 2 === 0 ? "a" : "b", loser);
      else if (2 * m.round - 1 <= lastL) put(`l${2 * m.round - 1}-${m.idx}`, "b", loser);
    }
  } else if (m.id === "gf") {
    champion = winner;
  } else {
    if (m.round === lastL) put("gf", "b", winner);
    else if (m.round % 2 === 0) put(`l${m.round + 1}-${m.idx}`, "a", winner);
    else put(`l${m.round + 1}-${Math.floor(m.idx / 2)}`, m.idx % 2 === 0 ? "a" : "b", winner);
  }
  return { bracket: b, champion };
}

/* ---------------------------------------------------------------
   NAME SANITY — heuristic pre-screen (server repeats this).
   Rejects keyboard rows, repeats, digits, leet, junk strings.
--------------------------------------------------------------- */
const KEYBOARD_RUNS = ["qwerty", "asdfgh", "zxcvbn", "asdf", "qwer", "zxcv", "1234", "abcd", "abcdef", "abcde"];

export function nameSanity(raw: string): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const name = raw.trim();
  const lower = name.toLowerCase();
  const tokens = lower.split(/\s+/).filter(Boolean);

  if (name.length < 2) reasons.push("Name is too short.");
  if (/\d/.test(name)) reasons.push("Names can't contain digits.");
  if (/[!@#$%^&*()_+=\[\]{}<>?/\\|~`]/.test(name)) reasons.push("Names can't contain symbols.");
  if (tokens.length > 4) reasons.push("Too many name parts.");

  for (const t of tokens) {
    if (t.length === 1 && tokens.length > 1 && t !== tokens[tokens.length - 1]) continue; // initials ok
    if (t.length < 2) reasons.push(`“${t}” is too short to be a real name.`);
    if (KEYBOARD_RUNS.some((k) => t.includes(k))) reasons.push(`“${t}” looks like a keyboard pattern.`);
    if (/(.)\1{2,}/.test(t)) reasons.push(`“${t}” has suspicious repeated characters.`);
    const vowels = (t.match(/[aeiouyáéíóúàèìòùäëïöüâêîôû]/g) || []).length;
    if (t.length >= 4 && vowels === 0) reasons.push(`“${t}” has no vowels — unlikely to be a real name.`);
    if (/^(test|xxx+|foo|bar|null|none|n\/a|na)$/i.test(t)) reasons.push(`“${t}” looks like a placeholder.`);
    if (/^[a-z]\.[a-z]$/.test(t)) reasons.push(`“${t}” looks like a random string.`);
  }
  // same letter run across the whole name, e.g. "aaaaa"
  if (new Set(lower.replace(/[^a-z]/g, "").split("")).size <= 1 && lower.length > 2)
    reasons.push("A single repeated letter isn't a valid name.");

  return { ok: reasons.length === 0, reasons: [...new Set(reasons)] };
}

/* ---------------------------------------------------------------
   IDENTITY NAME MATCHING — token-based fuzzy comparison of
   submitted name vs. document name. Tolerates middle names,
   accents, casing, hyphens, transliteration-ish noise.
--------------------------------------------------------------- */
const ACCENTS: Record<string, string> = { á: "a", à: "a", ä: "a", â: "a", é: "e", è: "e", ë: "e", ê: "e", í: "i", ì: "i", ï: "i", î: "i", ó: "o", ò: "o", ö: "o", ô: "o", ú: "u", ù: "u", ü: "u", û: "u", ñ: "n", ç: "c", ý: "y", ÿ: "y", ø: "o", å: "a", æ: "ae", ß: "ss" };

export function normalizeName(raw: string): string[] {
  return raw
    .toLowerCase()
    .split("")
    .map((c) => ACCENTS[c] ?? c)
    .join("")
    .replace(/[^a-z\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[m][n];
}

export function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const d = levenshtein(a, b);
  return Math.max(0, 1 - d / Math.max(a.length, b.length));
}

/** Match ratio 0..1 — configured policy threshold decides outcome. */
export function nameMatchRatio(submitted: string, document: string): number {
  const sub = normalizeName(submitted);
  const doc = normalizeName(document);
  if (!sub.length || !doc.length) return 0;

  // first + last must align strongly
  const firstSim = tokenSimilarity(sub[0], doc[0]);
  const lastSim = tokenSimilarity(sub[sub.length - 1], doc[doc.length - 1]);

  // middle tokens: each submitted middle token should softly match
  // some document middle token (or be absent — middle-name tolerance).
  const subMid = sub.slice(1, -1);
  const docMid = doc.slice(1, -1);
  let midScore = 1;
  if (subMid.length) {
    const sims = subMid.map((s) => Math.max(...docMid.map((d) => tokenSimilarity(s, d)), 0.35));
    midScore = sims.reduce((a, b) => a + b, 0) / sims.length;
  } else if (docMid.length) {
    midScore = 0.9; // user omitted a middle name — common & acceptable
  }

  return Math.round((firstSim * 0.42 + lastSim * 0.42 + midScore * 0.16) * 100) / 100;
}

export const NAME_MATCH_THRESHOLD = 0.72; // platform policy, server-configured

export function classifyNameMatch(ratio: number): { state: VerifyState; label: string; note: string } {
  if (ratio >= 0.86) return { state: "VERIFIED", label: "Strong match", note: "Submitted name matches the verified document name within policy tolerance." };
  if (ratio >= NAME_MATCH_THRESHOLD) return { state: "VERIFIED", label: "Acceptable match", note: "Matched allowing for middle-name and formatting variation." };
  if (ratio >= 0.55) return { state: "NEEDS_REVIEW", label: "Manual review", note: "Below the automated threshold — routed to a human reviewer. No account penalty." };
  return { state: "REJECTED", label: "Name mismatch", note: "The submitted name doesn't resemble the verified document name." };
}

/* ---------------------------------------------------------------
   PASSWORD + CONTACT VALIDATION
--------------------------------------------------------------- */
export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; issues: string[] } {
  const issues: string[] = [];
  let pts = 0;
  if (pw.length >= 10) pts++;
  else issues.push("Use at least 10 characters.");
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) pts++;
  else issues.push("Mix upper and lower case.");
  if (/\d/.test(pw)) pts++;
  else issues.push("Add a number.");
  if (/[^a-zA-Z0-9]/.test(pw)) pts++;
  else issues.push("Add a symbol.");
  if (/(password|1234|qwerty|rally|letmein)/i.test(pw)) {
    pts = Math.max(0, pts - 2);
    issues.push("Avoid common words and sequences.");
  }
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"] as const;
  return { score: pts as 0 | 1 | 2 | 3 | 4, label: labels[pts], issues };
}

export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
export const validPhone = (p: string) => /^\+?[\d\s()-]{7,18}$/.test(p.trim());

/* ---------------------------------------------------------------
   PROFILE PHOTO PRE-CHECK
   Local luminance/contrast heuristics act as a *pre-screen*;
   the authoritative face-match + liveness decision comes from
   the verification provider. We never claim a client check
   proves identity.
--------------------------------------------------------------- */
export interface PhotoCheck {
  brightness: number;
  contrast: number;
  passed: boolean;
  reasons: string[];
}
export async function analyzePhoto(file: File): Promise<PhotoCheck> {
  const reasons: string[] = [];
  let brightness = 0, contrast = 0;
  try {
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("img"));
      img.src = url;
    });
    const c = document.createElement("canvas");
    const s = 48;
    c.width = s; c.height = s;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, s, s);
    const d = ctx.getImageData(0, 0, s, s).data;
    let sum = 0; const lums: number[] = [];
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      lums.push(l); sum += l;
    }
    brightness = sum / lums.length;
    const mean = brightness;
    contrast = Math.sqrt(lums.reduce((a, l) => a + (l - mean) ** 2, 0) / lums.length);
    URL.revokeObjectURL(url);
  } catch {
    reasons.push("Couldn't read the image file.");
  }
  if (brightness < 42) reasons.push("Image is too dark — improve lighting.");
  if (brightness > 235) reasons.push("Image is overexposed.");
  if (contrast < 26) reasons.push("Very low detail — looks blank or heavily blurred.");
  if (!file.type.startsWith("image/")) reasons.push("Only image files are accepted.");
  if (file.size > 8 * 1024 * 1024) reasons.push("Max upload size is 8 MB.");
  return { brightness: Math.round(brightness), contrast: Math.round(contrast), passed: reasons.length === 0, reasons };
}

/* ---------------------------------------------------------------
   SMART PLAYER → CLUB MATCHING (explained, not opaque)
--------------------------------------------------------------- */
export interface MatchReason { text: string; weight: number }
export function clubMatchScore(p: Pick<PlayerProfile, "days" | "window" | "formats" | "km"> & { level: string }, c: ClubInfo): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [];
  let score = 0;

  const distScore = p.km !== undefined ? Math.max(0, 1 - (c.km - 1) / 14) : 0.6;
  score += distScore * 22;
  if (c.km <= 5) reasons.push({ text: `${c.km} km from you`, weight: Math.round(distScore * 22) });
  else reasons.push({ text: `${c.km} km away — within driving range`, weight: Math.round(distScore * 22) });

  const levelFit = c.levels.some((l) => l === p.level) ? 1 : c.levels.length ? 0.45 : 0.3;
  score += levelFit * 24;
  if (levelFit === 1) reasons.push({ text: `Active ${p.level.toLowerCase()} community`, weight: 24 });
  else reasons.push({ text: "Skill levels partially overlap", weight: Math.round(levelFit * 24) });

  const sharedDays = p.days.filter((d) => c.days.includes(d));
  const dayScore = p.days.length ? sharedDays.length / p.days.length : 0.5;
  score += dayScore * 20;
  if (sharedDays.length) reasons.push({ text: `Plays ${sharedDays.slice(0, 3).join("/")} — matches your availability`, weight: Math.round(dayScore * 20) });

  const windowFit = p.window === c.window ? 1 : 0.45;
  score += windowFit * 12;
  if (windowFit === 1) reasons.push({ text: `${c.window} sessions — your preferred window`, weight: 12 });

  const fmt = p.formats.filter((f) => c.formats.includes(f));
  const fmtScore = p.formats.length ? fmt.length / p.formats.length : 0.5;
  score += fmtScore * 14;
  if (fmt.length) reasons.push({ text: `Runs ${fmt.join(" & ").toLowerCase()}`, weight: Math.round(fmtScore * 14) });

  score += (c.activity / 100) * 8;
  if (c.activity >= 70) reasons.push({ text: `High weekly activity (${c.activeWeekly} active players)`, weight: 8 });

  return { score: Math.min(99, Math.round(score)), reasons: reasons.sort((a, b) => b.weight - a.weight).slice(0, 4) };
}

/* ---------------------------------------------------------------
   FAIR MATCH ENGINE — competitive balance beyond raw rating.
--------------------------------------------------------------- */
export interface FairMatchResult {
  opponent: PlayerProfile;
  compat: number;
  balance: number;
  reasons: string[];
}
export function fairMatch(me: PlayerProfile, pool: PlayerProfile[]): FairMatchResult[] {
  return pool
    .filter((o) => o.id !== me.id)
    .map((o) => {
      const ratingGap = Math.abs(me.rating - o.rating);
      const ratingFit = Math.max(0, 1 - ratingGap / 260);

      const formGap = Math.abs(me.form - o.form);
      const formFit = 1 - formGap * 0.5;

      const days = me.days.filter((d) => o.days.includes(d)).length;
      const schedFit = Math.min(1, 0.3 + days * 0.25);

      const fmt = me.formats.filter((f) => o.formats.includes(f)).length ? 1 : 0.4;

      const styleComp = 1 - Math.abs(me.dna.aggression - o.dna.aggression) / 160 - Math.abs(me.dna.patience - o.dna.patience) / 240;

      const reliability = (o.reliability + o.sportsmanship) / 200;

      const compat = Math.round(100 * (ratingFit * 0.3 + formFit * 0.15 + schedFit * 0.15 + fmt * 0.1 + styleComp * 0.12 + reliability * 0.18));

      // Balance: how competitive the game should *feel*
      const balance = Math.round(100 * (ratingFit * 0.55 + formFit * 0.25 + styleComp * 0.2));

      const reasons: string[] = [];
      if (ratingGap <= 60) reasons.push(`Only ${ratingGap} rating points apart`);
      if (days >= 2) reasons.push(`Both free ${me.days.filter((d) => o.days.includes(d)).slice(0, 2).join(" & ")}`);
      if (Math.abs(me.form - o.form) < 0.3) reasons.push("Similar current form");
      if (o.reliability >= 90) reasons.push(`${o.reliability}% attendance reliability`);
      if (fmt) reasons.push(`Both play ${me.formats.filter((f) => o.formats.includes(f))[0].toLowerCase()}`);
      if (Math.abs(me.dna.aggression - o.dna.aggression) < 25) reasons.push("Complementary tempo — neither stalls rallies");

      return { opponent: o, compat: Math.min(98, compat), balance: Math.min(98, balance), reasons: reasons.slice(0, 3) };
    })
    .sort((a, b) => b.compat - a.compat)
    .slice(0, 5);
}

/* ---------------------------------------------------------------
   SKILL BALANCE RADAR (for a proposed foursome)
--------------------------------------------------------------- */
export function skillBalance(ratings: number[]): { label: string; tone: "good" | "ok" | "warn"; note: string; index: number } {
  const sorted = [...ratings].sort((a, b) => a - b);
  const spread = sorted[sorted.length - 1] - sorted[0];
  const index = Math.max(0, Math.round(100 - spread / 4.5));
  if (spread <= 120) return { label: "Good", tone: "good", note: `Skill spread is tight (${spread} pts). Should feel fair for all four.`, index };
  if (spread <= 260) return { label: "Playable", tone: "ok", note: `Moderate ${spread}-point spread — pair strongest with weakest.`, index };
  return { label: "Significant gap", tone: "warn", note: `${spread}-point spread. You can override, but consider splitting the group.`, index };
}

/* ---------------------------------------------------------------
   CLUB HEALTH SCORE — aggregate, privacy-conscious metrics.
--------------------------------------------------------------- */
export interface HealthInput {
  attendance: number; retention: number; eventFill: number; matchCompletion: number; sportsmanship: number; engagement: number; cancelRate: number;
}
export function clubHealth(m: HealthInput): { score: number; parts: { label: string; value: number }[]; recs: string[] } {
  const parts = [
    { label: "Attendance consistency", value: m.attendance },
    { label: "Member retention", value: m.retention },
    { label: "Event fill rate", value: m.eventFill },
    { label: "Match completion", value: m.matchCompletion },
    { label: "Sportsmanship feedback", value: m.sportsmanship },
    { label: "Weekly engagement", value: m.engagement },
  ];
  const base = parts.reduce((a, p) => a + p.value, 0) / parts.length;
  const score = Math.round(Math.min(100, Math.max(5, base - m.cancelRate * 0.35)));
  const recs: string[] = [];
  if (m.attendance < 70) recs.push("Tuesday sessions run 35% lighter than Saturdays — consider adding a beginner-friendly Tuesday event.");
  if (m.eventFill < 75) recs.push("Events fill at " + m.eventFill + "% — opening registration 3 days earlier historically lifts fill ~12%.");
  if (m.retention < 72) recs.push("New-member drop-off peaks at week 3. A 'buddy match' program pairs newcomers with active members.");
  if (m.cancelRate > 10) recs.push("Cancellation rate is " + m.cancelRate + "% — enable the 6-hour waitlist auto-fill to recover those slots.");
  if (!recs.length) recs.push("Healthy across all signals. Consider a monthly ladder reset to keep mid-table players engaged.");
  return { score, parts, recs };
}

/* ---------------------------------------------------------------
   COURT UTILIZATION INTELLIGENCE
--------------------------------------------------------------- */
export interface UtilCell { court: number; day: string; hour: string; pct: number }
export function utilizationInsight(cells: UtilCell[]): string {
  const lows = cells.filter((c) => c.pct < 30);
  const byDay = new Map<string, { sum: number; n: number }>();
  lows.forEach((c) => {
    const e = byDay.get(c.day) ?? { sum: 0, n: 0 };
    e.sum += c.pct; e.n++;
    byDay.set(c.day, e);
  });
  let worst = "", worstAvg = 101;
  byDay.forEach((v, k) => {
    const avg = v.sum / v.n;
    if (avg < worstAvg) { worstAvg = avg; worst = k; }
  });
  return worst
    ? `${worst} slots average ${Math.round(worstAvg)}% utilization. A structured Beginner Open Play in that window typically recovers 40–60% of idle court time.`
    : "Utilization is strong across prime windows — consider adding a waitlisted social session.";
}

/* ---------------------------------------------------------------
   ELO + RANKINGS
--------------------------------------------------------------- */
export function eloDelta(ra: number, rb: number, won: boolean, k = 24): number {
  const expected = 1 / (1 + Math.pow(10, (rb - ra) / 400));
  return Math.round(k * ((won ? 1 : 0) - expected));
}

/* ---------------------------------------------------------------
   ACHIEVEMENTS
--------------------------------------------------------------- */
export interface AchievementDef { id: string; title: string; desc: string; metric: string; threshold: number }
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first", title: "First Rally", desc: "Complete your first recorded match", metric: "games", threshold: 1 },
  { id: "ten", title: "Regular", desc: "Complete 10 recorded matches", metric: "games", threshold: 10 },
  { id: "fifty", title: "Marathoner", desc: "Complete 50 recorded matches", metric: "games", threshold: 50 },
  { id: "tour", title: "Tournament Player", desc: "Enter a sanctioned tournament", metric: "tournaments", threshold: 1 },
  { id: "champ", title: "Podium Finish", desc: "Win a tournament bracket", metric: "titles", threshold: 1 },
  { id: "reliable", title: "Rock Solid", desc: "Reach 95% attendance reliability", metric: "reliability", threshold: 95 },
  { id: "builder", title: "Community Builder", desc: "Bring 3 new verified players to a club", metric: "invites", threshold: 3 },
  { id: "founding", title: "Founding Member", desc: "Join a club within its first month", metric: "founding", threshold: 1 },
  { id: "streak", title: "On Fire", desc: "Play on 10 different days in a row", metric: "streakDays", threshold: 10 },
  { id: "perfect", title: "Perfect Month", desc: "Zero no-shows across 12+ bookings", metric: "perfect", threshold: 1 },
];

/* ---------------------------------------------------------------
   FRAUD RISK ENGINE — signals are weighted, never accusatory.
--------------------------------------------------------------- */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "REVIEW REQUIRED";
export function riskLevel(points: number): RiskLevel {
  if (points < 20) return "LOW";
  if (points < 45) return "MEDIUM";
  if (points < 70) return "REVIEW REQUIRED";
  return "HIGH";
}

export const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
export const fmtInt = (n: number) => n.toLocaleString("en-US");
