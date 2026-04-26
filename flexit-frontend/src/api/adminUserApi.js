import axios from "axios";

const BASE_URL = "http://localhost:8081/api/auth/admin/users";

export const getUserManagementSummary = async () => {
  const response = await axios.get(`${BASE_URL}/summary`);
  return response.data;
};

export const createTechnician = async (payload) => {
  const response = await axios.post(`${BASE_URL}/technicians`, payload);
  return response.data;
};

export const deleteTechnician = async (technicianId) => {
  const response = await axios.delete(`${BASE_URL}/technicians/${technicianId}`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${BASE_URL}/${userId}`);
  return response.data;
};

export const deactivateUser = async (userId, durationOption) => {
  const response = await axios.post(`${BASE_URL}/${userId}/deactivation`, {
    durationOption,
  });
  return response.data;
};

export const reactivateUser = async (userId) => {
  const response = await axios.post(`${BASE_URL}/${userId}/reactivate`);
  return response.data;
};
