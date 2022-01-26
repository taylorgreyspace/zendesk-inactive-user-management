import { formatDate } from "./dateUtils.js";

export function filterUsers(user, filters) {
  // If paid seats only, return false for no role or light agents
  if (filters.paidSeats) {
    if (user.role === "end-user") return false;
    if (
      user.role === "agent" &&
      (user.role_type === null || user.role_type === 2)
    ) {
      return false;
    }
  }
  if (!user.last_login_at || filters.lastLoginBefore === "") {
    return true;
  }
  // Filter out recently logged in users
  const userLastLogin = new Date(user.last_login_at);
  const lastLoginFilter = new Date(filters.lastLoginBefore);
  return userLastLogin.getTime() < lastLoginFilter.getTime();
}

export function formatUsers(users) {
  const formattedUsers = users.map((user) => {
    const lastLogin = user.last_login_at;
    user.last_login_at =
      lastLogin && lastLogin !== "Never" ? formatDate(lastLogin) : "Never";
    if (user.role_type === null) {
      user.role_type = "None";
    }
    user.user_href = getUserHref(user.url, user.id);
    return user;
  });
  return formattedUsers;
}

function getUserHref(url, id) {
  const path = url.replace("https://", "").split("/")[0];
  return `https://${path}/agent/users/${id}`;
}
