import { useEffect, useState } from 'react';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'PROJECTOR', 'CAMERA'];
const RESOURCE_STATUS = ['ACTIVE', 'OUT_OF_SERVICE'];

const createInitialState = (initialData) => ({
  name: initialData?.name || '',
  type: initialData?.type || 'LECTURE_HALL',
  capacity: initialData?.capacity?.toString() || '',
  location: initialData?.location || '',
  availabilityStart: initialData?.availabilityStart || '',
  availabilityEnd: initialData?.availabilityEnd || '',
  status: initialData?.status || 'ACTIVE',
  description: initialData?.description || '',
});

function ResourceForm({ initialData, onSubmit, submitLabel = 'Save' }) {
  const [formData, setFormData] = useState(() => createInitialState(initialData));

  useEffect(() => {
    setFormData(createInitialState(initialData));
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...formData,
      capacity: Number(formData.capacity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="resource-form">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Main Lecture Hall"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} required>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="50"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="Building A, Floor 2"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="availabilityStart">Availability Start</label>
          <input
            id="availabilityStart"
            name="availabilityStart"
            type="text"
            value={formData.availabilityStart}
            onChange={handleChange}
            placeholder="2026-04-17 09:00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="availabilityEnd">Availability End</label>
          <input
            id="availabilityEnd"
            name="availabilityEnd"
            type="text"
            value={formData.availabilityEnd}
            onChange={handleChange}
            placeholder="2026-04-17 17:00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} required>
            {RESOURCE_STATUS.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional notes about the resource"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}

export default ResourceForm;