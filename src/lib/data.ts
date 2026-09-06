import type { ClubEvent, ClubInfo, DnaVector, PlayerProfile } from "./engine";

const dna = (o: Partial<DnaVector>): DnaVector => ({
  aggression: 55, consistency: 60, speed: 55, defense: 55,
  placement: 60, netPlay: 58, patience: 55, variety: 55, ...o,
});

export const VIEWER: PlayerProfile = {
  id: "me",
  name: "Alex Rivera",
  city: "Riverside District",
  km: 0,
  rating: 1428,
  level: "Intermediate",
  position: "Right stack",
  style: "Control dinker",
  hand: "Right",
  formats: ["Doubles", "Mixed"],
  days: ["Tue", "Thu", "Sat"],
  window: "Evenings",
  reliability: 96,
  sportsmanship: 92,
  wins: 21,
  losses: 13,
  streak: 4,
  form: 0.35,
  clubs: ["Downtown Pickleball Club"],
  trust: ["Reliable", "Good sportsmanship", "Verified player", "Active member"],
  dna: dna({ aggression: 42, consistency: 78, placement: 82, netPlay: 74, patience: 80, speed: 58, defense: 70, variety: 64 }),
  avatarHue: 84,
  verified: true,
  photoVerified: true,
};

export const PLAYERS: PlayerProfile[] = [
  { id: "p1", name: "Maya Chen", city: "Old Harbour", km: 2.1, rating: 1462, level: "Intermediate", position: "Left stack", style: "Aggressive baseliner", hand: "Right", formats: ["Doubles", "Mixed"], days: ["Tue", "Thu", "Sat"], window: "Evenings", reliability: 98, sportsmanship: 95, wins: 30, losses: 14, streak: 6, form: 0.5, clubs: ["Downtown Pickleball Club"], trust: ["Reliable", "Good sportsmanship", "Verified player"], dna: dna({ aggression: 74, speed: 70, netPlay: 66, consistency: 62, patience: 40 }), avatarHue: 160, verified: true, photoVerified: true },
  { id: "p2", name: "Dario Vela", city: "Northgate", km: 3.4, rating: 1391, level: "Intermediate", position: "Right stack", style: "Counter-puncher", hand: "Left", formats: ["Doubles", "Singles"], days: ["Mon", "Wed", "Thu"], window: "Evenings", reliability: 88, sportsmanship: 90, wins: 18, losses: 16, streak: 2, form: -0.1, clubs: ["Northgate Rackets"], trust: ["Verified player", "Active member"], dna: dna({ defense: 76, patience: 72, consistency: 70, aggression: 38 }), avatarHue: 20, verified: true, photoVerified: true },
  { id: "p3", name: "Priya Nair", city: "Riverside District", km: 1.2, rating: 1505, level: "Advanced", position: "Left stack", style: "All-court attacker", hand: "Right", formats: ["Doubles", "Mixed", "Singles"], days: ["Tue", "Wed", "Sat", "Sun"], window: "Mornings", reliability: 94, sportsmanship: 88, wins: 44, losses: 19, streak: 3, form: 0.2, clubs: ["Downtown Pickleball Club", "Riverbend Athletic"], trust: ["Reliable", "Verified player", "Tournament player"], dna: dna({ aggression: 68, speed: 74, variety: 78, netPlay: 72, placement: 70 }), avatarHue: 260, verified: true, photoVerified: true },
  { id: "p4", name: "Tom Okafor", city: "Eastfield", km: 5.8, rating: 1338, level: "Intermediate", position: "Right stack", style: "Dinker", hand: "Right", formats: ["Doubles"], days: ["Sat", "Sun"], window: "Mornings", reliability: 99, sportsmanship: 97, wins: 12, losses: 11, streak: 1, form: 0.1, clubs: ["Eastfield Community PC"], trust: ["Reliable", "Good sportsmanship", "Verified player"], dna: dna({ patience: 84, consistency: 74, defense: 66, aggression: 30 }), avatarHue: 200, verified: true, photoVerified: true },
  { id: "p5", name: "Lena Kovač", city: "Old Harbour", km: 2.9, rating: 1447, level: "Intermediate", position: "Left stack", style: "Spin server", hand: "Left", formats: ["Mixed", "Doubles"], days: ["Tue", "Thu", "Fri"], window: "Evenings", reliability: 91, sportsmanship: 86, wins: 25, losses: 17, streak: 0, form: 0.05, clubs: ["Harbour Lights PC"], trust: ["Verified player", "Active member"], dna: dna({ variety: 76, aggression: 58, speed: 66, placement: 68 }), avatarHue: 320, verified: true, photoVerified: true },
  { id: "p6", name: "Sam Whitfield", city: "Northgate", km: 4.1, rating: 1289, level: "Beginner+", position: "Flex", style: "Learning loop", hand: "Right", formats: ["Doubles"], days: ["Wed", "Sat"], window: "Afternoons", reliability: 84, sportsmanship: 93, wins: 6, losses: 12, streak: 0, form: 0.15, clubs: [], trust: ["Good sportsmanship", "Verified player"], dna: dna({ consistency: 48, patience: 60, aggression: 44, speed: 52 }), avatarHue: 40, verified: true, photoVerified: true },
  { id: "p7", name: "June Park", city: "Riverside District", km: 0.8, rating: 1476, level: "Advanced", position: "Right stack", style: "Kitchen tactician", hand: "Right", formats: ["Doubles", "Mixed"], days: ["Tue", "Thu", "Sun"], window: "Evenings", reliability: 97, sportsmanship: 94, wins: 38, losses: 15, streak: 5, form: 0.4, clubs: ["Downtown Pickleball Club"], trust: ["Reliable", "Verified player", "Active member"], dna: dna({ placement: 86, patience: 74, netPlay: 80, consistency: 76, aggression: 50 }), avatarHue: 100, verified: true, photoVerified: true },
  { id: "p8", name: "Marcus Hale", city: "Eastfield", km: 6.2, rating: 1560, level: "Advanced", position: "Left stack", style: "Power driver", hand: "Right", formats: ["Singles", "Doubles"], days: ["Mon", "Tue", "Fri"], window: "Mornings", reliability: 89, sportsmanship: 82, wins: 51, losses: 20, streak: 2, form: 0.1, clubs: ["Riverbend Athletic"], trust: ["Verified player", "Tournament player"], dna: dna({ aggression: 84, speed: 78, netPlay: 70, patience: 34, consistency: 58 }), avatarHue: 0, verified: true, photoVerified: true },
  { id: "p9", name: "Ines Duarte", city: "Old Harbour", km: 3.0, rating: 1415, level: "Intermediate", position: "Right stack", style: "Reset artist", hand: "Right", formats: ["Doubles", "Mixed"], days: ["Tue", "Thu", "Sat"], window: "Evenings", reliability: 95, sportsmanship: 96, wins: 20, losses: 13, streak: 3, form: 0.25, clubs: ["Harbour Lights PC"], trust: ["Reliable", "Good sportsmanship", "Verified player"], dna: dna({ defense: 78, patience: 76, consistency: 72, placement: 70, aggression: 40 }), avatarHue: 180, verified: true, photoVerified: true },
  { id: "p10", name: "Viktor Sørensen", city: "Northgate", km: 4.7, rating: 1372, level: "Intermediate", position: "Flex", style: "Lob specialist", hand: "Left", formats: ["Doubles"], days: ["Sat", "Sun"], window: "Afternoons", reliability: 87, sportsmanship: 89, wins: 15, losses: 14, streak: 1, form: -0.2, clubs: ["Northgate Rackets"], trust: ["Verified player"], dna: dna({ variety: 70, patience: 66, defense: 62, aggression: 46 }), avatarHue: 220, verified: true, photoVerified: true },
];

const IMG_INDOOR = "https://image.qwenlm.ai/generated-images/9d96a787-7ffa-42b2-9dd0-f9a53ce528b2/_result.png";
const IMG_OUTDOOR = "https://image.qwenlm.ai/generated-images/1e8c1de1-85cc-42de-96c1-e8ddc9a2e353/_result.png";
const IMG_COMMUNITY = "https://image.qwenlm.ai/generated-images/f5da48b7-30e0-48b2-8e63-265d59179db1/_result.png";
export const IMG_MATCH_TOP = "https://image.qwenlm.ai/generated-images/b85c163f-8ed4-40b3-8e15-8cd4c010a6ff/_result.png";

export const CLUBS: ClubInfo[] = [
  { id: "c1", name: "Downtown Pickleball Club", area: "Riverside District", km: 1.4, indoor: true, outdoor: false, courts: 8, surface: "Cushioned acrylic", members: 342, activeWeekly: 168, levels: ["Beginner", "Intermediate", "Advanced"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], window: "Evenings", formats: ["Doubles", "Mixed", "Singles"], fee: "$45/mo", verified: true, locationVerified: true, official: true, health: 87, activity: 92, cover: "/img/club-indoor.jpg", hue: 84, blurb: "The city's busiest indoor facility — 8 lit courts, ladder nights, and a famously deep intermediate pool.", utilization: 78 },
  { id: "c2", name: "Harbour Lights PC", area: "Old Harbour", km: 2.8, indoor: false, outdoor: true, courts: 6, surface: "Post-tension concrete", members: 214, activeWeekly: 96, levels: ["Intermediate", "Advanced"], days: ["Tue", "Thu", "Sat", "Sun"], window: "Evenings", formats: ["Doubles", "Mixed"], fee: "$30/mo", verified: true, locationVerified: true, official: false, health: 81, activity: 76, cover: "/img/club-outdoor.jpg", hue: 160, blurb: "Waterfront outdoor courts with sunset round-robins. Strong mixed-doubles culture, wind-reading included free.", utilization: 64 },
  { id: "c3", name: "Northgate Rackets", area: "Northgate", km: 4.2, indoor: true, outdoor: true, courts: 5, surface: "Sport tile", members: 158, activeWeekly: 61, levels: ["Beginner", "Beginner+", "Intermediate"], days: ["Mon", "Wed", "Thu", "Sat"], window: "Afternoons", formats: ["Doubles"], fee: "$25/mo", verified: true, locationVerified: false, official: false, health: 74, activity: 58, cover: "/img/club-community.jpg", hue: 200, blurb: "Neighbourhood club with the best beginner pipeline in the city — structured progressions every Wednesday.", utilization: 52 },
  { id: "c4", name: "Riverbend Athletic", area: "Eastfield", km: 6.5, indoor: true, outdoor: false, courts: 12, surface: "Cushioned acrylic", members: 511, activeWeekly: 240, levels: ["Intermediate", "Advanced", "Pro"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], window: "Mornings", formats: ["Singles", "Doubles", "Mixed"], fee: "$70/mo", verified: true, locationVerified: true, official: true, health: 90, activity: 95, cover: "/img/club-indoor.jpg", hue: 260, blurb: "High-performance centre with coaching staff, video review bays, and a sanctioned tournament calendar.", utilization: 84 },
  { id: "c5", name: "Eastfield Community PC", area: "Eastfield", km: 5.6, indoor: false, outdoor: true, courts: 4, surface: "Asphalt seal-coat", members: 96, activeWeekly: 38, levels: ["Beginner", "Intermediate"], days: ["Wed", "Sat", "Sun"], window: "Mornings", formats: ["Doubles"], fee: "Free", verified: true, locationVerified: false, official: false, health: 68, activity: 44, cover: "/img/club-outdoor.jpg", hue: 40, blurb: "Free public courts with a volunteer-run Saturday social. First paddles loaned out — just show up.", utilization: 41 },
  { id: "c6", name: "The Kitchen Society", area: "Riverside District", km: 2.0, indoor: true, outdoor: false, courts: 6, surface: "Cushioned acrylic", members: 187, activeWeekly: 102, levels: ["Intermediate", "Advanced"], days: ["Tue", "Wed", "Thu", "Fri"], window: "Evenings", formats: ["Doubles", "Mixed"], fee: "$40/mo", verified: true, locationVerified: true, official: false, health: 84, activity: 83, cover: "/img/club-community.jpg", hue: 320, blurb: "Members-only evenings with skill-balance-matched round-robins and a monthly 'Dink City' ladder.", utilization: 71 },
  { id: "c7", name: "Sunrise Dinks", area: "Old Harbour", km: 3.7, indoor: false, outdoor: true, courts: 3, surface: "Post-tension concrete", members: 74, activeWeekly: 31, levels: ["Beginner", "Beginner+"], days: ["Mon", "Tue", "Wed", "Thu", "Fri"], window: "Mornings", formats: ["Doubles"], fee: "$15/mo", verified: false, locationVerified: false, official: false, health: 62, activity: 39, cover: "/img/club-outdoor.jpg", hue: 60, blurb: "Early-bird outdoor crew. Coffee after every session — attendance is basically caffeine-driven.", utilization: 35 },
  { id: "c8", name: "Metro Paddleworks", area: "Riverside District", km: 1.9, indoor: true, outdoor: true, courts: 10, surface: "Sport tile", members: 289, activeWeekly: 141, levels: ["Beginner", "Intermediate", "Advanced"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], window: "Evenings", formats: ["Doubles", "Mixed", "Singles"], fee: "$55/mo", verified: true, locationVerified: true, official: false, health: 86, activity: 88, cover: "/img/club-indoor.jpg", hue: 120, blurb: "Two-storey paddle complex: courts downstairs, demo centre and stringing lab upstairs.", utilization: 74 },
];

// map placeholder cover keys to real generated imagery
CLUBS.forEach((c) => {
  c.cover = c.cover.includes("indoor") ? IMG_INDOOR : c.cover.includes("outdoor") ? IMG_OUTDOOR : IMG_COMMUNITY;
});

export const EVENTS: ClubEvent[] = [
  { id: "e1", clubId: "c1", title: "Thursday Night Doubles Ladder", type: "League", day: "Thu", date: "Thu 12 Jun", time: "19:00 – 21:00", capacity: 24, filled: 24, level: "Intermediate+", fee: 8, organizer: "Coach Dana", waitlist: 6, outdoor: false },
  { id: "e2", clubId: "c1", title: "Beginner Fundamentals Clinic", type: "Training", day: "Sat", date: "Sat 14 Jun", time: "09:00 – 10:30", capacity: 12, filled: 9, level: "Beginner", fee: 15, organizer: "Coach Dana", waitlist: 0, outdoor: false },
  { id: "e3", clubId: "c2", title: "Sunset Mixed Round-Robin", type: "Open Play", day: "Sat", date: "Sat 14 Jun", time: "18:30 – 20:30", capacity: 16, filled: 16, level: "Intermediate", fee: 5, organizer: "Noor Haddad", waitlist: 4, outdoor: true, rainRisk: 62 },
  { id: "e4", clubId: "c6", title: "Dink City: Slow-Play Social", type: "Social Night", day: "Fri", date: "Fri 13 Jun", time: "20:00 – 22:00", capacity: 20, filled: 14, level: "All levels", fee: 0, organizer: "The Kitchen Society", waitlist: 0, outdoor: false },
  { id: "e5", clubId: "c4", title: "Summer Open Qualifier", type: "Tournament", day: "Sun", date: "Sun 22 Jun", time: "08:00 – 16:00", capacity: 64, filled: 58, level: "Advanced", fee: 35, organizer: "Riverbend Events", waitlist: 0, outdoor: false },
  { id: "e6", clubId: "c3", title: "Wednesday Progression Night", type: "Beginner Night", day: "Wed", date: "Wed 18 Jun", time: "17:30 – 19:00", capacity: 16, filled: 16, level: "Beginner+", fee: 0, organizer: "Sam Whitfield", waitlist: 7, outdoor: true, rainRisk: 20 },
  { id: "e7", clubId: "c1", title: "Challenge Match: Hale vs. Park", type: "Challenge Match", day: "Tue", date: "Tue 17 Jun", time: "19:30 – 20:30", capacity: 2, filled: 2, level: "Advanced", fee: 0, organizer: "Downtown PC", waitlist: 0, outdoor: false },
  { id: "e8", clubId: "c8", title: "Doubles Night w/ Skill Balance", type: "Doubles Night", day: "Thu", date: "Thu 19 Jun", time: "18:00 – 20:00", capacity: 24, filled: 18, level: "Intermediate", fee: 6, organizer: "Metro Events", waitlist: 0, outdoor: false },
];

export const NOTIFICATIONS_SEED = [
  { id: "n1", icon: "calendar", title: "Waitlist slot opened", body: "Thursday Night Doubles Ladder — a spot just opened. You have 30:00 to claim it.", time: "2m ago", unread: true, kind: "waitlist" as const },
  { id: "n2", icon: "users", title: "Membership approved", body: "Downtown Pickleball Club accepted your membership. Say hi in the club chat.", time: "1h ago", unread: true, kind: "club" as const },
  { id: "n3", icon: "trophy", title: "Result confirmed", body: "Maya Chen confirmed your 11–7 result. Your rating moved +14 → 1428.", time: "3h ago", unread: true, kind: "match" as const },
  { id: "n4", icon: "shield", title: "Identity verified", body: "Your identity verification passed automated checks. Verified badge is now live.", time: "Yesterday", unread: false, kind: "verify" as const },
  { id: "n5", icon: "zap", title: "3 compatible players nearby", body: "Fair Match Engine found balanced games for your Tue/Thu evening window.", time: "Yesterday", unread: false, kind: "match" as const },
];

export const ACTIVITY_FEED = [
  "Maya Chen joined Downtown Pickleball Club",
  "Sunset Mixed Round-Robin filled in 42 minutes",
  "Marcus Hale defended #1 in the singles ladder",
  "18 waitlist slots auto-filled this week",
  "Northgate Rackets added 2 outdoor courts",
  "Priya Nair hit a 6-match win streak",
  "The Kitchen Society health score rose to 84",
  "New tournament: Summer Open Qualifier — 58/64 entered",
  "Ines Duarte earned the Rock Solid badge",
  "Metro Paddleworks opened Thursday doubles night",
];

export const AUDIT_LOG = [
  { id: "a1", ts: "12 Jun · 14:02", actor: "system", action: "Identity verification state → VERIFIED", target: "user_84213", severity: "info" },
  { id: "a2", ts: "12 Jun · 13:47", actor: "admin:reviewer-2", action: "Moderation: warning issued", target: "user_77102 (spam)", severity: "warn" },
  { id: "a3", ts: "12 Jun · 11:15", actor: "system", action: "Duplicate-identity check triggered", target: "registration batch #118", severity: "warn" },
  { id: "a4", ts: "11 Jun · 22:31", actor: "club-owner:c1", action: "Role change: Coach → Event Manager", target: "user_60341 @ Downtown PC", severity: "info" },
  { id: "a5", ts: "11 Jun · 19:04", actor: "system", action: "Failed verification attempt (3rd)", target: "user_85590", severity: "high" },
  { id: "a6", ts: "11 Jun · 16:40", actor: "admin:reviewer-1", action: "Manual review → VERIFIED (name variation)", target: "user_81277", severity: "info" },
  { id: "a7", ts: "10 Jun · 09:12", actor: "system", action: "Rate limit: 14 registration attempts blocked", target: "IP block 203.0.113.0/24", severity: "high" },
  { id: "a8", ts: "09 Jun · 18:55", actor: "system", action: "Document retention: 412 files auto-purged (policy: 30d)", target: "secure storage bucket", severity: "info" },
];

export const RISK_QUEUE = [
  { id: "r1", label: "Rapid account creation — 9 accounts / 20 min, same device fingerprint", signals: ["velocity", "device"], points: 74 },
  { id: "r2", label: "Document tamper indicators on upload (edge inconsistency)", signals: ["document"], points: 66 },
  { id: "r3", label: "3 failed verification attempts followed by name change", signals: ["verification", "identity"], points: 52 },
  { id: "r4", label: "Identical profile photo across two accounts", signals: ["photo", "duplicate"], points: 41 },
  { id: "r5", label: "Repeated event no-shows reported by 2 organizers", signals: ["behavior"], points: 24 },
  { id: "r6", label: "New account messaging 40+ members within an hour", signals: ["messaging"], points: 38 },
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HOURS = ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"];

/** deterministic utilization grid for club c1 (pct 0-100) */
export function utilizationGrid(): { court: number; day: string; hour: string; pct: number }[] {
  const cells: { court: number; day: string; hour: string; pct: number }[] = [];
  DAYS.forEach((day, di) =>
    HOURS.forEach((hour, hi) => {
      const prime = hi >= 5 ? 1 : hi <= 1 ? 0.35 : 0.6;
      const weekend = di >= 5 ? 1.15 : 1;
      const seed = Math.abs(Math.sin((di + 1) * 7.13 + (hi + 1) * 3.71));
      let pct = Math.round(92 * prime * weekend * (0.45 + seed * 0.6));
      if (di === 1 && hi === 4) pct = 18; // the Tuesday 15:00 gap
      if (di === 4 && hi === 6) pct = 96;
      cells.push({ court: 1, day, hour, pct: Math.min(100, pct) });
    })
  );
  return cells;
}

export const MEMBERS_SEED = [
  { id: "m1", name: "Maya Chen", role: "Member", status: "Active", verify: "VERIFIED", reliability: 98, joined: "Mar 2025", games: 44 },
  { id: "m2", name: "June Park", role: "Event Manager", status: "Active", verify: "VERIFIED", reliability: 97, joined: "Jan 2025", games: 53 },
  { id: "m3", name: "Dario Vela", role: "Member", status: "Active", verify: "VERIFIED", reliability: 88, joined: "Apr 2025", games: 34 },
  { id: "m4", name: "Sam Whitfield", role: "Moderator", status: "Active", verify: "VERIFIED", reliability: 84, joined: "Feb 2025", games: 18 },
  { id: "m5", name: "Priya Nair", role: "Coach", status: "Active", verify: "VERIFIED", reliability: 94, joined: "Jan 2025", games: 63 },
  { id: "m6", name: "Owen Fitzgerald", role: "Member", status: "Pending", verify: "IN_PROGRESS", reliability: 0, joined: "—", games: 0 },
  { id: "m7", name: "Tara Singh", role: "Member", status: "Pending", verify: "NEEDS_REVIEW", reliability: 0, joined: "—", games: 0 },
  { id: "m8", name: "Chris Yoon", role: "Member", status: "Suspended", verify: "VERIFIED", reliability: 41, joined: "Nov 2024", games: 22 },
  { id: "m9", name: "Bea Alvarez", role: "Member", status: "Active", verify: "VERIFIED", reliability: 92, joined: "May 2025", games: 9 },
  { id: "m10", name: "Noor Haddad", role: "Admin", status: "Active", verify: "VERIFIED", reliability: 95, joined: "Jan 2025", games: 47 },
];

export const MESSAGES_SEED = [
  { id: "t1", from: "Maya Chen", preview: "Up for Thursday ladder? Need a right-stack partner.", time: "12m", unread: 2, hue: 160, replies: [ { me: false, text: "Court 4 just opened for the 7pm block — you in?" }, { me: false, text: "I can bring the new paddles for demo too." } ] },
  { id: "t2", from: "Downtown PC · Announcements", preview: "Court 2 resurfacing finished — play resumes tonight.", time: "1h", unread: 0, hue: 84, replies: [{ me: false, text: "Court 2 resurfacing finished — play resumes tonight. Ladder matches get priority booking until Sunday." }] },
  { id: "t3", from: "Coach Dana", preview: "Your dink video review is ready. Two notes on paddle angle.", time: "3h", unread: 1, hue: 260, replies: [{ me: false, text: "Review is ready: tighten paddle angle on backhand resets, and hold your ground at the NVZ line." }] },
];

export const MATCH_HISTORY = [
  { id: "h1", date: "Tue 10 Jun", format: "Doubles", partners: "You + Maya Chen", opponents: "Park / Okafor", score: "11–7", won: true, delta: +14, event: "Open Play" },
  { id: "h2", date: "Sat 07 Jun", format: "Mixed", partners: "You + Ines Duarte", opponents: "Chen / Vela", score: "9–11", won: false, delta: -9, event: "Round-Robin" },
  { id: "h3", date: "Thu 05 Jun", format: "Doubles", partners: "You + June Park", opponents: "Hale / Kovač", score: "12–10", won: true, delta: +18, event: "Ladder" },
  { id: "h4", date: "Tue 03 Jun", format: "Doubles", partners: "You + Tom Okafor", opponents: "Sørensen / Whitfield", score: "11–5", won: true, delta: +11, event: "Open Play" },
  { id: "h5", date: "Sat 31 May", format: "Singles", partners: "You", opponents: "Marcus Hale", score: "6–11", won: false, delta: -7, event: "Challenge" },
  { id: "h6", date: "Thu 29 May", format: "Doubles", partners: "You + Maya Chen", opponents: "Nair / Duarte", score: "11–9", won: true, delta: +12, event: "Ladder" },
];

export const RATING_TREND = [1371, 1378, 1385, 1380, 1392, 1399, 1391, 1402, 1410, 1405, 1416, 1421, 1414, 1428];

export const WEEKLY_GAMES = [3, 5, 2, 6, 4, 7, 5, 4, 6, 8, 5, 7];
