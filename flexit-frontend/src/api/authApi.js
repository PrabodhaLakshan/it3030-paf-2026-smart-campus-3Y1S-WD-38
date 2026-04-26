import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api/auth';
export const registerUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${BASE_URL}/login`, credentials);
  return response.data;
};

export const googleLogin = async (payload) => {
  const response = await axios.post(`${BASE_URL}/google`, payload);
  return response.data;
};

export const getPasswordStatus = async (userId) => {
  const response = await axios.get(`${BASE_URL}/password-status/${userId}`);
  return response.data;
};

export const setOrChangePassword = async (payload) => {
  const response = await axios.post(`${BASE_URL}/password`, payload);
  return response.data;
};

export const updateUserPresence = async ({ userId, online }) => {
  const response = await axios.post(`${BASE_URL}/presence`, {
    userId,
    online,
  });
  return response.data;
};

export const getAccountAccessStatus = async (userIdOrCode) => {
  const response = await axios.get(`${BASE_URL}/status/${userIdOrCode}`);
  return response.data;
};
