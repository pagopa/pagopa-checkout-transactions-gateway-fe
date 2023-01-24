import fetch from "node-fetch";

describe('Transaction gateway FE VPOS authorization tests', () => {
  /**
   * Test input and configuration
   */
  const PAYMENT_TRANSACTION_GATEWAY_FE_URL = process.env.PAYMENT_TRANSACTION_GATEWAY_FE_URL;

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

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.setViewport({ width: 1200, height: 907 });
  });

  it('VPOS - Should complete step 0 direct authorization', async () => {
    if (VPOS_USE_PGS_MOCK === "true") {
      //first call mock api for configure direct authorization
      expect(VPOS_MOCK_API_KEY).toBe(200);
      expect(configureMockStep0DirectAuth(VPOS_MOCK_CONFIGURATION_URL, "00", "00", "00", VPOS_MOCK_API_KEY)).resolves.toBe(200);
      let response = await authRequestVpos(VPOS_AUTH_URL, VPOS_API_KEY);
      expect(response).not.toBe("");
      await auth0Test(response.requestId, response.returnUrl)
    } else {
      await auth0Test(process.env.VPOS_STEP_0_DIRECT_AUTH_REQUEST_ID, 'www.google.com')
    }

  });
});

const auth0Test = async (requestId, returnUrl) => {
  await page.goto(`${PAYMENT_TRANSACTION_GATEWAY_FE_URL}/vpos/${requestId}`);
  await page.waitForNavigation();
  const finalUrl = page.url();
  expect(finalUrl).toContain(returnUrl);
}

const configureMockStep0DirectAuth = async (url, step0Outcome, step1Outcome, step2Outcome, apiKey) => fetch(url, {
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
    "idTransaction": "{{$guid}}", //TODO Cambiare id
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
    return response.json()
  } else {
    return "";
  }
});