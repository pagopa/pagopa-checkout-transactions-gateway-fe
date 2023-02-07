import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import { createClient } from "../../generated/pgs/client";
import { getConfigOrThrow } from "../config/config";
import { constantPollingWithPromisePredicateFetch } from "../config/fetch";

const conf = getConfigOrThrow();
const retries: number = 10;
const delay: number = 3000;
const timeout: Millisecond = conf.API_TIMEOUT as Millisecond;

export const pgsClient = createClient({
  baseUrl: conf.API_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      return (
        r.status === 200 
      );
    }
  ),
  basePath: ""
});
