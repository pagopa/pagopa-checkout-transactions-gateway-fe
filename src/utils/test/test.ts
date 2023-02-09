/* eslint-disable  */

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

const test = {
  status: 302,
  body: {
    status: "AUTHORIZED"
  }
};
const expected = (resp: any) =>
  !(resp.status === 200 && resp.body.status === "CREATED");

const result = pipe(
  E.fromPredicate(
    (resp: any) => resp.status === 200,
    () => "error code"
  )(test),
  E.map(async (_resp) => {
    const jsonBody = test.body;
    return pipe(
      E.fromPredicate(
        () => jsonBody.status === "CREATED",
        () => "error status"
      ),
      () => E.isRight
    );
  }),
  E.isRight
);
console.log(`Result: ${result} - expected ${expected(test)} `);

export const getBody = async (_resp: any) => test.body
export const evaluateCode = (resp: any) => resp.status === 200
export const evaluateStatus = (jsonBody: any) => jsonBody.status === "CREATED"

const result2 = pipe(
  test,
  E.fromPredicate(
    evaluateCode,
    () => null,
  ),
  getBody,
  evaluateStatus
);
console.log(`Result2: ${result2} - expected ${expected(test)} `);


