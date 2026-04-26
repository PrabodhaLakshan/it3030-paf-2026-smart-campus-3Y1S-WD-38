import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/notifications";

export const getMyNotifications = async (userId, role, limit) => {
  const response = await axios.get(`${API_BASE_URL}/my`, {
    params: { userId, role, limit },
  });

  return response.data || [];
};

export const getMyUnreadNotificationCount = async (userId, role) => {
  const response = await axios.get(`${API_BASE_URL}/my/unread-count`, {
    params: { userId, role },
  });

  return Number(response.data?.count || 0);
};

export const markMyNotificationAsRead = async (notificationId, userId, role) => {
  const response = await axios.patch(`${API_BASE_URL}/${notificationId}/read`, null, {
    params: { userId, role },
  });

  return response.data;
};

export const createLoginNotification = async ({ userId, role, fullName }) => {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    userId,
    role,
    fullName,
  });

  return response.data;
};

export const createReactivationRequestNotification = async ({ userId, userCode, fullName }) => {
  const response = await axios.post(`${API_BASE_URL}/reactivation-request`, {
    userId,
    userCode,
    fullName,
  });

  return response.data;
};

export const createAdminBroadcastNotification = async ({
  senderUserId,
  senderRole,
  senderName,
  audiences,
  title,
  subject,
  message,
  actionUrl,
}) => {
  const response = await axios.post(`${API_BASE_URL}/admin/broadcast`, {
    senderUserId,
    senderRole,
    senderName,
    audiences,
    title,
    subject,
    message,
    actionUrl,
  });

  return response.data || [];
};

export const getAdminSentNotifications = async (senderUserId, limit = 200) => {
  const response = await axios.get(`${API_BASE_URL}/admin/sent`, {
    params: { senderUserId, limit },
  });

  return response.data || [];
};

export const formatNotificationTime = (value) => {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
};
