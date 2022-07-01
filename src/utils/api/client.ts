// import { agent } from "@pagopa/ts-commons";
// import {
//   AbortableFetch,
//   setFetchTimeout,
//   toFetch
// } from "@pagopa/ts-commons/lib/fetch";
// import { Millisecond } from "@pagopa/ts-commons/lib/units";
// import { createClient } from "../../../generated/definitions/gateway-transactions-api/client";
// import { getConfig } from "../config";

// const abortableFetch = AbortableFetch(agent.getHttpFetch(process.env));
// const fetchWithTimeout = toFetch(
//   setFetchTimeout(getConfig().API_TIMEOUT as Millisecond, abortableFetch)
// );
// // tslint:disable-next-line: no-any
// const fetchApi: typeof fetchWithTimeout =
//   fetch as any as typeof fetchWithTimeout;

// export const apiTransactionsClient = createClient({
//   baseUrl: getConfig().API_HOST,
//   basePath: getConfig().API_BASEPATH,
//   fetchApi
// });
