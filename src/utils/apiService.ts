/* eslint-disable sonarjs/no-identical-functions */
import { getConfig } from "./config";

export function transactionFetch(
  url: string,
  onResponse: (data: any) => void,
  onError: (e: string) => void
) {
  fetch(url)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      // TO DO Error handling for status !==200
      throw new Error("Generic Server Error");
    })
    .then(onResponse)
    .catch(onError);
}

export function transactionPolling(
  url: string,
  onResponse: (data: any) => void,
  onError: (e: string) => void
) {
  return setInterval(() => {
    fetch(url)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        }
        // TO DO Error handling for status !==200
        throw new Error("Generic Server Error");
      })
      .then(onResponse)
      .catch(onError);
  }, getConfig().API_GET_INTERVAL);
}
