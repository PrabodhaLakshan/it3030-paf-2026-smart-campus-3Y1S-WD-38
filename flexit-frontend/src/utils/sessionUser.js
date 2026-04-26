function safeParse(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeRole(value) {
  const role = (value || "").toUpperCase().trim();
  if (role === "USER") {
    return "USER";
  }

  if (role === "TECHNICIAN") {
    return "TECHNICIAN";
  }

  if (role === "ADMIN") {
    return "ADMIN";
  }

  return "USER";
}

function firstNonEmpty(values) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function parseBoolean(value, fallback = true) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return fallback;
}

function parseDateString(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString();
}

export function getSessionUser() {
  const fromFlexitUser = safeParse(localStorage.getItem("flexitUser"));
  const fromCurrentUser = safeParse(localStorage.getItem("currentUser"));
  const fromUser = safeParse(localStorage.getItem("user"));

  const merged = {
    ...(fromUser || {}),
    ...(fromCurrentUser || {}),
    ...(fromFlexitUser || {}),
  };

  const params = new URLSearchParams(window.location.search);
  const role = normalizeRole(params.get("role") || merged.role || "");
  const userIdCandidates = [params.get("userId"), merged.userId, merged.id];
  const userCode = firstNonEmpty([params.get("userCode"), merged.userCode]);

  // Only technician sessions should resolve identity from techId values.
  if (role === "TECHNICIAN") {
    userIdCandidates.splice(1, 0, params.get("techId"));
    userIdCandidates.push(merged.techId);
  }

  const userId = firstNonEmpty(userIdCandidates);
  const userName = firstNonEmpty([params.get("userName"), merged.userName, merged.name, merged.fullName]);
  const userEmail = firstNonEmpty([params.get("email"), merged.userEmail, merged.email]);
  const hasPassword = typeof merged.hasPassword === "boolean" ? merged.hasPassword : undefined;
  const isActive = parseBoolean(merged.isActive ?? merged.active, true);
  const bannedUntil = parseDateString(merged.bannedUntil);

  return {
    role,
    userId,
    userCode,
    userName,
    userEmail,
    hasPassword,
    isActive,
    bannedUntil,
  };
}

export function setSessionUser({ role, userId, userCode, userName, userEmail, hasPassword, isActive, bannedUntil }) {
  const nextUser = {
    role: normalizeRole(role),
    userId: firstNonEmpty([userId]),
    userCode: firstNonEmpty([userCode]),
    userName: firstNonEmpty([userName]),
    userEmail: firstNonEmpty([userEmail]),
    hasPassword: typeof hasPassword === "boolean" ? hasPassword : undefined,
    isActive: parseBoolean(isActive, true),
    bannedUntil: parseDateString(bannedUntil),
  };

  localStorage.setItem("flexitUser", JSON.stringify(nextUser));
}

export function clearSessionUser() {
  localStorage.removeItem("flexitUser");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("user");
}

export function isAuthenticated() {
  const sessionUser = getSessionUser();
  return Boolean(sessionUser.userId);
}

