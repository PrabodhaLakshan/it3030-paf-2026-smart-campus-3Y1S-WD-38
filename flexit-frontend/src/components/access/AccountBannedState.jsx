import { useEffect, useMemo, useState } from "react";
import { createReactivationRequestNotification } from "../../api/notificationApi";
import { getSessionUser } from "../../utils/sessionUser";

function padTime(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function toCountdownParts(diffMs) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    hasTimeLeft: totalSeconds > 0,
  };
}

function AccountBannedState({ bannedUntil, isManualReactivation = false }) {
  const sessionUser = getSessionUser();
  const parsedBannedUntil = useMemo(() => {
    if (!bannedUntil) return null;
    const parsed = new Date(bannedUntil);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [bannedUntil]);

  const [now, setNow] = useState(Date.now());
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    if (!parsedBannedUntil) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [parsedBannedUntil]);

  const countdown = useMemo(() => {
    if (!parsedBannedUntil) {
      return null;
    }

    return toCountdownParts(parsedBannedUntil.getTime() - now);
  }, [parsedBannedUntil, now]);

  const showRequestButton = isManualReactivation || !parsedBannedUntil;

  const handleRequestReactivate = async () => {
    const userId = sessionUser.userId || sessionUser.userCode;
    if (!userId || isRequesting) {
      return;
    }

    setIsRequesting(true);
    setRequestMessage("");

    try {
      await createReactivationRequestNotification({
        userId,
        userCode: sessionUser.userCode,
        fullName: sessionUser.userName || "User",
      });
      setRequestMessage("Reactivation request sent to admin.");
    } catch (error) {
      console.error("Failed to send reactivation request:", error);
      setRequestMessage("Request failed. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div
      className="relative h-full min-h-[calc(100vh-84px)] w-full overflow-hidden"
      style={{
        backgroundImage: "url('/images/account_banned_flexit.gif')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className="relative z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-10 text-center text-slate-900 md:pb-14"
        style={{ textShadow: "0 1px 6px rgba(255,255,255,0.6)" }}
      >
        <h2 className="text-2xl font-black uppercase tracking-[0.14em] md:text-4xl">Account Deactivated</h2>

        {!showRequestButton && countdown ? (
          <>
            <p className="mt-3 text-base font-semibold uppercase tracking-[0.22em] md:text-lg">Time remaining</p>
            <p className="mt-2 text-5xl font-black tracking-wide md:text-7xl">
              {countdown.days > 0 ? `${padTime(countdown.days)}:` : ""}
              {padTime(countdown.hours)}:{padTime(countdown.minutes)}:{padTime(countdown.seconds)}
            </p>
            {!countdown.hasTimeLeft && (
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] md:text-base">
                Reactivating soon...
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-3 text-base font-semibold uppercase tracking-[0.22em] text-slate-900 md:text-lg">Until admin reactivates</p>
            <button
              type="button"
              onClick={handleRequestReactivate}
              disabled={isRequesting}
              className="mt-4 rounded-full border border-[#5bd900] bg-[#5bd900] px-8 py-3 text-base font-bold uppercase tracking-[0.14em] text-[#0f2a00] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRequesting ? "Sending..." : "Request to Reactivate"}
            </button>
            {requestMessage && <p className="mt-3 text-sm font-semibold text-slate-900 md:text-base">{requestMessage}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default AccountBannedState;
