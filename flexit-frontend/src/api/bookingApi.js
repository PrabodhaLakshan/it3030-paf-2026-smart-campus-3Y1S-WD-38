import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/bookings";

export const getAllBookings = async () => {
  return await axios.get(API_BASE_URL);
};

export const getMyBookings = async (userId) => {
  return await axios.get(`${API_BASE_URL}/my/${userId}`);
};

export const createBooking = async (bookingData) => {
  return await axios.post(API_BASE_URL, bookingData);
};

export const approveBooking = async (id) => {
  return await axios.patch(`${API_BASE_URL}/${id}/approve`);
};

export const rejectBooking = async (id, reason) => {
  return await axios.patch(`${API_BASE_URL}/${id}/reject`, {
    reason,
  });
};

export const cancelBooking = async (id) => {
  return await axios.patch(`${API_BASE_URL}/${id}/cancel`);
};