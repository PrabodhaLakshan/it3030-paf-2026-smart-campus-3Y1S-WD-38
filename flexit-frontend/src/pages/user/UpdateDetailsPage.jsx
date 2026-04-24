import { useState } from "react";
import { getSessionUser } from "../../utils/sessionUser";

function UpdateDetailsPage() {
  const sessionUser = getSessionUser();
  const [fullName, setFullName] = useState(sessionUser.userName || "");
  const [email, setEmail] = useState(sessionUser.userEmail || "");

  const handleSubmit = (event) => {
    event.preventDefault();

    const flexitUser = JSON.parse(localStorage.getItem("flexitUser") || "{}");
    localStorage.setItem(
      "flexitUser",
      JSON.stringify({
        ...flexitUser,
        userName: fullName,
        userEmail: email,
      })
    );

    window.dispatchEvent(new Event("storage"));
  };

  return (
    <section className="mx-auto max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#61CE70]">Profile</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Update Details</h1>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#61CE70] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#61CE70] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-[#0a192f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10274a]"
        >
          Save Changes
        </button>
      </form>
    </section>
  );
}

export default UpdateDetailsPage;
