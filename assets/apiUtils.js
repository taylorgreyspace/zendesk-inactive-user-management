export async function handleAsyncPagination(
  client,
  settings,
  transformData,
  handleSuccess,
  shouldDisplayErr = false
) {
  let url = settings.url;
  let error = undefined;
  let result = [];

  while (url !== undefined) {
    try {
      const data = await client.request({ ...settings, url });
      result = result.concat(transformData(data));
      url = data.meta.has_more ? data.links.next : undefined;
    } catch (err) {
      error = err;
      url = undefined;
    }
  }

  if (shouldDisplayErr && error) {
    return showError(error);
  } else {
    return handleSuccess(result, error);
  }
}
