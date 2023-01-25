import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { calculateExponentialBackoffInterval } from "@pagopa/ts-commons/lib/backoff";
import {
  AbortableFetch,
  retriableFetch,
  setFetchTimeout,
  toFetch
} from "@pagopa/ts-commons/lib/fetch";
import {
  RetriableTask,
  withRetries,
  TransientError
} from "@pagopa/ts-commons/lib/tasks";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { pipe } from "fp-ts/function";
import { getConfigOrThrow } from "../config/config";

const API_TIMEOUT = getConfigOrThrow().API_TIMEOUT as Millisecond;
//
// Fetch with transient error handling. Handle error that occurs once or at unpredictable intervals.
//
export function retryLogicForTransientResponseError(
  p: (r: Response) => boolean,
  retryLogic: (
    t: RetriableTask<Error, Response>,
    shouldAbort?: Promise<boolean>
  ) => TE.TaskEither<Error | "max-retries" | "retry-aborted", Response>
): typeof retryLogic {
  return (t: RetriableTask<Error, Response>, shouldAbort?: Promise<boolean>) =>
    retryLogic(
      // when the result of the task is a Response that satisfies
      // the predicate p, map it to a transient error
      pipe(
        t,
        TE.chain((r: Response) =>
          TE.fromEither(p(r) ? E.left(TransientError) : E.right(r))
        )
      ),
      shouldAbort
    );
}

export function retryingFetch(
  fetchApi: typeof fetch,
  timeout: Millisecond = API_TIMEOUT,
  maxRetries: number = 3
): typeof fetch {
  // a fetch that can be aborted and that gets cancelled after fetchTimeoutMs
  const abortableFetch = AbortableFetch(fetchApi);
  const timeoutFetch = toFetch(setFetchTimeout(timeout, abortableFetch));
  // configure retry logic with default exponential backoff
  // @see https://github.com/pagopa/io-ts-commons/blob/master/src/backoff.ts
  const exponentialBackoff = calculateExponentialBackoffInterval();
  const retryLogic = withRetries<Error, Response>(
    maxRetries,
    exponentialBackoff
  );
  const retryWithTransient429s = retryLogicForTransientResponseError(
    (_: Response) => _.status === 429,
    retryLogic
  );
  return retriableFetch(retryWithTransient429s)(timeoutFetch);
}
