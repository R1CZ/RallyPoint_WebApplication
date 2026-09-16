import { useEffect, useState } from "react";
import { Avatar, Button, Card, Chip, Icon, Logo, useToast, VerifyBadge } from "../components/ui";
import type { IconName } from "../components/ui";
import type { SessionUser } from "./Onboarding";
import { api } from "../lib/api";

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

export default function PlayerApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const toast = useToast();
  const [view, setView] = useState<PlayerView>("home");
  const [profile, setProfile] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, clubsData, notifsData] = await Promise.all([
        api.users.getProfile(user.id),
        api.users.getClubs(user.id),
        api.users.getNotifications(user.id),
      ]);
      setProfile(profileData);
      setClubs(clubsData);
      setNotifications(notifsData);
    } catch (err) {
      toast({
        icon: "alert",
        tone: "blood",
        title: "Failed to load data",
        body: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const go = (v: PlayerView) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const unread = notifications.filter((n) => n.unread).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-court-950 text-chalk grid place-items-center">
        <div className="text-center">
          <Icon name="ball" size={48} className="text-lime mx-auto anim-spin-slow" />
          <p className="mt-4 font-display font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-court-950 text-chalk">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-chalk/8 bg-court-900/70 backdrop-blur z-40">
        <div className="h-16 flex items-center px-5 border-b border-chalk/8"><Logo /></div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-display font-bold tracking-tight transition-all ${
                view === n.id
                  ? "bg-lime/12 text-lime border border-lime/20"
                  : "text-chalk/55 hover:text-chalk hover:bg-chalk/5 border border-transparent"
              }`}
            >
              <Icon name={n.icon} size={17} />
              {n.label}
              {n.id === "alerts" && unread > 0 && (
                <span className="ml-auto font-mono text-[10px] bg-lime text-court-950 rounded-full px-1.5 py-0.5 font-bold">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3.5 border-t border-chalk/8">
          <div className="flex items-center gap-3 rounded-xl bg-court-850 border border-chalk/8 p-3">
            <Avatar name={user.name} hue={user.avatarHue} size={38} verified={user.verified === "VERIFIED"} />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-[13px] tracking-tight truncate">{user.name}</p>
              <p className="text-[10.5px] text-chalk/40">
                {user.verified === "VERIFIED" ? "Verified player" : "Review pending"}
              </p>
            </div>
            <button onClick={onLogout} className="text-chalk/40 hover:text-blood transition" title="Sign out">
              <Icon name="logout" size={16} />
            </button>
          </div>
          <p className="mt-2.5 text-center font-mono text-[9.5px] tracking-[0.2em] uppercase text-chalk/30">
            Build by <span className="text-chalk/55">Jonric Manisan</span>
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 z-40 bg-court-950/90 backdrop-blur border-b border-chalk/8 flex items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-3">
          <button onClick={() => go("alerts")} className="relative text-chalk/60 hover:text-chalk">
            <Icon name="bell" size={19} />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lime" />}
          </button>
          <button onClick={onLogout} className="text-chalk/40">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="lg:pl-60 pt-14 lg:pt-0 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 lg:py-9">
          {view === "home" && <Dashboard user={user} profile={profile} clubs={clubs} go={go} />}
          {view === "discover" && <DiscoverView clubs={clubs} />}
          {view === "profile" && <ProfileView user={user} profile={profile} />}
          {view === "events" && <EventsView />}
          {view === "alerts" && <NotificationsView notifications={notifications} setNotifications={setNotifications} />}
          {view !== "home" && view !== "discover" && view !== "profile" && view !== "events" && view !== "alerts" && (
            <ComingSoon view={view} />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-court-900/95 backdrop-blur border-t border-chalk/10 grid grid-cols-5">
        {([
          ["home", "home", "Home"],
          ["discover", "search", "Discover"],
          ["playnow", "zap", "Games"],
          ["events", "calendar", "Events"],
          ["profile", "users", "Profile"],
        ] as [PlayerView, IconName, string][]).map(([id, ic, l]) => (
          <button
            key={id}
            onClick={() => go(id)}
            className={`py-2.5 flex flex-col items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide transition ${
              view === id ? "text-lime" : "text-chalk/45"
            }`}
          >
            <Icon name={ic} size={19} /> {l}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Dashboard({ user, profile, clubs, go }: { user: SessionUser; profile: any; clubs: any[]; go: (v: PlayerView) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.25em] text-lime uppercase">Welcome back</p>
        <h1 className="mt-2 font-display font-black tracking-tight text-3xl sm:text-4xl">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
          <span className="text-lime">{user.name.split(" ")[0]}.</span>
        </h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Ready to play? Find clubs, join events, or track your progress.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Rating</p>
          <p className="font-mono font-bold text-2xl mt-1 text-lime">{profile?.profile?.rating || 1000}</p>
          <p className="text-[11px] text-chalk/45 mt-0.5">Keep playing to improve</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Games Played</p>
          <p className="font-mono font-bold text-2xl mt-1">
            {(profile?.profile?.wins || 0) + (profile?.profile?.losses || 0)}
          </p>
          <p className="text-[11px] text-chalk/45 mt-0.5">
            {profile?.profile?.wins || 0}W – {profile?.profile?.losses || 0}L
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Clubs Joined</p>
          <p className="font-mono font-bold text-2xl mt-1">{clubs.length}</p>
          <p className="text-[11px] text-chalk/45 mt-0.5">Active memberships</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-widest text-chalk/40">Play Streak</p>
          <p className="font-mono font-bold text-2xl mt-1 text-gold">{profile?.profile?.streak || 0} days</p>
          <p className="text-[11px] text-chalk/45 mt-0.5">Keep it going!</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-lime flex items-center gap-2">
            <Icon name="court" size={14} /> YOUR CLUBS
          </p>
          {clubs.length === 0 ? (
            <div className="mt-4 text-center py-8">
              <Icon name="court" size={32} className="text-chalk/20 mx-auto" />
              <p className="mt-3 text-chalk/50">No clubs yet</p>
              <Button size="sm" className="mt-3" onClick={() => go("discover")}>
                Find a club
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {clubs.slice(0, 3).map((club) => (
                <div key={club.id} className="flex items-center gap-3 rounded-xl border border-chalk/8 bg-court-900/60 p-3">
                  <div
                    className="w-10 h-10 rounded-lg grid place-items-center font-display font-bold"
                    style={{
                      background: `hsl(${club.hue} 55% 30%)`,
                      color: `hsl(${club.hue} 90% 75%)`,
                    }}
                  >
                    {club.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-[13.5px] tracking-tight truncate">{club.name}</p>
                    <p className="text-[11px] text-chalk/45 truncate">
                      {club.city}, {club.country} · {club.courts} courts
                    </p>
                  </div>
                  <Chip tone="lime">{club.role}</Chip>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-gold flex items-center gap-2">
            <Icon name="zap" size={14} /> QUICK ACTIONS
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="dark" icon="search" onClick={() => go("discover")}>
              Find Clubs
            </Button>
            <Button variant="dark" icon="calendar" onClick={() => go("events")}>
              Browse Events
            </Button>
            <Button variant="dark" icon="users" onClick={() => go("profile")}>
              Edit Profile
            </Button>
            <Button variant="dark" icon="trophy" onClick={() => go("rankings")}>
              View Rankings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DiscoverView({ clubs }: { clubs: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Discover Clubs</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Find pickleball clubs near you and join the community.</p>
      </div>

      {clubs.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="search" size={48} className="text-chalk/20 mx-auto" />
          <p className="mt-4 font-display font-bold text-xl">No clubs available yet</p>
          <p className="mt-2 text-chalk/50">Be the first to create a club in your area!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map((club) => (
            <Card key={club.id} hover className="overflow-hidden">
              <div className="h-32 relative" style={{ background: `hsl(${club.hue} 40% 25%)` }}>
                <div className="absolute inset-0 grid place-items-center">
                  <div
                    className="w-16 h-16 rounded-xl grid place-items-center font-display font-black text-2xl"
                    style={{
                      background: `hsl(${club.hue} 55% 30%)`,
                      color: `hsl(${club.hue} 90% 75%)`,
                    }}
                  >
                    {club.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-extrabold tracking-tight text-lg leading-tight">{club.name}</h3>
                <p className="text-[12.5px] text-chalk/50 mt-1">
                  {club.city}, {club.country}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Chip>
                    {club.courts} court{club.courts !== 1 ? "s" : ""}
                  </Chip>
                  <Chip tone="teal">{club.membersCount} members</Chip>
                  <Chip tone="gold">Health: {club.healthScore}</Chip>
                </div>
                <Button size="sm" className="mt-4 w-full">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileView({ user, profile }: { user: SessionUser; profile: any }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display font-black tracking-tight text-3xl">Your Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-5">
          <Avatar name={user.name} hue={user.avatarHue} size={80} verified={user.verified === "VERIFIED"} />
          <div>
            <h2 className="font-display font-black tracking-tight text-2xl">{user.name}</h2>
            <p className="text-[13px] text-chalk/50 mt-0.5">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <VerifyBadge state={user.verified} />
              {user.photoVerified && <Chip tone="teal">Photo Verified</Chip>}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-chalk/45">PLAYER STATS</p>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-chalk/60">Level</span>
              <span className="font-bold">{profile?.profile?.level || "Beginner"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chalk/60">Rating</span>
              <span className="font-bold text-lime">{profile?.profile?.rating || 1000}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chalk/60">Wins</span>
              <span className="font-bold text-teal">{profile?.profile?.wins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chalk/60">Losses</span>
              <span className="font-bold text-blood">{profile?.profile?.losses || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chalk/60">Win Rate</span>
              <span className="font-bold">
                {profile?.profile?.wins && profile?.profile?.losses
                  ? Math.round(
                      (profile.profile.wins / (profile.profile.wins + profile.profile.losses)) * 100
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-mono text-[11px] tracking-widest text-chalk/45">ACCOUNT INFO</p>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-chalk/60">Email</span>
              <span className="font-bold text-[13px]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chalk/60">Role</span>
              <span className="font-bold capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chalk/60">Member Since</span>
              <span className="font-bold text-[13px]">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EventsView() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.events.getAll();
      setEvents(data);
    } catch (err) {
      toast({
        icon: "alert",
        tone: "blood",
        title: "Failed to load events",
        body: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Icon name="calendar" size={32} className="text-chalk/20 anim-spin-slow" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black tracking-tight text-3xl">Events</h1>
        <p className="mt-1.5 text-chalk/55 text-[14px]">Browse and register for upcoming events.</p>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="calendar" size={48} className="text-chalk/20 mx-auto" />
          <p className="mt-4 font-display font-bold text-xl">No events available</p>
          <p className="mt-2 text-chalk/50">Check back later for upcoming events.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {events.map((event) => (
            <Card key={event.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Chip tone="gold">{event.type}</Chip>
                  <h3 className="mt-2 font-display font-extrabold tracking-tight text-lg leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-[12.5px] text-chalk/50 mt-1">
                    {event.clubName} · {event.organizer}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-[15px] text-gold">{event.date}</p>
                  <p className="font-mono text-[11.5px] text-chalk/45">{event.time}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[11.5px] font-mono text-chalk/50 mb-1.5">
                  <span>
                    {event.filled}/{event.capacity} registered
                  </span>
                  <span>{Math.round((event.filled / event.capacity) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-chalk/8 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      event.filled >= event.capacity ? "bg-blood" : "bg-lime"
                    }`}
                    style={{ width: `${Math.min(100, (event.filled / event.capacity) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-lime font-semibold">
                  {event.fee ? `$${event.fee}` : "Free"}
                </span>
                <Button
                  size="sm"
                  disabled={event.filled >= event.capacity}
                  onClick={async () => {
                    try {
                      await api.events.register(event.id);
                      toast({
                        icon: "check",
                        tone: "lime",
                        title: "Registered!",
                        body: "You're registered for this event.",
                      });
                      loadEvents();
                    } catch (err) {
                      toast({
                        icon: "alert",
                        tone: "blood",
                        title: "Registration failed",
                        body: err instanceof Error ? err.message : "Please try again",
                      });
                    }
                  }}
                >
                  {event.filled >= event.capacity ? "Full" : "Register"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsView({
  notifications,
  setNotifications,
}: {
  notifications: any[];
  setNotifications: (n: any[]) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-display font-black tracking-tight text-3xl">Notifications</h1>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="bell" size={48} className="text-chalk/20 mx-auto" />
          <p className="mt-4 font-display font-bold text-xl">No notifications</p>
          <p className="mt-2 text-chalk/50">You're all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-5 ${n.unread ? "border-lime/30 bg-lime/5" : ""}`}
              hover
              onClick={async () => {
                if (n.unread) {
                  await api.users.markNotificationRead(n.id);
                  setNotifications(notifications.map((x) => (x.id === n.id ? { ...x, unread: 0 } : x)));
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-lime/10 text-lime grid place-items-center">
                  <Icon name={n.icon} size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-[14.5px] tracking-tight">{n.title}</p>
                  <p className="text-[13px] text-chalk/55 mt-1">{n.body}</p>
                  <p className="text-[11px] text-chalk/35 mt-2">{n.time}</p>
                </div>
                {n.unread ? <span className="w-2 h-2 rounded-full bg-lime" /> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ComingSoon({ view }: { view: PlayerView }) {
  const titles: Record<string, string> = {
    playnow: "Play Now",
    dna: "Play Style DNA",
    rankings: "Rankings",
    badges: "Achievements",
    messages: "Messages",
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-black tracking-tight text-3xl">{titles[view] || view}</h1>
      <Card className="p-12 text-center">
        <Icon name="spark" size={48} className="text-lime/30 mx-auto" />
        <p className="mt-4 font-display font-bold text-xl">Coming Soon</p>
        <p className="mt-2 text-chalk/50">This feature is under development.</p>
      </Card>
    </div>
  );
}
