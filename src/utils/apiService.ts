import { PollingResponseEntity } from "../models/transactions";
import { getConfig } from "./config";

export function transactionFetch(
  url: string,
  onResponse: (data: PollingResponseEntity) => void,
  onError: (e: string) => void
) {
  fetch(url, {
    mode: "no-cors",
  })
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
  onResponse: (data: PollingResponseEntity) => void,
  onError: (e: string) => void
) {
  const interval = setInterval(() => {
    fetch(url, {
      mode: "no-cors",
    })
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        }
        // TO DO Error handling for status !==200
        throw new Error("Generic Server Error");
      })
      .then(onResponse)
      .catch((e) => {
        //clearInterval(interval);
        onError(e);
      });
  }, getConfig().API_GET_INTERVAL);
  setTimeout(() => clearInterval(interval), 20000); // only for test in local purpose, delete this in dev env
}
