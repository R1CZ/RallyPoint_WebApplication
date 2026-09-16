import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import type { SessionUser } from "./pages/Onboarding";
import PlayerApp from "./pages/PlayerApp";
import ClubWizard from "./pages/ClubWizard";
import ClubAdmin from "./pages/ClubAdmin";
import { Button, Icon, ToastProvider } from "./components/ui";

type Route = "landing" | "onboarding" | "player" | "wizard" | "club";

const SESSION_KEY = "rallypoint.session";
const CLUB_KEY = "rallypoint.club";

function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(loadSession);
  const [route, setRoute] = useState<Route>(() => {
    const u = loadSession();
    return u ? (u.role === "player" ? "player" : "club") : "landing";
  });
  const [onboardRole, setOnboardRole] = useState<"player" | "club">("player");
  const [clubName, setClubName] = useState<string>(() => localStorage.getItem(CLUB_KEY) ?? "Riverside Rally Club");

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  const logout = () => { setUser(null); setRoute("landing"); };

  const startOnboarding = (role: "player" | "club") => { setOnboardRole(role); setRoute("onboarding"); };

  return (
    <ToastProvider>
      {route === "landing" && (
        <Landing onStart={startOnboarding} />
      )}

      {route === "onboarding" && (
        <Onboarding
          initialRole={onboardRole}
          onBack={() => setRoute("landing")}
          onDone={(u) => { setUser(u); setRoute(u.role === "player" ? "player" : "wizard"); }}
        />
      )}

      {route === "player" && user && <PlayerApp user={user} onLogout={logout} />}

      {route === "wizard" && user && (
        <ClubWizard
          user={user}
          onBack={() => setRoute("landing")}
          onDone={(name) => { setClubName(name); localStorage.setItem(CLUB_KEY, name); setRoute("club"); }}
        />
      )}

      {route === "club" && user && <ClubAdmin user={user} clubName={clubName} onLogout={logout} />}

      {/* fallback if session missing */}
      {(route === "player" || route === "wizard" || route === "club") && !user && (
        <div className="min-h-screen grid place-items-center bg-court-950 text-chalk">
          <div className="text-center">
            <Icon name="ball" size={40} className="text-lime mx-auto" />
            <p className="mt-4 font-display font-bold">Session expired</p>
            <Button className="mt-4" onClick={() => setRoute("landing")}>Back to start</Button>
          </div>
        </div>
      )}
    </ToastProvider>
  );
}
