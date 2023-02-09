import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { createClient } from "../../generated/pgs/client";
import { XPayPollingResponseEntity } from "../../generated/pgs/XPayPollingResponseEntity";
import { getConfigOrThrow } from "../config/config";
import { constantPollingWithPromisePredicateFetch } from "./fetch";

const conf = getConfigOrThrow();
const retries: number = 10;
const delay: number = 3000;
const timeout: Millisecond = conf.API_TIMEOUT as Millisecond;
/*
export const pgsXPAYClient = createClient({
  baseUrl: conf.API_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> =>
      pipe(
        E.fromPredicate(
          (resp: Response) => resp.status !== 200,
          () => E.left(false)
        )(r),
        E.map(async (resp) => {
          const jsonBody = (await resp
            .clone()
            .json()) as XPayPollingResponseEntity;
          return pipe(
            E.fromPredicate(
              () => jsonBody.status !== "CREATED",
              () => E.left(false)
            )
          );
        }),
        E.isRight
      )
  ),
  basePath: ""
});*/




export const pgsXPAYClient = createClient({
  baseUrl: conf.API_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      const jsonResponse = await r.clone().json();
      return (
        r.status !== 200 ||
        pipe(
          XPayPollingResponseEntity.decode(jsonResponse),
          E.fold(
            _ => false,
            (resp) => (resp.status === "CREATED")),
        )
      );
    }
  ),
  basePath: ""
});

