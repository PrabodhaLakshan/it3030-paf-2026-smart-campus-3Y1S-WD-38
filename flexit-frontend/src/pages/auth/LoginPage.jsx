import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setSessionUser } from "../../utils/sessionUser";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "USER",
    userId: "",
    userName: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!formData.userId.trim()) {
      setError("User ID is required.");
      return;
    }

    if (!formData.userName.trim()) {
      setError("User name is required.");
      return;
    }

    // Authentication endpoint is not available yet, so this stores a role-based local session.
    setSessionUser({
      role: formData.role,
      userId: formData.userId,
      userName: formData.userName,
    });

    if (formData.role === "TECHNICIAN") {
      navigate("/technician/dashboard", { replace: true });
      return;
    }

    if (formData.role === "USER") {
      navigate("/user/dashboard", { replace: true });
      return;
    }

    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <section className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 text-slate-100 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#61CE70]">FlexIT Access</p>
          <h1 className="mt-3 text-3xl font-semibold">Sign In</h1>
          <p className="mt-3 text-sm text-slate-300">
            Login as a user, technician, or admin to access the dashboard experience.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#61CE70]"
              >
                <option value="USER">USER</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">User ID</label>
              <input
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="ex: TECH001"
                className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#61CE70]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">User Name</label>
              <input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="ex: Nimal"
                className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#61CE70]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Enter password"
                className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#61CE70]"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#61CE70] px-4 py-3 text-sm font-semibold text-[#0a192f] transition hover:bg-white"
            >
              Login
            </button>

            <Link
              to="/report-ticket"
              className="block w-full rounded-2xl border border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-[#61CE70] hover:text-[#61CE70]"
            >
              Report Ticket Without Login
            </Link>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-8 text-slate-200 shadow-2xl">
          <h2 className="text-xl font-semibold">Role Features</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>Manage resources and incident tickets as an administrator.</li>
            <li>Use technician view to process and update ticket status.</li>
            <li>Access role-based dashboards with shared UI layout.</li>
          </ul>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Quick Demo Login</p>
            <p className="mt-2 text-sm text-slate-200">Role: USER</p>
            <p className="text-sm text-slate-200">User ID: USER001</p>
            <p className="text-sm text-slate-200">User Name: Student One</p>
            <p className="mt-4 text-sm text-slate-200">Role: TECHNICIAN</p>
            <p className="text-sm text-slate-200">User ID: TECH001</p>
            <p className="text-sm text-slate-200">User Name: Technician One</p>
            <p className="mt-4 text-sm text-slate-200">Role: ADMIN</p>
            <p className="text-sm text-slate-200">User ID: ADMIN001</p>
            <p className="text-sm text-slate-200">User Name: FlexIT Admin</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
