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

  return "USER";
}

function firstNonEmpty(values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
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
  const userId = firstNonEmpty([
    params.get("userId"),
    params.get("techId"),
    merged.userId,
    merged.id,
    merged.techId,
  ]);
  const userName = firstNonEmpty([params.get("userName"), merged.userName, merged.name]);

  return {
    role,
    userId,
    userName,
  };
}

export function setSessionUser({ role, userId, userName }) {
  const nextUser = {
    role: normalizeRole(role),
    userId: firstNonEmpty([userId]),
    userName: firstNonEmpty([userName]),
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

