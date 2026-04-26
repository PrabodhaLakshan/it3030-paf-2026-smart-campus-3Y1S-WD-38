import { useEffect, useMemo, useState } from "react";
import { createTechnician, deactivateUser, deleteTechnician, deleteUser, getUserManagementSummary, reactivateUser } from "../../api/adminUserApi";

const TECHNICIAN_CATEGORIES = [
  "Electrical",
  "Mechanical",
  "Plumbing",
  "HVAC",
  "IT Support",
  "Civil",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Security",
];

const ASSIGNED_AREAS = [
  "SLIIT Malabe",
  "SLIIT Kandy",
  "SLIIT Jaffna",
  "SLIIT Kurunegala",
  "SLIIT Metro",
];

const INITIAL_FORM = {
  fullName: "",
  contactNumber: "",
  email: "",
  categories: [],
  assignedArea: "",
};

const DEACTIVATION_OPTIONS = [
  { value: "UNTIL_REACTIVE", label: "Until reactive" },
  { value: "1_MIN", label: "1 minute" },
  { value: "15_MIN", label: "15 minutes" },
  { value: "30_MIN", label: "30 minutes" },
  { value: "1_HOUR", label: "1 hour" },
  { value: "2_HOUR", label: "2 hours" },
  { value: "1_DAY", label: "1 day" },
  { value: "5_DAY", label: "5 days" },
  { value: "1_WEEK", label: "1 week" },
];

function StatCard({ title, value, accent }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

function getAccountStateLabel(user) {
  if (user?.active === false) {
    return "Deactivated";
  }
  return "Active";
}

function CategoryChips({ categories }) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <span
          key={category}
          className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
        >
          {category}
        </span>
      ))}
    </div>
  );
}

function CategoryPill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
        selected
          ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
          selected
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent"
        }`}
      >
        ✓
      </span>
    </button>
  );
}

function AdminUserManagementPage() {
  const [summary, setSummary] = useState({
    userCount: 0,
    technicianCount: 0,
    adminCount: 0,
    technicians: [],
    users: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [deactivatingUserId, setDeactivatingUserId] = useState("");
  const [reactivatingUserId, setReactivatingUserId] = useState("");
  const [formError, setFormError] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUserManagementSummary();
      setSummary({
        userCount: data?.userCount ?? 0,
        technicianCount: data?.technicianCount ?? 0,
        adminCount: data?.adminCount ?? 0,
        technicians: Array.isArray(data?.technicians) ? data.technicians : [],
        users: Array.isArray(data?.users) ? data.users : [],
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load user management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    const refreshOnFocus = () => {
      loadSummary();
    };

    const intervalId = window.setInterval(() => {
      loadSummary();
    }, 15000);

    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, []);

  const technicianRows = useMemo(() => summary.technicians || [], [summary.technicians]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriesChange = (event) => {
    const selectedCategories = Array.from(event.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, categories: selectedCategories }));
  };

  const toggleCategory = (category) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((item) => item !== category)
          : [...prev.categories, category],
      };
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM);
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required.";
    if (!formData.contactNumber.trim()) return "Contact number is required.";
    if (!formData.email.trim()) return "Email address is required.";
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) return "Enter a valid email address.";
    if (formData.categories.length === 0) return "Select at least one technician category.";
    if (!formData.assignedArea) return "Assigned area is required.";
    return "";
  };

  const handleCreateTechnician = async (event) => {
    event.preventDefault();
    setFormError("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setSaving(true);
    try {
      await createTechnician({
        fullName: formData.fullName.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.email.trim(),
        categories: formData.categories,
        assignedArea: formData.assignedArea,
      });
      closeModal();
      await loadSummary();
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to create technician.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTechnician = async (technician) => {
    if (!technician?.id) return;

    const confirmed = window.confirm(`Remove technician ${technician.fullName}?`);
    if (!confirmed) return;

    setDeletingId(technician.id);
    setError("");
    try {
      await deleteTechnician(technician.id);
      await loadSummary();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to remove technician.");
    } finally {
      setDeletingId("");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id) return;

    const confirmed = window.confirm(`Remove user ${user.fullName}?`);
    if (!confirmed) return;

    setDeletingUserId(user.id);
    setError("");
    try {
      await deleteUser(user.id);
      await loadSummary();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to remove user.");
    } finally {
      setDeletingUserId("");
    }
  };

  const handleDeactivateUser = async (user, durationOption) => {
    if (!user?.id || !durationOption) return;

    const optionLabel = DEACTIVATION_OPTIONS.find((item) => item.value === durationOption)?.label || durationOption;
    const confirmed = window.confirm(`Deactivate ${user.fullName} for ${optionLabel}?`);
    if (!confirmed) return;

    setDeactivatingUserId(user.id);
    setError("");
    try {
      await deactivateUser(user.id, durationOption);
      await loadSummary();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to deactivate user.");
    } finally {
      setDeactivatingUserId("");
    }
  };

  const handleReactivateUser = async (user) => {
    if (!user?.id) return;

    const confirmed = window.confirm(`Reactivate ${user.fullName}?`);
    if (!confirmed) return;

    setReactivatingUserId(user.id);
    setError("");
    try {
      await reactivateUser(user.id);
      await loadSummary();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to reactivate user.");
    } finally {
      setReactivatingUserId("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-6 text-white shadow-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Administration</p>
            <h1 className="mt-2 text-3xl font-bold">User Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Manage users, admins, and technician profiles from one streamlined dashboard.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Users" value={summary.userCount} accent="text-blue-600" />
        <StatCard title="Technicians" value={summary.technicianCount} accent="text-emerald-600" />
        <StatCard title="Admins" value={summary.adminCount} accent="text-violet-600" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registered Technicians</h2>
            <p className="text-sm text-slate-500">All technician accounts registered in the system.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#0a192f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-[#61CE70] hover:text-[#0a192f]"
          >
            Add New Technician
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Technician ID</th>
                <th className="px-5 py-3">Full Name</th>
                <th className="px-5 py-3">Contact Number</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Assigned Area</th>
                <th className="px-5 py-3">Registered At</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                    Loading technicians...
                  </td>
                </tr>
              ) : technicianRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                    No technicians registered yet.
                  </td>
                </tr>
              ) : (
                technicianRows.map((tech) => (
                  <tr key={tech.id} className="align-top transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-700">{tech.userCode || "-"}</td>
                    <td className="px-5 py-4 text-slate-900">{tech.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{tech.contactNumber || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{tech.email}</td>
                    <td className="px-5 py-4 text-slate-600"><CategoryChips categories={tech.categories} /></td>
                    <td className="px-5 py-4 text-slate-600">{tech.assignedArea || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(tech.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteTechnician(tech)}
                        disabled={deletingId === tech.id}
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-all hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === tech.id ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registered Users</h2>
            <p className="text-sm text-slate-500">Users with the USER role stored in the system.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">User ID</th>
                <th className="px-5 py-3">Full Name</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Banned Until</th>
                <th className="px-5 py-3">Online</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Registered At</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : summary.users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-500">
                    No regular users registered yet.
                  </td>
                </tr>
              ) : (
                summary.users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-700">{user.userCode || "-"}</td>
                    <td className="px-5 py-4 text-slate-900">{user.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.active === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {getAccountStateLabel(user)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(user.bannedUntil)}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.online ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {user.online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.role || "USER"}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          defaultValue=""
                          onChange={(event) => {
                            const selectedValue = event.target.value;
                            if (!selectedValue) return;
                            handleDeactivateUser(user, selectedValue);
                            event.target.value = "";
                          }}
                          disabled={deactivatingUserId === user.id}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="" disabled>
                            {deactivatingUserId === user.id ? "Updating..." : "Deactivate"}
                          </option>
                          {DEACTIVATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {user.active === false && (
                          <button
                            type="button"
                            onClick={() => handleReactivateUser(user)}
                            disabled={reactivatingUserId === user.id}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {reactivatingUserId === user.id ? "Reactivating..." : "Reactivate"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={deletingUserId === user.id}
                          className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-all hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingUserId === user.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh]">
            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.3fr]">
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">New Technician</p>
                <h3 className="mt-3 text-2xl font-bold">Create a clean profile</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Use the required fields below to register a technician with a contact number,
                  assigned service area, and one or more specialties.
                </p>

                <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Role</span>
                    <span className="font-semibold text-emerald-300">TECHNICIAN</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Storage</span>
                    <span className="font-semibold">users collection</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Visibility</span>
                    <span className="font-semibold">Registered technicians list</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Selected Categories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.categories.length > 0 ? formData.categories.map((category) => (
                      <span key={category} className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
                        {category}
                      </span>
                    )) : (
                      <span className="text-sm text-slate-400">No categories selected yet.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="max-h-[90vh] overflow-y-auto p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Add New Technician</h3>
                    <p className="mt-1 text-sm text-slate-500">Create a technician account with required profile details.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                {formError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCreateTechnician} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
                      placeholder="e.g. Amila Perera"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Contact Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
                      placeholder="07XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
                      placeholder="technician@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Assigned Area <span className="text-red-500">*</span></label>
                    <select
                      name="assignedArea"
                      value={formData.assignedArea}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-[#61CE70] focus:bg-white focus:ring-4 focus:ring-[#61CE70]/15"
                    >
                      <option value="">Select assigned area</option>
                      {ASSIGNED_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
                        <p className="text-xs text-slate-500">Pick one or more specialties for this technician.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, categories: [] }))}
                        className="text-xs font-semibold text-slate-500 hover:text-[#61CE70]"
                      >
                        Clear selection
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {TECHNICIAN_CATEGORIES.map((category) => (
                        <CategoryPill
                          key={category}
                          label={category}
                          selected={formData.categories.includes(category)}
                          onClick={() => toggleCategory(category)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#0a192f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Creating..." : "Create Technician"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserManagementPage;
