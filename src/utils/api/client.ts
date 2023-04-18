import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { createClient } from "../../generated/pgs/client";
import {
  StatusEnum,
  XPayPollingResponseEntity
} from "../../generated/pgs/XPayPollingResponseEntity";
import { getConfigOrThrow } from "../config/config";
import { constantPollingWithPromisePredicateFetch } from "../api/fetch";
import { CcPaymentInfoAuthorizedResponse } from "../../generated/pgs/CcPaymentInfoAuthorizedResponse";
import { CcPaymentInfoAcsResponse } from "../../generated/pgs/CcPaymentInfoAcsResponse";
import { CcPaymentInfoAcceptedResponse } from "../../generated/pgs/CcPaymentInfoAcceptedResponse";

const conf = getConfigOrThrow();
const retries: number = 10;
const delay: number = 3000;
const timeout: Millisecond = conf.API_TIMEOUT as Millisecond;

export const VposPollingResponse =
  CcPaymentInfoAcceptedResponse ||
  CcPaymentInfoAuthorizedResponse ||
  CcPaymentInfoAcsResponse;

export type VposPollingResponse = t.TypeOf<typeof VposPollingResponse>;

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
            (resp: XPayPollingResponseEntity) =>
              resp.status !== StatusEnum.CREATED &&
              resp.status !== StatusEnum.AUTHORIZED &&
              resp.status !== StatusEnum.DENIED
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
          VposPollingResponse.decode(jsonResponse),
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
