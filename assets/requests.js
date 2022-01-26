import { handleAsyncPagination } from "./apiUtils.js";
import { filterUsers, formatUsers } from "./formatUtils.js";
import {
  renderUserInfo,
  renderError,
  renderPaginationElements,
} from "./render.js";

export async function requestUserInfo(client, filters, url) {
  $("#loading-users").text("Loading users...");
  $("#no-users-msg").text("");

  const roleFilter = filters.paidSeats ? "role[]=admin&role[]=agent&" : "";
  const settings = {
    url: url || `/api/v2/users.json?${roleFilter}`,
    type: "GET",
    dataType: "json",
  };

  function transformUsers(data) {
    return data.users.filter((user) => filterUsers(user, filters));
  }

  function handlePagination(url) {
    requestUserInfo(client, filters, url);
  }

  try {
    const data = await client.request(settings);
    console.log("page", data, transformUsers(data));
    renderUserInfo(client, transformUsers(data), filters);
    renderPaginationElements(data, handlePagination);
  } catch (err) {
    console.log("error", err);
    renderError(err);
  }
}

export async function exportUsers(client, filters) {
  $("#loading-users").text("Exporting users...");

  const roleFilter = filters.paidSeats ? "role[]=admin&role[]=agent&" : "";
  const settings = {
    url: `/api/v2/users.json?${roleFilter}`,
    type: "GET",
    dataType: "json",
  };

  function transformUsers(data) {
    return data.users.filter((user) => filterUsers(user, filters));
  }

  function handleSuccess(result, error) {
    if (error) {
      console.log("error", error);
      return;
    }
    const users = formatUsers(result);
    exportToCsv(users);
    $("#loading-users").text("");
  }

  handleAsyncPagination(client, settings, transformUsers, handleSuccess, true);
}

function exportToCsv(users) {
  const header = "id,name,role,role type,last login,url\n";
  const csv =
    header +
    users
      .map(
        (user) =>
          `${user.id},"${user.name}",${user.role},${user.role_type},"${user.last_login_at}",${user.user_href}`
      )
      .join("\n");

  console.log("csv", csv);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const today = new Date();
  const date = today.toLocaleDateString().replace(/\//g, "-");
  const filename = `inactive_users_${date}.csv`;
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

// async function requestTicketInfo(client, users, filters) {
//   const settings = {
//     url: "/api/v2/tickets.json?page[size]=100",
//     type: "GET",
//     dataType: "json",
//     sortBy: "updated_at",
//     sortOrder: "desc",
//   };

//   function transformTickets(data) {
//     return data.tickets.map((t) => t.id);
//   }

//   function handleSuccess(ticketIds) {
//     const commentRequests = ticketIds.map((ticketId) =>
//       requestCommentsForTicket(client, ticketId)
//     );
//     Promise.all(commentRequests)
//       .then((c) => {
//         const comments = c.reduce((acc, comment) => acc.concat(comment), []);
//         renderUserInfo(client, users, comments, filters);
//       })
//       .catch((err) => {
//         renderError(err);
//       });
//   }

//   handleAsyncPagination(
//     client,
//     settings,
//     transformTickets,
//     handleSuccess,
//     true
//   );
// }

// async function requestCommentsForTicket(client, ticketID) {
//   const settings = {
//     url: `/api/v2/tickets/${ticketID}/comments.json?page[size]=100`,
//     type: "GET",
//     dataType: "json",
//   };

//   function transformComments(data) {
//     return data.comments;
//   }

//   function handleSuccess(comments, error) {
//     return new Promise((resolve, reject) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(comments);
//       }
//     });
//   }

//   return handleAsyncPagination(
//     client,
//     settings,
//     transformComments,
//     handleSuccess
//   );
// }

export async function updateUser(client, userID, userUpdate, filters) {
  const settings = {
    url: `/api/v2/users/${userID}.json`,
    type: "PUT",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({ user: userUpdate }),
  };

  try {
    const data = await client.request(settings);
    requestUserInfo(client, filters);
  } catch (err) {
    renderError(err);
  }
}

// $("#create-users").click((e) => {
//   e.preventDefault();
//   const users = [];
//   for (let i = 0; i < 100; i++) {
//     users.push({
//       email: `fake${i}@greyspaceconsulting.co`,
//       name: `Test User ${i + 1}`,
//       role: "end-user",
//     });
//   }
//   const settings = {
//     url: `/api/v2/users/create_many.json`,
//     type: "POST",
//     dataType: "json",
//     contentType: "application/json",
//     data: JSON.stringify({ users }),
//   };

//   client.request(settings).then(
//     (data) => {
//       console.log("success!", data);
//       $("#check-users").click((e) => {
//         e.preventDefault();
//         console.log("can click");
//         const settings = {
//           url: `/api/v2/job_statuses/${data.job_status.id}`,
//           type: "GET",
//           dataType: "json",
//         };
//         client.request(settings).then(
//           (data) => console.log("job: ", data),
//           (err) => console.error("job error", err)
//         );
//       });
//     },
//     (err) => console.error("error", err)
//   );
// });
