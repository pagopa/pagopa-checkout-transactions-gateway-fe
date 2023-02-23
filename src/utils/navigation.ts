import { flow } from "fp-ts/function";

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

function getHash(url: string) {
  const { hash } = new URL(url);
  return hash;
}

function removeChars(subStr: string) {
  return (str: string) => str.replace(subStr, "");
}
export const getToken = flow(getHash, removeChars("#token="));
