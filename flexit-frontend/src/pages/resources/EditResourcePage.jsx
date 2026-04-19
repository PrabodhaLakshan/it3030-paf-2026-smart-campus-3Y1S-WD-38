import { useEffect, useState } from "react";
import { getResourceById, updateResource } from "../../api/resourceApi";
import { useNavigate, useParams, Link } from "react-router-dom";
import ResourceForm from "../../components/resources/ResourceForm";

function EditResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleUpdate = async (data) => {
    try {
      await updateResource(id, data);
      navigate("/admin/resources");
    } catch (err) {
      throw err; // Let ResourceForm catch & display the error
    }
  };

  if (!resource) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#61CE70] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-2">
       <div className="mb-6 flex gap-4 items-center">
        <Link to="/admin/resources" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Resource - {resource.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Update details for this resource.</p>
        </div>
      </div>
      <ResourceForm initialData={resource} onSubmit={handleUpdate} submitLabel="Update Resource" />
    </div>
  );
}

export default EditResourcePage;