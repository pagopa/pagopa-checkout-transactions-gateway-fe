import { getErrorMessage } from './utils/utils';

describe('Transaction gateway FE postepay authorization tests', () => {
  /**
   * Test input and configuration
   */
  const PAYMENT_TRANSACTION_GATEWAY_FE_URL = process.env.PAYMENT_TRANSACTION_GATEWAY_FE_URL;

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

  it('postepay - Should return 404 not found with wrong requestId', async () => {
    const WRONG_REQUEST_ID = process.env.WRONG_REQUEST_ID;

    await page.goto(`${PAYMENT_TRANSACTION_GATEWAY_FE_URL}/postepay?requestId=${WRONG_REQUEST_ID}`);
    const errorMessage = await getErrorMessage();

    expect(errorMessage).toContain('Spiacenti, si è verificato un errore imprevisto');
  });
});
