import { createClient } from "../../generated/pgs/client";
import { getConfigOrThrow } from "../config/config";
import { retryingFetch } from "./fetch";

const conf = getConfigOrThrow();

export const apiPgsClient = createClient({
  baseUrl: conf.API_HOST,
  basePath: conf.API_BASEPATH,
  fetchApi: retryingFetch(3),
});
