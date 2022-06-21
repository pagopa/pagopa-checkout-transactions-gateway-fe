export function getRequestId() {
  return window.location.href.includes("?urlRedirect=")
    ? window.location.href
        .split("?urlRedirect=")[0]
        .split("/")
        .pop()
    : window.location.href.split("/").pop();
}

export function getCurrentLocation() {
  return window.location.href;
}

export function navigate(url: string) {
  window.location.assign(url);
}