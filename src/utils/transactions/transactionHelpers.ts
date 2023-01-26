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

// eslint-disable-next-line @typescript-eslint/no-empty-function
const handleError = () => {};

export const handleMethodMessage = async (e: MessageEvent<any>) => {
  if (/^react-devtools/gi.test(e.data.source)) {
    return;
  }
  pipe(
    E.fromPredicate(
      (
        e1: MessageEvent<any> // TODO: check origin
      ) =>
        // e1.origin === config.CHECKOUT_PAGOPA_APIM_HOST &&
        e1.data === "3DS.Notification.Received",
      E.toError
    )(e),
    E.fold(
      () => {
        handleError();
      },
      (_) => {
        pipe(
          getStringFromSessionStorageTask("requestId"),
          TE.chain((requestId: string) =>
            pipe(resumeTransactionTask("Y", requestId))
          )
        );
      }
    )
  );
};

export const resumeTransactionTask = (
  methodCompleted: "Y" | "N" | undefined,
  requestId: string
): TE.TaskEither<UNKNOWN, number> =>
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
            (_responseType) => TE.of(UNKNOWN.value) // TODO: check response status code
          )
        )
    )
  );
