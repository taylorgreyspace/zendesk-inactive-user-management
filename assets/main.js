import {
  renderFilterButtons,
  renderFilterForm,
  renderUserHeaders,
} from "./render.js";
import { requestUserInfo } from "./requests.js";

/*
filters = { 
  lastLoginBefore: string,
  paidSeats: boolean
}
*/

$(function () {
  const client = ZAFClient.init();
  console.log("init");
  renderFilterForm();
  renderUserHeaders();

  const getUsers = (filters) => {
    requestUserInfo(client, filters);
  };
  renderFilterButtons(getUsers);
});
