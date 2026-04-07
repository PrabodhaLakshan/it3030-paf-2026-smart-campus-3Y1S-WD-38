import { useState } from "react";

function ResourceForm({ initialData, onSubmit, submitLabel }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <select name="type" value={formData.type} onChange={handleChange}>
        <option value="LECTURE_HALL">Lecture Hall</option>
        <option value="LAB">Lab</option>
        <option value="MEETING_ROOM">Meeting Room</option>
        <option value="PROJECTOR">Projector</option>
        <option value="CAMERA">Camera</option>
      </select>
      <input name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} required />
      <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
      <input name="availabilityStart" type="time" value={formData.availabilityStart} onChange={handleChange} required />
      <input name="availabilityEnd" type="time" value={formData.availabilityEnd} onChange={handleChange} required />
      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="ACTIVE">ACTIVE</option>
        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
      </select>
      <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

export default ResourceForm;