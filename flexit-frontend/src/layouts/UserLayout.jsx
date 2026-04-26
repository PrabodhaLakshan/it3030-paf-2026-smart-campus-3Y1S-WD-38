import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { updateUserPresence } from "../api/authApi";
import { getAccountAccessStatus } from "../api/authApi";
import AccountBannedState from "../components/access/AccountBannedState";
import UserNavbar from "../components/user_navbar/UserNavbar";
import UserSidebar from "../components/user_sidebar/UserSidebar";
import { getSessionUser, setSessionUser } from "../utils/sessionUser";

function UserLayout() {
  const sessionUser = getSessionUser();
  const [isActive, setIsActive] = useState(sessionUser.isActive !== false);
  const [bannedUntil, setBannedUntil] = useState(sessionUser.bannedUntil || "");
  const [isManualReactivation, setIsManualReactivation] = useState(
    sessionUser.isActive === false && !sessionUser.bannedUntil
  );

  useEffect(() => {
    const userIdentifier = sessionUser.userId || sessionUser.userCode;
    if (!userIdentifier) {
      return undefined;
    }

    let mounted = true;

    const syncAccessStatus = async () => {
      try {
        const status = await getAccountAccessStatus(userIdentifier);
        if (!mounted) return;

        const nextIsActive = status?.active !== false;
        const nextBannedUntil = status?.bannedUntil || "";
        const nextIsManualReactivation = !nextIsActive && !nextBannedUntil;

        setIsActive(nextIsActive);
        setBannedUntil(nextBannedUntil);
        setIsManualReactivation(nextIsManualReactivation);

        setSessionUser({
          ...sessionUser,
          isActive: nextIsActive,
          bannedUntil: nextBannedUntil,
        });
      } catch (error) {
        console.error("Failed to load account access status:", error);
      }
    };

    syncAccessStatus();
    const intervalId = window.setInterval(syncAccessStatus, 30000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [sessionUser.userId, sessionUser.userCode]);

  useEffect(() => {
    const userIdentifier = sessionUser.userId || sessionUser.userCode;
    if (!userIdentifier || !isActive) {
      return undefined;
    }

    let mounted = true;

    const syncPresence = async () => {
      if (!mounted) {
        return;
      }

      try {
        await updateUserPresence({ userId: userIdentifier, online: true });
      } catch (error) {
        console.error("Failed to refresh user presence:", error);
      }
    };

    syncPresence();
    const intervalId = window.setInterval(syncPresence, 20000);

    const handleFocus = () => {
      syncPresence();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [sessionUser.userId, sessionUser.userCode, isActive]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Navigation */}
      <UserNavbar />

      {/* Main Layout Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <UserSidebar />

        {/* Main Workspace (Outlet renders matched child route) */}
        <main className={`flex-1 overflow-y-auto ${isActive ? "p-4 sm:p-6 lg:p-8" : "p-0"}`}>
          {isActive ? (
            <Outlet />
          ) : (
            <AccountBannedState bannedUntil={bannedUntil} isManualReactivation={isManualReactivation} />
          )}
        </main>
      </div>
    </div>
  );
}

export default UserLayout;