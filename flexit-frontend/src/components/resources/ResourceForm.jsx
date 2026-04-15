import { useState } from "react";

const API_URL = "http://localhost:8080/api/resources";

function ResourceForm({ initialData }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      type: "LAB",
      capacity: 1,
      location: "",
      availabilityStart: "",
      availabilityEnd: "",
      status: "ACTIVE",
      description: "",
    }
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || "Failed to save resource.");
      }

      // Reset form on success
      setFormData({
        name: "",
        type: "LAB",
        capacity: 1,
        location: "",
        availabilityStart: "",
        availabilityEnd: "",
        status: "ACTIVE",
        description: "",
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Resource</h2>
        <p className="text-gray-500 text-sm mb-6">Fill in the details below to register a new resource.</p>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium">
            <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Resource saved successfully to the database!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all"
                name="name" placeholder="Resource Name" value={formData.name} onChange={handleChange} required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all"
                name="type" value={formData.type} onChange={handleChange}
              >
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="PROJECTOR">Projector</option>
                <option value="CAMERA">Camera</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all"
                name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all"
                name="location" placeholder="e.g. Building A, Room 101" value={formData.location} onChange={handleChange} required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability Start</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all"
                name="availabilityStart" type="time" value={formData.availabilityStart} onChange={handleChange} required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability End</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all"
                name="availabilityEnd" type="time" value={formData.availabilityEnd} onChange={handleChange} required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all"
                name="status" value={formData.status} onChange={handleChange}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#61CE70] focus:border-[#61CE70] outline-none transition-all min-h-[100px]"
                name="description" placeholder="Any additional details..." value={formData.description} onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              className="flex items-center gap-2 px-8 py-2.5 bg-[#0a192f] text-white font-semibold rounded-xl shadow-md hover:bg-[#61CE70] hover:text-[#0a192f] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {loading ? "Saving..." : "Save Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceForm;
