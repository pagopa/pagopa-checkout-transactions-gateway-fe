/* eslint-disable functional/immutable-data */
export function getRequestId() {
  const url = new URL(window.location.href);
  const search = new URLSearchParams(url.search);
  return search.get("requestId");
}

export function getPaymentGateway() {
  const url = new URL(window.location.href);
  const search = new URLSearchParams(url.search);
  return search.get("paymentGateway");
}

export function getUrlRedirect() {
  const url = new URL(window.location.href);
  const search = new URLSearchParams(url.search);
  return search.get("urlRedirect");
}

export function getCurrentLocation() {
  return window.location.href;
}

export function navigate(url: string) {
  window.location.assign(url);
}
