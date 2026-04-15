import React from 'react';
import { useParams } from 'react-router-dom';

function ResourceDetailsPage() {
  const { id } = useParams();

  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-900">Resource Details</h1>
      <p className="mt-2 text-gray-600">Viewing resource ID: {id}</p>
    </section>
  );
}

export default ResourceDetailsPage;
