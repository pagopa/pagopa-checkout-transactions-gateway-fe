import fetch from "node-fetch";
import { v4 as uuidv4 } from 'uuid';


describe('Transaction gateway FE VPOS authorization tests', () => {
  /**
   * Configuration parameter for use pgs mock. If enabled then psg mock will be configured and used during f.e. tests
   */
  const VPOS_USE_PGS_MOCK = process.env.VPOS_USE_PGS_MOCK;

  /**
   * VPOS mock configuration URL 
   */
  const VPOS_MOCK_CONFIGURATION_URL = process.env.VPOS_MOCK_CONFIGURATION_URL;

  /**
   * VPOS authorization 
   */
  const VPOS_AUTH_URL = process.env.VPOS_AUTH_URL;

  const VPOS_MOCK_API_KEY = process.env.VPOS_MOCK_API_KEY;

  const VPOS_API_KEY = process.env.VPOS_API_KEY;

  const VPOS_EXPECTED_REDIRECTION_URL = process.env.VPOS_EXPECTED_REDIRECTION_URL;

   /**
   * Increase default test timeout (30000ms)
   * to support entire payment flow
    */
   jest.setTimeout(30000);
 
 
   beforeAll( async () => {
     await page.setViewport({ width: 1200, height: 907 });
     await page.setDefaultNavigationTimeout(30000);
     await page.setDefaultTimeout(30000);
   });
 
   
  it('VPOS - Should complete step 0 direct authorization', async () => {
    if (VPOS_USE_PGS_MOCK === "true") {
      //first call mock api for configure direct authorization
      expect(configureMockStep0DirectAuth(VPOS_MOCK_CONFIGURATION_URL, "00", "00", "00", VPOS_MOCK_API_KEY)).resolves.toBe(200);
      let response = await authRequestVpos(VPOS_AUTH_URL, VPOS_API_KEY);
      expect(response.errorHttpStatus).not.toBeDefined();
      await auth0Test(response.requestId, VPOS_EXPECTED_REDIRECTION_URL);
    } else {
      await auth0Test(process.env.VPOS_STEP_0_DIRECT_AUTH_REQUEST_ID, VPOS_EXPECTED_REDIRECTION_URL);
    }

  });
});

const auth0Test = async (requestId, expectedRedirectionUrl) => {
  await page.goto(`${process.env.PAYMENT_TRANSACTION_GATEWAY_FE_URL}/vpos/${requestId}`);
  await page.waitForNavigation({timeout: 20000, waitUntil: ['networkidle2']});
  const finalUrl = await page.url();
  expect(finalUrl).toContain(expectedRedirectionUrl);
}

const configureMockStep0DirectAuth = async (url,step0Outcome, step1Outcome, step2Outcome, apiKey) => fetch(url, {
  method: "POST",
  body: JSON.stringify({
    "method3dsOutcome": "OK",
    "step0Outcome": step0Outcome,
    "step1Outcome": step1Outcome,
    "step2Outcome": step2Outcome,
    "transactionStatusOutcome": "00",
    "orderStatusOutcome": "00",
    "httpOutcome": "200"
  }),
  headers: {
    "Content-type": "application/json; charset=UTF-8",
    "ocp-apim-subscription-key": apiKey
  }
}).then(response => response.status);

const authRequestVpos = async (url, apiKey) => fetch(url, {
  method: "POST",
  body: JSON.stringify({
    "idTransaction": uuidv4(),
    "reqRefNumber": "123456",
    "amount": 12345,
    "pan": "123456789124",
    "securityCode": "123",
    "expireDate": "30/12",
    "holder": "Username Surname",
    "circuit": "MASTERCARD",
    "threeDsData": "threeDSData",
    "emailCH": "test@mail.com",
    "isFirstPayment": false,
    "idPsp": "BIC36019"
  }),
  headers: {
    "Content-type": "application/json; charset=UTF-8",
    "ocp-apim-subscription-key": apiKey
  }
}).then(response => {
  if (response.ok) {
    return response.json();
  } else {
    return {
      errorHttpStatus: response.status
    };
  }
});