import React from 'react';
import { useParams } from 'react-router-dom';

function EditResourcePage() {
  const { id } = useParams();

  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-900">Edit Resource</h1>
      <p className="mt-2 text-gray-600">Editing resource ID: {id}</p>
    </section>
  );
}

export default EditResourcePage;
