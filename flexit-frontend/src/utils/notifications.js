const STORAGE_KEY = "flexitNotifications";
const ADMIN_USERS_KEY = "flexitAdminUsers";
const ADMIN_BROADCAST_USER_ID = "__ADMIN_BROADCAST__";

function safeParse(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function nextId() {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readAllNotifications() {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

function writeAllNotifications(notifications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("flexitNotificationsUpdated"));
  }
}

function readAdminUsers() {
  return safeParse(localStorage.getItem(ADMIN_USERS_KEY));
}

function writeAdminUsers(userIds) {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(userIds));
}

function normalizeRole(value) {
  return String(value || "").toUpperCase().trim();
}

function normalizeUserId(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function registerAdminUser(userId) {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) return;

  const uniqueUsers = Array.from(
    new Set([normalizedUserId, ...readAdminUsers().map(normalizeUserId)].filter(Boolean))
  );
  writeAdminUsers(uniqueUsers.slice(0, 50));
}

export function getAdminUserIds() {
  return readAdminUsers().map(normalizeUserId).filter(Boolean);
}

export function addNotificationForAdmins({
  title,
  message,
  type = "info",
  actionUrl = "/admin/notifications",
}) {
  // Always keep one admin broadcast entry so current/future admin sessions can see it.
  addNotification({
    userId: ADMIN_BROADCAST_USER_ID,
    title,
    message,
    type,
    actionUrl,
  });

  const adminUserIds = getAdminUserIds();

  adminUserIds.forEach((adminUserId) => {
    addNotification({
      userId: adminUserId,
      title,
      message,
      type,
      actionUrl,
    });
  });
}

export function addNotification({ userId, title, message, type = "info", actionUrl = "/user/notifications" }) {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) return;

  const current = readAllNotifications();
  const next = [
    {
      id: nextId(),
      userId: normalizedUserId,
      title,
      message,
      type,
      isRead: false,
      actionUrl,
      createdAt: new Date().toISOString(),
    },
    ...current,
  ].slice(0, 200);

  writeAllNotifications(next);
}

export function markNotificationAsRead(notificationId, userId, role = "") {
  if (!notificationId) return;

  const normalizedRole = normalizeRole(role);
  const normalizedUserId = normalizeUserId(userId);

  const next = readAllNotifications().map((item) => {
    const isOwner = normalizeUserId(item.userId) === normalizedUserId;
    const isAdminBroadcast =
      normalizedRole === "ADMIN" && item.userId === ADMIN_BROADCAST_USER_ID;

    if (item.id === notificationId && (isOwner || isAdminBroadcast)) {
      return {
        ...item,
        isRead: true,
      };
    }

    return item;
  });

  writeAllNotifications(next);
}

export function getNotificationsForUser(userId, role = "") {
  const normalizedRole = normalizeRole(role);
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId && normalizedRole !== "ADMIN") return [];

  return readAllNotifications()
    .filter((item) => {
      if (normalizeUserId(item.userId) === normalizedUserId) {
        return true;
      }

      return normalizedRole === "ADMIN" && item.userId === ADMIN_BROADCAST_USER_ID;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getNotificationCount(userId, role = "") {
  return getNotificationsForUser(userId, role).filter((item) => !item.isRead).length;
}

export function formatNotificationTime(value) {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
}
