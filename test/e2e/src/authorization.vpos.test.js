import { getErrorMessage } from "./utils/utils";
import { configurePgsMockDev } from "./utils/vposUtils";


describe('Transaction gateway FE VPOS authorization tests', () => {
  /**
   * Configuration parameter for use pgs mock. If enabled then psg mock will be configured and used during f.e. tests
   */
  const VPOS_USE_PGS_MOCK = process.env.VPOS_USE_PGS_MOCK;

    const VPOS_EXPECTED_REDIRECTION_URL = process.env.VPOS_EXPECTED_REDIRECTION_URL;

  /**
  * Increase default test timeout (30000ms)
  * to support entire payment flow
   */
  jest.setTimeout(30000);


  beforeAll(async () => {
    await page.setViewport({ width: 1200, height: 907 });
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);
  });


  it('VPOS - Should complete step 0 direct authorization', async () => {
    if (VPOS_USE_PGS_MOCK === "true") {
      let requestId = await configurePgsMockDev("00","00","00");
      expect(requestId).not.toBe("");
      await auth0Test(requestId, VPOS_EXPECTED_REDIRECTION_URL);
    } else {
      await auth0Test(process.env.VPOS_STEP_0_DIRECT_AUTH_REQUEST_ID, VPOS_EXPECTED_REDIRECTION_URL);
    }
  });

  it('VPOS - Should show error message for invalid request id', async () => {
    const requestId = process.env.VPOS_404_WRONG_REQUEST_ID;

    await page.goto(`${process.env.PAYMENT_TRANSACTION_GATEWAY_FE_URL}/vpos/${requestId}`);
    const errorMessage = await getErrorMessage();

    expect(errorMessage).toContain('Spiacenti, si è verificato un errore imprevisto');
  });

});



const auth0Test = async (requestId, expectedRedirectionUrl) => {
  await page.goto(`${process.env.PAYMENT_TRANSACTION_GATEWAY_FE_URL}/vpos/${requestId}`);
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  const finalUrl = await page.evaluate(() => document.location.href);
  expect(finalUrl).toContain(expectedRedirectionUrl);
}
