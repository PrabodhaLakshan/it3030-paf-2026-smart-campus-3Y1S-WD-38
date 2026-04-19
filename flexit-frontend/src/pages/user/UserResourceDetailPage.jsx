import { useEffect, useState } from "react";
import { getResourceById } from "../../api/resourceApi";
import { useParams, useNavigate } from "react-router-dom";
import UserSidebar from "../../components/user_sidebar/UserSidebar";
import {
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  CalendarCheck,
  Tag,
  Layers,
  LoaderCircle,
} from "lucide-react";

const TYPE_COLORS = {
  LAB: "bg-violet-50 text-violet-700 ring-violet-700/10",
  LECTURE_HALL: "bg-blue-50 text-blue-700 ring-blue-700/10",
  MEETING_ROOM: "bg-amber-50 text-amber-700 ring-amber-700/10",
  PROJECTOR: "bg-cyan-50 text-cyan-700 ring-cyan-700/10",
  CAMERA: "bg-rose-50 text-rose-700 ring-rose-700/10",
};

function UserResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResource = async () => {
      try {
        setLoading(true);
        const response = await getResourceById(id);
        setResource(response.data);
      } catch (error) {
        console.error("Failed to fetch resource", error);
      } finally {
        setLoading(false);
      }
    };
    loadResource();
  }, [id]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(97,206,112,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_25%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f2_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6">
        <UserSidebar />

        <main className="flex-1 rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.65)] backdrop-blur xl:p-8">
          {/* Back Button + Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#61CE70_140%)] rounded-2xl text-emerald-300 shadow-md">
                <Layers size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Resource Details
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  View full information and book this resource.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 rounded-[2rem] border border-dashed border-slate-200 bg-white/50">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <LoaderCircle size={28} className="animate-spin text-[#61CE70]" />
                <p className="text-sm">Loading resource details...</p>
              </div>
            </div>
          ) : !resource ? (
            <div className="flex items-center justify-center h-64 rounded-[2rem] border border-dashed border-slate-200 bg-white/50">
              <p className="text-slate-500 font-medium">Resource not found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero Card */}
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                {/* Name + Type + Status + Book Button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {resource.name}
                    </h2>
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Type Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ring-1 ring-inset shadow-sm ${
                          TYPE_COLORS[resource.type] ||
                          "bg-slate-50 text-slate-700 ring-slate-700/10"
                        }`}
                      >
                        <Tag size={11} />
                        {resource.type?.replace(/_/g, " ")}
                      </span>
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ring-1 ring-inset shadow-sm ${
                          resource.status === "ACTIVE"
                            ? "bg-green-50 text-green-700 ring-green-700/10"
                            : "bg-red-50 text-red-700 ring-red-700/10"
                        }`}
                      >
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                            resource.status === "ACTIVE"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        {resource.status}
                      </span>
                      {/* Resource Code */}
                      {resource.resourceCode && (
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-mono font-semibold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-700/10">
                          #{resource.resourceCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={() => navigate(`/user/booking/${resource.id}`)}
                    disabled={resource.status !== "ACTIVE"}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-md transition-all active:scale-95 whitespace-nowrap ${
                      resource.status === "ACTIVE"
                        ? "bg-[linear-gradient(135deg,_#22c55e,_#16a34a)] text-white hover:shadow-[0_8px_24px_-6px_rgba(34,197,94,0.55)] hover:-translate-y-0.5"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <CalendarCheck size={17} />
                    {resource.status === "ACTIVE" ? "Book Now" : "Unavailable"}
                  </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Location */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Location
                      </p>
                      <p className="font-semibold text-slate-900">
                        {resource.location}
                      </p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Capacity
                      </p>
                      <p className="font-semibold text-slate-900">
                        {resource.capacity} People
                      </p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Available Hours
                      </p>
                      <p className="font-semibold text-slate-900">
                        {resource.availabilityStart} – {resource.availabilityEnd}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {resource.description && (
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Description
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-[15px]">
                    {resource.description}
                  </p>
                </div>
              )}

              {/* Bottom Book CTA */}
              {resource.status === "ACTIVE" && (
                <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">
                      Ready to book{" "}
                      <span className="text-emerald-600">{resource.name}</span>?
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Select your preferred time slot and confirm your booking.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/user/booking/${resource.id}`)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[linear-gradient(135deg,_#22c55e,_#16a34a)] text-white font-bold text-sm shadow-lg hover:shadow-[0_10px_30px_-8px_rgba(34,197,94,0.6)] hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <CalendarCheck size={17} />
                    Book This Resource
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserResourceDetailPage;
