/* eslint-disable sonarjs/no-identical-functions */
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { PollingResponseEntity } from "../models/transactions";
import { apiTransactionsClient } from "./api/client";
import { getConfig } from "./config";

export function transactionFetch(
  url: string,
  onResponse: (data: PollingResponseEntity) => void,
  onError: (e: string) => void
) {
  fetch(url)
    .then(resp => {
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
  setInterval(() => {
    fetch(url)
      .then(resp => {
        if (resp.ok) {
          return resp.json();
        }
        // TO DO Error handling for status !==200
        throw new Error("Generic Server Error");
      })
      .then(onResponse)
      .catch(e => {
        //  clearInterval(interval);
        onError(e);
      });
  }, getConfig().API_GET_INTERVAL);
}

export async function webviewGetTransaction(
  id: string,
  onResponse: (data: PollingResponseEntity) => void,
  onError: (e: string) => void
) {
  void pipe(
    pipe(
      TE.tryCatch(
        () => apiTransactionsClient.webviewPolling({ requestId: id }),
        () => "Errors.generic"
      ),
      TE.fold(
        err => TE.left(err),
        errorOrResponse =>
          pipe(
            errorOrResponse,
            E.fold(
              () => TE.left("Errors.response"),
              responseType =>
                responseType.status !== 200
                  ? TE.left("Errors.status")
                  : TE.of(responseType.value)
            )
          )
      )
    ),
    TE.fold(
      (e: string) => async () => {
        onError(e);
      },
      response => async () => onResponse(response as PollingResponseEntity)
    )
  )();
}

export function webviewPolling(
  id: string,
  onResponse: (data: PollingResponseEntity) => void,
  onError: (e: string) => void
) {
  setInterval(async () => {
    await webviewGetTransaction(id, onResponse, onError);
  }, getConfig().API_GET_INTERVAL);
}
