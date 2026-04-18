import React, { useEffect, useState } from "react";
import { Layers, LoaderCircle } from "lucide-react";
import UserSidebar from "../../components/user_sidebar/UserSidebar";
import { getAllResources } from "../../api/resourceApi";

const TYPES = ["ALL", "LAB", "LECTURE_HALL", "MEETING_ROOM", "PROJECTOR", "CAMERA"];

const TYPE_LABELS = {
  ALL: "All",
  LAB: "Lab",
  LECTURE_HALL: "Lecture Hall",
  MEETING_ROOM: "Meeting Room",
  PROJECTOR: "Projector",
  CAMERA: "Camera",
};

function UserResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await getAllResources();
        // user requested "danata thiyen aresourece tika" (currently available resources).
        const activeResources = response.data.filter(r => r.status === 'ACTIVE');
        setResources(activeResources);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.resourceCode &&
        resource.resourceCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "ALL" || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(97,206,112,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_25%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f2_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 sm:px-6">
        <UserSidebar />

        <main className="flex-1 rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.65)] backdrop-blur xl:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_45%,_#61CE70_140%)] rounded-2xl text-emerald-300 shadow-md">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Available Resources
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Browse through all items and locations currently available for booking.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
            {/* Type Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    selectedType === type
                      ? "bg-slate-950 text-white shadow-md shadow-slate-900/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or item no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#61CE70]/50 focus:border-[#61CE70] text-sm transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 rounded-[2rem] border border-dashed border-slate-200 bg-white/50">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <LoaderCircle size={24} className="animate-spin text-[#61CE70]" />
                <p className="text-sm">Loading available resources...</p>
              </div>
            </div>
          ) : resources.length === 0 ? (
            <div className="flex items-center justify-center h-64 rounded-[2rem] border border-dashed border-slate-200 bg-white/50">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Layers size={32} className="text-slate-300" />
                <p className="text-sm font-medium">No active resources are currently found.</p>
              </div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex items-center justify-center h-64 rounded-[2rem] border border-dashed border-slate-200 bg-white/50">
              <p className="text-slate-500 font-medium">No resources found matching your search or filter.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {filteredResources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="group flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15)] hover:border-emerald-200 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {resource.name}
                      </h3>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50/80 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-blue-700 ring-1 ring-inset ring-blue-700/10 shadow-sm">
                        {resource.type?.replace("_", " ")}
                      </span>
                    </div>
                    
                    <p className="text-[13px] text-slate-500 mb-6 leading-relaxed line-clamp-3">
                      {resource.description || "No description provided for this resource. Contact the administrator for more details."}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Capacity</span>
                      <span className="font-bold text-slate-900 px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">{resource.capacity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">Location</span>
                      <span className="font-medium text-slate-700">{resource.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserResourcesPage;
