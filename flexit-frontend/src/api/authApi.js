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
