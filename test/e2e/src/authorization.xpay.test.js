import { getErrorMessage, waitForNexiAuthPage } from './utils/utils';

describe('Transaction gateway FE xpay authorization tests', () => {
  /**
   * Test input and configuration
   */
  const PAYMENT_TRANSACTION_GATEWAY_FE_URL = process.env.PAYMENT_TRANSACTION_GATEWAY_FE_URL;

   /**
   * Increase default test timeout (180000ms)
   * to support entire payment flow
    */
   jest.setTimeout(180000);
 
 
   beforeAll( async () => {
     await page.setViewport({ width: 1200, height: 907 });
     await page.setDefaultNavigationTimeout(180000);
     await page.setDefaultTimeout(180000);
   });

  it.skip('xpay - Should return 404 not found with wrong requestId', async () => {
    const WRONG_REQUEST_ID = process.env.WRONG_REQUEST_ID;

    await page.goto(`${PAYMENT_TRANSACTION_GATEWAY_FE_URL}/xpay/${WRONG_REQUEST_ID}`);

    const errorMessage = await getErrorMessage();
    expect(errorMessage).toContain('Spiacenti, si è verificato un errore imprevisto');
  });

  it.skip('xpay - Should successfully authorize with correct requestId', async () => {
    const CORRECT_REQUEST_ID = process.env.NEXI_CORRECT_REQUEST_ID;

    await page.goto(`${PAYMENT_TRANSACTION_GATEWAY_FE_URL}/xpay/${CORRECT_REQUEST_ID}`);

    await waitForNexiAuthPage();
  });
});
