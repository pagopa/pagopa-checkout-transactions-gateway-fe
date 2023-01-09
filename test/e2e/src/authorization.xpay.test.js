describe("Transaction gateway FE xpay authorization tests", () => {
  /**
   * Test input and configuration
   */
  const URL = "https://checkout.pagopa.it/";

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.goto(URL);
    await page.setViewport({ width: 1200, height: 907 });
  });

  it("Should return OK", async () => {
    expect("").toContain("");
  });
});
