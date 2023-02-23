import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { VposResumeRequest } from "../../generated/pgs/VposResumeRequest";
import { PaymentRequestVposResponse } from "../../generated/pgs/PaymentRequestVposResponse";
import { vposPgsClient } from "../api/client";
import { UNKNOWN } from "./transactionStatus";

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
  requestId: string,
  bearerAuth: string
): TE.TaskEither<UNKNOWN, string> =>
  pipe(
    TE.tryCatch(
      () =>
        vposPgsClient.ResumeVposPaymentRequest({
          bearerAuth,
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
  requestId: string,
  bearerAuth: string
): TE.TaskEither<UNKNOWN, PaymentRequestVposResponse> =>
  pipe(
    TE.tryCatch(
      () =>
        pgsClient.GetVposPaymentRequest({
          bearerAuth,
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
