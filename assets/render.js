import { dateMinusOneMonth } from "./dateUtils.js";
import { updateUser, exportUsers } from "./requests.js";
import { formatUsers } from "./formatUtils.js";

// const defaultMaxComments = 1;
const oneMonthAgo = dateMinusOneMonth();
const isAdmin = true;

export function renderError(response) {
  const error_data = {
    status: response.status,
    statusText: response.statusText,
  };
  $("#loading-users").text("");
  if (response.responseJSON) {
    const details = response.responseJSON.details
      ? response.responseJSON.details.base.map((b) => b.description).join(" ")
      : "";
    const description = `${response.responseJSON.description}. ${details}`;
    error_data.errorDetails = response.responseJSON.error;
    error_data.description = description;
  }
  const source = $("#error-template").html();
  const template = Handlebars.compile(source);
  const html = template(error_data);
  $("#content").html(html);
}

export function renderFilterForm() {
  const source = $("#filter-form-template").html();
  const template = Handlebars.compile(source);
  const html = template({
    // max_public_comments: defaultMaxComments,
    last_login_before: oneMonthAgo,
    // public_comments_before: oneMonthAgo,
  });
  $("#filters").html(html);
  if (!isAdmin) {
    $("#paid-seats-label").hide();
  }
}

// export function renderNextPageButton(onNextPage) {
//   $("#next-page-button").show();
//   $("#next-page-button").click((e) => {
//     e.preventDefault();
//     onNextPage();
//   });
// }

// export function renderPrevPageButton(onPrevPage) {
//   $("#prev-page-button").show();
//   $("#next-page-button").click((e) => {
//     e.preventDefault();
//     onNextPage();
//   });
// }

function getCurrentPageNum(data, pageCount) {
  if (!data.previous_page) return 1;
  if (!data.next_page) return pageCount;
  const nextNum = data.next_page.split("page=")[1];
  return Number(nextNum) - 1;
}

export function renderPaginationElements(data, onPaginate) {
  const pageCount = Math.ceil(data.count / 100);
  $("#pagination-buttons").show();
  $("#num-pages").text(`${getCurrentPageNum(data, pageCount)}/${pageCount}`);

  if (data.next_page) {
    $("#next-page-button").prop("disabled", false);
    $("#next-page-button").click((e) => {
      e.preventDefault();
      onPaginate(data.next_page);
    });
  } else {
    $("#next-page-button").prop("disabled", true);
  }

  if (data.previous_page) {
    $("#prev-page-button").prop("disabled", false);
    $("#prev-page-button").click((e) => {
      e.preventDefault();
      onPaginate(data.previous_page);
    });
  } else {
    $("#prev-page-button").prop("disabled", true);
  }
}

export function renderFilterButtons(getUsers) {
  $("#toggle-filters").click((e) => {
    e.preventDefault();
    const text = $("#toggle-filters").text();
    if (text === "Hide filters") {
      $("#filters-form").hide();
      $("#toggle-filters").text("Show filters");
    } else {
      $("#filters-form").show();
      $("#toggle-filters").text("Hide filters");
    }
  });

  $("#filter-button").click((e) => {
    e.preventDefault();
    const lastLoginBefore = $("#last-login-before").val();
    // const lastLoginChecked = $("#last-login-check").prop("checked");

    // const maxPublicComments = $("#max-public-comments").val();
    // const publicCommentsBefore = $("#public-comments-before").val();
    // const publicCommentsChecked = $("#public-comments-check").prop("checked");

    const paidSeats = isAdmin ? $("#paid-seats").prop("checked") : true;

    getUsers({
      lastLoginBefore: lastLoginBefore,
      // maxPublicComments: publicCommentsChecked ? maxPublicComments : "",
      // publicCommentsBefore: publicCommentsChecked ? publicCommentsBefore : "",
      paidSeats,
    });
  });

  $("#clear-filter-button").click((e) => {
    e.preventDefault();
    // $("#last-login-check").prop("checked", false);
    // $("#public-comments-check").prop("checked", false);

    if (isAdmin) $("#paid-seats").prop("checked", false);

    getUsers({
      // maxPublicComments: "",
      lastLoginBefore: "",
      // publicCommentsBefore: "",
      paidSeats: !isAdmin,
    });
  });
}

export function renderUserHeaders() {
  const users_data = { users: [] };
  const source = $("#users-template").html();
  const template = Handlebars.compile(source);
  const html = template(users_data);
  $("#content").html(html);
}

export function renderUserInfo(client, users, filters) {
  const users_data = {
    users: formatUsers(users),
  };

  const source = $("#users-template").html();
  const template = Handlebars.compile(source);
  const html = template(users_data);
  $("#content").html(html);
  $("#loading-users").text("");
  $("#export-csv").show();
  $("#export-csv").click((e) => {
    e.preventDefault();
    exportUsers(client, filters);
  });
  if (!users_data.users.length) {
    $("#no-users-msg").text("No paid users match filters above");
  }

  renderChangeUserButtons(client, filters);
}

function renderChangeUserButtons(client, filters) {
  $(".change-to-end").click((e) => {
    e.preventDefault();
    const userID = e.target.id.replace("change-to-end-", "");
    $("#loading-users").text(`Updating user ${userID}...`);
    updateUser(client, userID, { role: "end-user" }, filters);
  });
}
