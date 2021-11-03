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

export function formatUsers(users, comments, filters) {
  const formattedUsers = users.map((user) => {
    const lastLogin = user.last_login_at;
    user.last_login_at =
      lastLogin && lastLogin !== "Never" ? formatDate(lastLogin) : "Never";
    if (user.role_type === null) {
      user.role_type = "None";
    }
    const publicAuthorComments = comments.filter(
      (comment) => comment.author_id === user.id && comment.public
    );
    user.comments = publicAuthorComments;
    user.number_public_comments = publicAuthorComments.length;
    user.last_comment_at = getMostRecentCommentTime(publicAuthorComments);
    user.user_href = getUserHref(user.url, user.id);
    return user;
  });

  const filteredUsers = formattedUsers.filter((user) => {
    if (
      filters.maxPublicComments !== "" &&
      filters.publicCommentsBefore !== ""
    ) {
      const commentsSinceDate = user.comments.filter(
        (comment) =>
          new Date(comment.created_at).getTime() >
          new Date(filters.publicCommentsBefore).getTime()
      );
      return commentsSinceDate.length < filters.maxPublicComments;
    }
    return true;
  });

  return filteredUsers;
}

function getUserHref(url, id) {
  const path = url.replace("https://", "").split("/")[0];
  return `https://${path}/agent/users/${id}`;
}

function sortByCreatedAt(a, b) {
  const aTime = new Date(a.created_at).getTime();
  const bTime = new Date(b.created_at).getTime();
  if (aTime > bTime) {
    return -1;
  }
  if (bTime > aTime) {
    return 1;
  }
  return 0;
}

function getMostRecentCommentTime(publicUserComments) {
  const mostRecentComment = publicUserComments.sort(sortByCreatedAt);
  if (mostRecentComment.length > 0) {
    return formatDate(mostRecentComment[0].created_at);
  }
  return "N/A";
}
