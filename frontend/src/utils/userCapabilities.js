import { AUTH_ROLES, normalizeFrontendRole } from "./authRoles";

export function getDisplayName(user) {
  if (!user) return "Usuario";

  const role = normalizeFrontendRole(user.role || user.roles?.[0]?.name);

  if (role === AUTH_ROLES.ADMINISTRATOR) {
    return "Administrador";
  }

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Usuario";
}

export function filterAdminUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.filter((u) => {
    if (u.status === "deleted") return false;
    const primaryRole = u.roles?.[0]?.name;
    return (
      primaryRole !== "super_admin" &&
      normalizeFrontendRole(primaryRole) !== AUTH_ROLES.ADMINISTRATOR
    );
  });
}

export function getProfileImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

