describe('Transaction gateway FE VPOS authorization tests', () => {
  /**
   * Test input and configuration
   */
  const PAYMENT_TRANSACTION_GATEWAY_FE_URL = process.env.PAYMENT_TRANSACTION_GATEWAY_FE_URL;

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.setViewport({ width: 1200, height: 907 });
  });

  it('VPOS - Should complete step 0 direct authorization', async () => {
    const requestId = process.env.VPOS_STEP_0_DIRECT_AUTH_REQUEST_ID;

    await page.goto(`${PAYMENT_TRANSACTION_GATEWAY_FE_URL}/vpos/${requestId}`);
    await page.waitForNavigation();
    const finalUrl = page.url();
    expect(finalUrl).toContain('www.google.com');
  });
});
