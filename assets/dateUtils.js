export function formatDate(date) {
  const cdate = new Date(date);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  date = cdate.toLocaleDateString("en-us", options);
  return date + " " + cdate.toLocaleTimeString("en-us");
}

export function dateMinusOneMonth() {
  const date = new Date(Date.now());
  const plusOneMonth = new Date(date.setMonth(date.getMonth() - 1));
  return getDateString(plusOneMonth);
}

function getDateString(date) {
  const month = zeroPadNumber(date.getMonth() + 1); // January is 0
  const day = zeroPadNumber(date.getDate());
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function zeroPadNumber(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return String(num);
}
