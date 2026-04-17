import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResourceForm from '../resources/ResourceForm';
import { getAllResources, createResource, updateResource, deleteResource } from '../../api/resourceApi';
import './Resources.css';

function Resources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllResources();
      setResources(response.data);
    } catch (err) {
      setError('Failed to fetch resources: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await createResource(formData);
      fetchResources();
      setShowForm(false);
      alert('Resource created successfully');
    } catch (err) {
      setError('Failed to create resource: ' + err.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateResource(editingId, formData);
      setEditingId(null);
      setEditingData(null);
      setShowForm(false);
      fetchResources();
      alert('Resource updated successfully');
    } catch (err) {
      setError('Failed to update resource: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        fetchResources();
        alert('Resource deleted successfully');
      } catch (err) {
        setError('Failed to delete resource: ' + err.message);
      }
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setEditingData(resource);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(false);
  };

  const handleNewResource = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(true);
  };

  return (
    <div className="resources">
      <main className="resources-main">
        <section className="resources-section">
          <div className="section-header">
            <h2>Resources</h2>
            <button className="btn-primary" onClick={handleNewResource}>
              + New Resource
            </button>
          </div>

          {error && <div className="error-alert">{error}</div>}
          
          {showForm && (
            <div className="form-container">
              <div className="form-header">
                <h3>{editingId ? 'Edit Resource' : 'Create New Resource'}</h3>
                <button className="close-btn" onClick={handleCancel}>✕</button>
              </div>
              <ResourceForm
                initialData={editingData}
                onSubmit={editingId ? handleUpdate : handleCreate}
                submitLabel={editingId ? 'Update' : 'Create'}
              />
            </div>
          )}

          {loading && <div className="loading">Loading...</div>}
          {!loading && resources.length === 0 && !showForm && (
            <div className="empty-state">
              <p>No resources found.</p>
              <button onClick={handleNewResource} className="btn-secondary">
                Create your first resource
              </button>
            </div>
          )}
          
          {!loading && resources.length > 0 && (
            <div className="table-container">
              <table className="resources-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td><strong>{resource.name}</strong></td>
                      <td>{resource.type}</td>
                      <td>{resource.capacity}</td>
                      <td>{resource.location}</td>
                      <td>
                        <span className={`status ${resource.status.toLowerCase()}`}>
                          {resource.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          onClick={() => handleEdit(resource)} 
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(resource.id)} 
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Resources;
