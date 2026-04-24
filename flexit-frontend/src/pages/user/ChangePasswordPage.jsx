import { useEffect, useState } from "react";
import { getPasswordStatus, setOrChangePassword } from "../../api/authApi";
import { getSessionUser } from "../../utils/sessionUser";

function ChangePasswordPage() {
  const sessionUser = getSessionUser();
  const [hasPassword, setHasPassword] = useState(() => sessionUser.hasPassword ?? true);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadPasswordStatus = async () => {
      if (!sessionUser.userId) return;
      if (typeof sessionUser.hasPassword === "boolean") {
        setHasPassword(sessionUser.hasPassword);
        return;
      }

      setLoading(true);
      try {
        const status = await getPasswordStatus(sessionUser.userId);
        setHasPassword(Boolean(status.hasPassword));
      } catch {
        setMessage("Failed to load password status.");
      } finally {
        setLoading(false);
      }
    };

    loadPasswordStatus();
  }, [sessionUser.userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if ((!hasPassword && !newPassword) || (hasPassword && (!currentPassword || !newPassword)) || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await setOrChangePassword({
        userId: sessionUser.userId,
        currentPassword: hasPassword ? currentPassword : "",
        newPassword,
      });

      setMessage(response.message || "Password updated successfully.");
      setHasPassword(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#61CE70]">Security</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        {hasPassword ? "Change Password" : "Set a Password"}
      </h1>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {hasPassword ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#61CE70] focus:outline-none"
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="newPassword">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#61CE70] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#61CE70] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || submitting}
          className="rounded-xl bg-[#0a192f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10274a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : hasPassword
              ? "Update Password"
              : "Set Password"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}

export default ChangePasswordPage;
