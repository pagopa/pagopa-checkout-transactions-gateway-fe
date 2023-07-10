import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
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

export const configurePgsMockDev = async (step0Outcome, step1Outcome, step2Outcome) => {
  let authRequestId = '';
  console.log(`Configuring PGS mock for test and performing auth request:
    step0Outcome: [${step0Outcome}]
    step1Outcome: [${step1Outcome}]
    step2Outcome: [${step2Outcome}]`);
  const mockConfigurationStatusCode = await configureMockStepDirectAuth(step0Outcome, step1Outcome, step2Outcome);
  console.log(`PGS mock configuration http response status code: [${mockConfigurationStatusCode}]`);
  if (mockConfigurationStatusCode === 200) {
    const response = await authRequestVpos();
    if (response.errorHttpStatus === undefined) {
      authRequestId = response.paymentAuthorizationId;
    } else {
      console.log(`ERROR: KO auth request response received. http status code: [${response.errorHttpStatus}]`);
    }
  } else {
    console.log('ERROR: KO PGS mock configuration response received.');
  }
  console.log(`DEV auth request received: [${authRequestId}]`);
  return authRequestId;
};

export const configureMockStepDirectAuth = async (step0Outcome, step1Outcome, step2Outcome) =>
  fetch(VPOS_MOCK_CONFIGURATION_URL, {
    method: 'POST',
    body: JSON.stringify({
      method3dsOutcome: 'OK',
      step0Outcome,
      step1Outcome,
      step2Outcome,
      transactionStatusOutcome: '00',
      orderStatusOutcome: '00',
      httpOutcome: '200',
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'ocp-apim-subscription-key': VPOS_MOCK_API_KEY,
    },
  }).then(response => response.status);

export const authRequestVpos = async () =>
  fetch(VPOS_AUTH_URL, {
    method: 'POST',
    body: JSON.stringify({
      idTransaction: uuidv4(),
      reqRefNumber: '123456',
      amount: 12345,
      pan: '123456789124',
      securityCode: '123',
      expireDate: '30/12',
      holder: 'Username Surname',
      circuit: 'MASTERCARD',
      threeDsData: 'threeDSData',
      emailCH: 'test@mail.com',
      isFirstPayment: false,
      idPsp: 'BIC36019',
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'ocp-apim-subscription-key': VPOS_API_KEY,
    },
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return {
        errorHttpStatus: response.status,
      };
    }
  });
