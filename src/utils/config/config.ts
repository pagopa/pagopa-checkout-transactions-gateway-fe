/**
 * Config module
 *
 * Single point of access for the application configuration. Handles validation on required environment variables.
 * The configuration is evaluate eagerly at the first access to the module. The module exposes convenient methods to access such value.
 */

import * as t from "io-ts";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";

export type IConfig = t.TypeOf<typeof IConfig>;
export const IConfig = t.interface({
  API_TIMEOUT: t.number,
  API_HOST: NonEmptyString,
  API_BASEPATH: NonEmptyString,
  API_GET_INTERVAL: t.number
});

// No need to re-evaluate this object for each call
const errorOrConfig: t.Validation<IConfig> = IConfig.decode({
  API_TIMEOUT: +(process.env.API_TIMEOUT || 10000),
  API_HOST: process.env.API_HOST || "",
  API_BASEPATH: process.env.API_BASEPATH || "",
  API_GET_INTERVAL: +(process.env.API_GET_INTERVAL || 5000)
});

/**
 * Read the application configuration and check for invalid values.
 * Configuration is eagerly evalued when the application starts.
 *
 * @returns either the configuration values or a list of validation errors
 */
export function getConfig(): t.Validation<IConfig> {
  return errorOrConfig;
}

/**
 * Read the application configuration and check for invalid values.
 * If the application is not valid, raises an exception.
 *
 * @returns the configuration values
 * @throws validation errors found while parsing the application configuration
 */
export function getConfigOrThrow(): IConfig {
  return pipe(
    errorOrConfig,
    E.getOrElseW((errors) => {
      throw new Error(`Invalid configuration: ${readableReport(errors)}`);
    })
  );
}
