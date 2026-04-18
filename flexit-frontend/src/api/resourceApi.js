const BASE_URL = 'http://localhost:8080/api/resources';

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const body = await parseResponse(response);
      if (body && typeof body === 'object' && body.message) {
        message = body.message;
      } else if (typeof body === 'string' && body.trim()) {
        message = body;
      } else {
        message = `Request failed with status ${response.status}`;
      }
    } catch {
      message = `Request failed with status ${response.status}`;
    }

    throw new Error(message);
  }

  return parseResponse(response);
};

export const getAllResources = async () => {
  const data = await request(BASE_URL);
  return { data };
};

export const createResource = async (resourceData) => {
  const data = await request(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(resourceData),
  });
  return { data };
};

export const updateResource = async (id, resourceData) => {
  const data = await request(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(resourceData),
  });
  return { data };
};

export const deleteResource = async (id) => {
  await request(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return { data: null };
};