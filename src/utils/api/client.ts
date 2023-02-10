import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { createClient } from "../../generated/pgs/client";
import { XPayPollingResponseEntity } from "../../generated/pgs/XPayPollingResponseEntity";
import { getConfigOrThrow } from "../config/config";
import { constantPollingWithPromisePredicateFetch } from "../api/fetch";
import {
  PaymentRequestVposResponse,
  StatusEnum
} from "../../generated/pgs/PaymentRequestVposResponse";

const conf = getConfigOrThrow();
const retries: number = 10;
const delay: number = 3000;
const timeout: Millisecond = conf.API_TIMEOUT as Millisecond;

export const postepayPgsClient = createClient({
  baseUrl: conf.API_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => r.status !== 200
  ),
  basePath: conf.API_BASEPATH
});

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
            (_) => false,
            (resp: XPayPollingResponseEntity) => resp.status !== "CREATED"
          )
        )
      );
    }
  ),
  basePath: conf.API_BASEPATH
});

export const vposPgsClient = createClient({
  baseUrl: conf.API_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      const jsonResponse = await r.clone().json();
      return (
        (r.status !== 200 && r.status !== 404) ||
        pipe(
          PaymentRequestVposResponse.decode(jsonResponse),
          E.fold(
            (_) => false,
            (resp) =>
              resp.status === StatusEnum.CREATED && resp.vposUrl === undefined
          )
        )
      );
    }
  ),
  basePath: conf.API_BASEPATH
});
