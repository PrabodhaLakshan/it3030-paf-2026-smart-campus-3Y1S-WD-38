import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Users,
  FileText,
  CheckSquare,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createBooking } from "../../api/bookingApi";
import { getAllResources } from "../../api/resourceApi";

const getStoredUserCode = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("flexitUser") || "null");
    if (storedUser?.userCode) {
      return storedUser.userCode;
    }

    if (
      typeof storedUser?.userId === "string" &&
      /^user\d+$/i.test(storedUser.userId)
    ) {
      return storedUser.userId;
    }

    return "";
  } catch {
    return "";
  }
};

function BookingsFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCode = searchParams.get("resourceCode");
  const [loggedInUserCode, setLoggedInUserCode] = useState(getStoredUserCode);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [formData, setFormData] = useState({
    userId: getStoredUserCode(),
    resourceId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    text: "",
  });

  const showAlert = (type, text) => {
    setAlert({
      show: true,
      type,
      text,
    });
  };

  const closeAlert = () => {
    setAlert({
      show: false,
      type: "",
      text: "",
    });
  };

  useEffect(() => {
    if (!alert.show) return;

    const timer = setTimeout(() => {
      closeAlert();
    }, 3500);

    return () => clearTimeout(timer);
  }, [alert.show]);

  useEffect(() => {
    if (!alert.show || alert.type !== "success") return;

    const redirectTimer = setTimeout(() => {
      navigate("/user/dashboard");
    }, 1800);

    return () => clearTimeout(redirectTimer);
  }, [alert.show, alert.type, navigate]);

  useEffect(() => {
    const storedUserCode = getStoredUserCode();
    setLoggedInUserCode(storedUserCode);
    setFormData((prev) => ({
      ...prev,
      userId: storedUserCode,
    }));
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResourcesLoading(true);
        const response = await getAllResources();
        const activeResources = (response.data || []).filter(
          (resource) => resource.status === "ACTIVE" && resource.resourceCode
        );
        setResources(activeResources);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
        setResources([]);
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Auto-select resource when coming from the detail page via Book Now
  useEffect(() => {
    if (!preselectedCode || resourcesLoading || resources.length === 0) return;
    const matched = resources.find(
      (r) => r.resourceCode === preselectedCode
    );
    if (matched) {
      setFormData((prev) => ({ ...prev, resourceId: matched.resourceCode }));
    }
  }, [preselectedCode, resourcesLoading, resources]);

  const getMinDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - offset * 60000);
    return localNow.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const max = new Date();
    max.setMonth(max.getMonth() + 1);
    const offset = max.getTimezoneOffset();
    const localMax = new Date(max.getTime() - offset * 60000);
    return localMax.toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "startTime" && prev.endTime && value && prev.endTime <= value) {
        updated.endTime = "";
      }

      return updated;
    });
  };

  const handleClear = () => {
    setFormData({
      userId: loggedInUserCode,
      resourceId: "",
      startTime: "",
      endTime: "",
      purpose: "",
      expectedAttendees: "",
    });
    closeAlert();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    closeAlert();

    if (!loggedInUserCode.trim()) {
      showAlert("error", "Logged-in user's user code was not found.");
      setLoading(false);
      return;
    }

    if (!formData.userId.trim()) {
      showAlert("error", "User code is required.");
      setLoading(false);
      return;
    }

    if (!formData.resourceId.trim()) {
      showAlert("error", "Resource code is required.");
      setLoading(false);
      return;
    }

    if (!formData.startTime) {
      showAlert("error", "Start time is required.");
      setLoading(false);
      return;
    }

    if (!formData.endTime) {
      showAlert("error", "End time is required.");
      setLoading(false);
      return;
    }

    if (!formData.purpose.trim()) {
      showAlert("error", "Purpose is required.");
      setLoading(false);
      return;
    }

    if (!formData.expectedAttendees) {
      showAlert("error", "Expected attendees is required.");
      setLoading(false);
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (end <= start) {
      showAlert("error", "End time must be later than start time.");
      setLoading(false);
      return;
    }

    if (Number(formData.expectedAttendees) <= 0) {
      showAlert("error", "Expected attendees must be greater than 0.");
      setLoading(false);
      return;
    }

    if (formData.purpose.trim().length > 100) {
      showAlert("error", "Purpose cannot exceed 100 characters.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        userId: formData.userId.trim(),
        resourceId: formData.resourceId.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose.trim(),
        expectedAttendees: Number(formData.expectedAttendees),
      };

      const response = await createBooking(payload);

      showAlert(
        "success",
        `Booking created successfully. Status: ${response.data.status}`
      );

      setFormData({
        userId: loggedInUserCode,
        resourceId: "",
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: "",
      });
    } catch (error) {
      console.error("Booking creation failed:", error);

      showAlert(
        "error",
        error?.response?.data?.message || "Failed to create booking request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {alert.show && (
        <div className="fixed right-6 top-6 z-50 w-full max-w-sm animate-[slideIn_.25s_ease-out]">
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-sm ${
              alert.type === "success"
                ? "border-green-200 bg-white text-green-700"
                : "border-red-200 bg-white text-red-700"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {alert.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {alert.type === "success" ? "Success" : "Error"}
              </p>
              <p className="mt-1 text-sm leading-5">{alert.text}</p>
            </div>

            <button
              type="button"
              onClick={closeAlert}
              className="shrink-0 rounded-full p-1 transition hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <Link
          to="/user/dashboard"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#61CE70]/10 px-4 py-2 text-sm font-semibold text-[#2d9d45]">
          <CheckSquare size={16} />
          User Booking Portal
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Book a Resource
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Submit a booking request for a room, lab, or equipment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              User Code
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              readOnly
              placeholder="Logged-in user code"
              className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
              required
            />
             
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Resource Code
            </label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
              disabled={resourcesLoading || resources.length === 0}
              required
            >
              <option value="">
                {resourcesLoading
                  ? "Loading resource codes..."
                  : resources.length === 0
                    ? "No active resources available"
                    : "Select a resource code"}
              </option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.resourceCode}>
                  {resource.resourceCode} - {resource.name}
                </option>
              ))}
            </select>
            
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={16} />
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              min={getMinDateTime()}
              max={getMaxDateTime()}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock3 size={16} />
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              min={formData.startTime || getMinDateTime()}
              max={getMaxDateTime()}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText size={16} />
              Booking Purpose
            </label>
            <textarea
              rows="4"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Enter the purpose of this booking request"
              maxLength={100}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
            ></textarea>
            <p className="mt-2 text-xs text-slate-500">
              {formData.purpose.length}/100 characters
            </p>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users size={16} />
              Expected Attendees
            </label>
            <input
              type="number"
              min="1"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              placeholder="Enter attendee count"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#61CE70] focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#61CE70]/20 bg-[#61CE70]/10 p-4">
          <p className="text-sm text-slate-700">
            Your booking request will be submitted with a{" "}
            <span className="font-semibold text-amber-600">PENDING</span> status
            and must be reviewed by an admin.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#61CE70] px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#52ba60] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Submitting..." : "Submit Booking Request"}
          </button>
        </div>
      </form>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) translateX(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0) translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default BookingsFormPage;
