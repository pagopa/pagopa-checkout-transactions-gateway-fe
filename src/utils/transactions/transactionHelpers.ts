import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { VPosPollingResponse, vposPgsClient } from "../api/client";
import { CreditCardResumeRequest } from "../../generated/pgs/CreditCardResumeRequest";
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
  paymentAuthorizationId: string,
  bearerAuth: string
): TE.TaskEither<UNKNOWN, string> =>
  pipe(
    TE.tryCatch(
      () =>
        vposPgsClient.postMethodResumeVpos({
          bearerAuth,
          paymentAuthorizationId,
          body: {
            methodCompleted
          } as CreditCardResumeRequest
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
  paymentAuthorizationId: string,
  bearerAuth: string
): TE.TaskEither<UNKNOWN, VPosPollingResponse> =>
  pipe(
    TE.tryCatch(
      () =>
        vposPgsClient.getAuthPaymentVpos({
          bearerAuth,
          paymentAuthorizationId
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
                ? TE.of(responseType.value as unknown as VPosPollingResponse)
                : TE.left(UNKNOWN.value)
          )
        )
    )
  );
