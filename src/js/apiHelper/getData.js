export async function getData(apiURL) {
  const response = await fetch(apiURL);
  const payload = await response.json();

  if (!response.ok) {
    const errorMessage =
      payload.error?.description ??
      payload.message ??
      payload.error ??
      `Restaurant search failed (HTTP ${response.status}).`;
    throw new Error(errorMessage);
  }

  return payload;
}