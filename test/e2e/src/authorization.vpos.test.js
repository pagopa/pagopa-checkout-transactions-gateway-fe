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

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.setViewport({ width: 1200, height: 907 });
  });

  it('VPOS - Should complete step 0 direct authorization', async () => {
    let requestId;
    if (VPOS_USE_PGS_MOCK == true) {
      //first call mock api for configure direct authorization
      configureMockStep0DirectAuth("00","00","00").catch(error => {throw error});
      requestId = authRequestVpos().then(response.body.requestId).catch(error => {throw error});
    }else{
      requestId = process.env.VPOS_STEP_0_DIRECT_AUTH_REQUEST_ID;
    }
      await page.goto(`${PAYMENT_TRANSACTION_GATEWAY_FE_URL}/vpos/${requestId}`);
      await page.waitForNavigation();
      const finalUrl = page.url();
      expect(finalUrl).toContain('www.google.com');
    });
});

const configureMockStep0DirectAuth = (step0Outcome, step1Outcome,step2Outcome) => fetch(VPOS_MOCK_CONFIGURATION_URL, {
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
    "Content-type": "application/json; charset=UTF-8"
  }
}).then((resp) => {
  if (resp.ok) {
    return resp.json();
  }
  throw new Error("Error configuring mock");
});

const authRequestVpos = () => fetch(VPOS_AUTH_URL, {
  method: "POST",
  body: JSON.stringify({
    "idTransaction": "{{$guid}}",
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
    "Content-type": "application/json; charset=UTF-8"
  }
}).then((resp) => {
  if (resp.ok) {
    return resp.json();
  }
  throw new Error("Error performing VPOS authorization");
});