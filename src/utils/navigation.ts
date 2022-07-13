/* eslint-disable functional/immutable-data */
export function getQueryParam(query: string) {
  const url = new URL(window.location.href);
  const search = new URLSearchParams(url.search);
  return search.get(query);
}

export function getCurrentLocation() {
  return window.location.href;
}

export function navigate(url: string) {
  window.location.assign(url);
}
