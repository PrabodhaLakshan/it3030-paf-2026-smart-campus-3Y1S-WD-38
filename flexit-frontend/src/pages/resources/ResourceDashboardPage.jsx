import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllResources } from '../../api/resourceApi';

function ResourceDashboardPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await getAllResources();
        setResources(response.data);
      } catch (error) {
        console.error("Failed to load resources", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, []);

  const totalResources = resources.length;
  const activeResources = resources.filter(r => r.status === 'ACTIVE').length;
  const outOfServiceResources = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resource Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all system resources by status.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61CE70]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Side: All Resources */}
          <Link 
            to="/admin/resources"
            className="flex flex-col justify-center items-center py-20 px-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all group h-full"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Resources</h2>
            <p className="text-4xl font-black text-[#0a192f] mt-2">{totalResources}</p>
            <span className="mt-4 text-sm font-medium text-blue-600 group-hover:text-blue-700">View all &rarr;</span>
          </Link>

          {/* Right Side: Active & Out of Service */}
          <div className="flex flex-col gap-6">
            <Link 
              to="/admin/resources?status=ACTIVE"
              className="flex items-center p-8 bg-green-50/80 border border-green-200 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer hover:bg-green-100/60"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 shadow-sm transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800">Active Resources</h3>
                <p className="text-sm font-medium text-green-600/80 mt-1">Currently in use or available</p>
              </div>
              <p className="text-4xl font-black text-green-600 ml-4">{activeResources}</p>
            </Link>

            <Link 
              to="/admin/resources?status=OUT_OF_SERVICE"
              className="flex items-center p-8 bg-red-50/80 border border-red-200 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer hover:bg-red-100/60"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 shadow-sm transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-800">Out of Service</h3>
                <p className="text-sm font-medium text-red-600/80 mt-1">Under maintenance or unavailable</p>
              </div>
              <p className="text-4xl font-black text-red-600 ml-4">{outOfServiceResources}</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceDashboardPage;
