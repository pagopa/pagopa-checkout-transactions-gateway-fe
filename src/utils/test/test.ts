/* eslint-disable  */

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

const test = {
  status: 200,
  body: {
    status: "AUTHORIZED"
  }
};
const expected = (resp: any) =>
  !(resp.status === 200 && resp.body.status === "CREATED");

const result = pipe(
  E.fromPredicate(
    (resp: any) => resp.status === 200,
    () => false
  )(test),
  E.map(async (_resp) => {
    const jsonBody = test.body;
    return pipe(
      E.fromPredicate(
        () => _resp.status === 200 && jsonBody.status === "CREATED",
        () => false
      )
    );
  }),
  E.isLeft
);
console.log(`Result: ${result} - expected ${expected(test)} `);
