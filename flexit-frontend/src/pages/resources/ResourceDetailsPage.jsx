import { useEffect, useState } from "react";
import { getResourceById } from "../../api/resourceApi";
import { useParams, Link } from "react-router-dom";

function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);

  useEffect(() => {
    const loadResource = async () => {
      try {
        const response = await getResourceById(id);
        setResource(response.data);
      } catch (error) {
        console.error("Failed to fetch resource", error);
      }
    };
    loadResource();
  }, [id]);

  if (!resource) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#61CE70] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-6 flex gap-4 items-center">
        <Link to="/admin/resources" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Details</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed view of the resource information.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{resource.name}</h2>
            <div className="flex gap-3 items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {resource.type}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                resource.status === 'ACTIVE' 
                  ? 'bg-green-50 text-green-700 border-green-100' 
                  : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {resource.status}
              </span>
            </div>
          </div>
          <Link 
            to={`/admin/resources/edit/${resource.id}`}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
          >
            Edit Resource
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Location & Capacity</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Physical Location</p>
                  <p className="font-medium text-gray-900">{resource.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Max Capacity</p>
                  <p className="font-medium text-gray-900">{resource.capacity} People</p>
                </div>
              </div>
            </div>
          </div>

          <div>
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Availability Window</h3>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Daily Operating Hours</p>
                  <p className="font-medium text-gray-900">{resource.availabilityStart} - {resource.availabilityEnd}</p>
                </div>
              </div>
          </div>
        </div>

        {resource.description && (
          <div className="mt-8 pt-6 border-t border-gray-100">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
             <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
               {resource.description}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceDetailsPage;