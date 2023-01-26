import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { getConfigOrThrow } from "../config/config";
import {
  Client,
  createClient as createPgsClient
} from "../../generated/pgs/client";
import { VposResumeRequest } from "../../generated/pgs/VposResumeRequest";
import { PaymentRequestVposResponse } from "../../generated/pgs/PaymentRequestVposResponse";
import { UNKNOWN } from "./transactionStatus";

const config = getConfigOrThrow();
const pgsClient: Client = createPgsClient({
  baseUrl: config.API_HOST,
  fetchApi: fetch
});

export const getStringFromSessionStorageTask = (
  key: string
): TE.TaskEither<UNKNOWN, string> =>
  pipe(
    O.fromNullable(sessionStorage.getItem(key)),
    O.fold(
      () => TE.left(UNKNOWN.value),
      (data) => TE.of(data)
    )
  );

export const resumePaymentRequestTask = (
  methodCompleted: "Y" | "N" | undefined,
  requestId: string
): TE.TaskEither<UNKNOWN, string> =>
  pipe(
    TE.tryCatch(
      () =>
        pgsClient.ResumeVposPaymentRequest({
          requestId,
          body: {
            methodCompleted
          } as VposResumeRequest
        }),
      () => E.toError
    ),
    TE.fold(
      () => TE.left(UNKNOWN.value),
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left(UNKNOWN.value), // TODO: handle error
            (response) => TE.of(response.value.requestId)
          )
        )
    )
  );

export const getPaymentRequestTask = (
  requestId: string
): TE.TaskEither<UNKNOWN, PaymentRequestVposResponse> =>
  pipe(
    TE.tryCatch(
      () =>
        pgsClient.GetVposPaymentRequest({
          requestId
        }),
      () => E.toError
    ),
    TE.fold(
      () => TE.left(UNKNOWN.value),
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left(UNKNOWN.value),
            (responseType) =>
              responseType.status === 200
                ? TE.of(responseType.value)
                : TE.left(UNKNOWN.value)
          )
        )
    )
  );
