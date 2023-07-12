import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { getConfigOrThrow } from "../config/config";
import { constantPollingWithPromisePredicateFetch } from "../api/fetch";
import {
  StatusEnum as CcStatusEnum,
  CcPaymentInfoAcceptedResponse
} from "../../generated/pgs/CcPaymentInfoAcceptedResponse";
import {
  StatusEnum as AcsStatusEnum,
  CcPaymentInfoAcsResponse
} from "../../generated/pgs/CcPaymentInfoAcsResponse";
import {
  StatusEnum as XpayStatusEnum,
  XPayPaymentAuthorization
} from "../../generated/pgs/XPayPaymentAuthorization";
import { createClient } from "../../generated/pgs/client";
import { VPosPollingResponse } from "../../generated/pgs/VPosPollingResponse";

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
          XPayPaymentAuthorization.decode(jsonResponse),
          E.fold(
            (_) => false,
            (resp: XPayPaymentAuthorization) =>
              resp.status !== XpayStatusEnum.CREATED &&
              resp.status !== XpayStatusEnum.AUTHORIZED &&
              resp.status !== XpayStatusEnum.DENIED
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
      // If the following conditions are verified
      // it keeps trying <retries> times
      return (
        r.status !== 200 ||
        pipe(
          VPosPollingResponse.decode(jsonResponse),
          E.fold(
            (_) => false,
            (resp) =>
              pipe(
                CcPaymentInfoAcceptedResponse.decode(resp),
                E.fold(
                  (_err) =>
                    pipe(
                      CcPaymentInfoAcsResponse.decode(resp),
                      E.fold(
                        (_err) => false,
                        (acsResp) =>
                          acsResp.status === AcsStatusEnum.CREATED &&
                          acsResp.vposUrl === undefined
                      )
                    ),
                  (accResp) =>
                    accResp.status === CcStatusEnum.CREATED &&
                    accResp.vposUrl === undefined
                )
              )
          )
        )
      );
    }
  ),
  basePath: conf.API_BASEPATH
});
