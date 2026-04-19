export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getStoredRole() {
  return localStorage.getItem("role") || getStoredUser()?.role || "";
}

export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

export function isSuperAdminRole(role) {
  const value = normalizeRole(role);
  return (
    value.includes("super admin") ||
    value.includes("superadmin") ||
    value.includes("platform admin") ||
    value.includes("system admin")
  );
}

export function isLeaderRole(role) {
  const value = normalizeRole(role);
  return (
    isSuperAdminRole(value) ||
    value.includes("lead") ||
    value.includes("manager") ||
    value.includes("head") ||
    value.includes("executive") ||
    value.includes("director") ||
    value.includes("coach")
  );
}

export function getDashboardPrefix() {
  return isSuperAdminRole(getStoredRole()) ? "superadmin" : "leader";
}

export function getDashboardPath(path = "") {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return `/dashboard/${getDashboardPrefix()}${normalizedPath ? `/${normalizedPath}` : ""}`;
}
