import { handleAsyncPagination } from "./apiUtils.js";
import { filterUsers } from "./formatUtils.js";
import { renderUserInfo, renderError } from "./render.js";

export async function requestUserInfo(client, filters) {
  $("#loading-users").text("Loading users...");
  $("#no-users-msg").text("");

  const settings = {
    url: "/api/v2/users.json?page[size]=100",
    type: "GET",
    dataType: "json",
  };

  function transformUsers(data) {
    return data.users.filter((user) => filterUsers(user, filters));
  }

  function handleSuccess(users) {
    if (users.length > 0) {
      requestTicketInfo(client, users, filters);
    } else {
      renderUserInfo(client, users, [], filters);
    }
  }

  handleAsyncPagination(client, settings, transformUsers, handleSuccess, true);
}

async function requestTicketInfo(client, users, filters) {
  const settings = {
    url: "/api/v2/tickets.json?page[size]=100",
    type: "GET",
    dataType: "json",
    sortBy: "updated_at",
    sortOrder: "desc",
  };

  function transformTickets(data) {
    return data.tickets.map((t) => t.id);
  }

  function handleSuccess(ticketIds) {
    const commentRequests = ticketIds.map((ticketId) =>
      requestCommentsForTicket(client, ticketId)
    );
    Promise.all(commentRequests)
      .then((c) => {
        const comments = c.reduce((acc, comment) => acc.concat(comment), []);
        renderUserInfo(client, users, comments, filters);
      })
      .catch((err) => {
        renderError(err);
      });
  }

  handleAsyncPagination(
    client,
    settings,
    transformTickets,
    handleSuccess,
    true
  );
}

async function requestCommentsForTicket(client, ticketID) {
  const settings = {
    url: `/api/v2/tickets/${ticketID}/comments.json?page[size]=100`,
    type: "GET",
    dataType: "json",
  };

  function transformComments(data) {
    return data.comments;
  }

  function handleSuccess(comments, error) {
    return new Promise((resolve, reject) => {
      if (error) {
        reject(error);
      } else {
        resolve(comments);
      }
    });
  }

  return handleAsyncPagination(
    client,
    settings,
    transformComments,
    handleSuccess
  );
}

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
