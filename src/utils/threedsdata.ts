import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

/**
 * This function return a EMV compliant color depth
 * or take the maximum valid colorDepth below the given colorDepth.
 * @param colorDepth  (number)
 * @returns EMV compliant colorDepth (number)
 */
const getEMVCompliantColorDepth = (colorDepth: number): number => {
  const validColorsDepths: Array<number> = [1, 4, 8, 15, 16, 24, 32, 48];
  const maxValidColorDepthsLength: number = 48;

  const maybeValidColor = validColorsDepths.includes(colorDepth)
    ? colorDepth
    : validColorsDepths.find(
        (validColorDepth, index) =>
          validColorDepth < colorDepth &&
          colorDepth < validColorsDepths[index + 1]
      );

  return maybeValidColor === undefined
    ? maxValidColorDepthsLength
    : maybeValidColor;
};

/**
 * threeDSData according to 3DS2 protocol
 */
export const threeDSData = {
  browserJavaEnabled: navigator.javaEnabled().toString(),
  browserLanguage: navigator.language,
  browserColorDepth: getEMVCompliantColorDepth(screen.colorDepth).toString(),
  browserScreenHeight: screen.height.toString(),
  browserScreenWidth: screen.width.toString(),
  browserTZ: new Date().getTimezoneOffset().toString(),
  browserAcceptHeader: "browserInfo.accept", // TODO
  browserIP: "browserInfo.ip", // TODO
  browserUserAgent: navigator.userAgent,
  acctID: "",
  deliveryEmailAddress: pipe(
    O.fromNullable(
      JSON.parse(sessionStorage.getItem("useremail") || JSON.stringify(""))
    ),
    O.getOrElse(() => JSON.stringify(""))
  ),
  mobilePhone: null
};
