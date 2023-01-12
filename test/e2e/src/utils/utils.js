export const getErrorMessage = async () => {
  const errorDialBoxXPath = '/html/body/div[2]/div[3]/div';

  await page.waitForXPath(errorDialBoxXPath);

  const errorText =
    'body > div.MuiModal-root.MuiDialog-root.css-zw3mfo-MuiModal-root-MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper.css-hz1bth-MuiDialog-container > div';
  await page.waitForSelector(errorText);
  const element = await page.$(errorText);
  return await page.evaluate(el => el.textContent, element);
};

export const waitForNexiAuthPage = async () => {
  await page.waitForRequest(
    request => request.url().includes('ecomm/ecomm/TdsMerchantServlet') && request.method() === 'GET',
  );
};

export const getNexiErrorMessage = async () => {
  const errorDialBoxSelector = 'body > div > div > div > div > div.panel.panel-default > div';
  await page.waitForSelector(errorDialBoxSelector);

  const errorText = 'body > div > div > div > div > div.panel.panel-default > div > div > div > div:nth-child(1)';
  await page.waitForSelector(errorText);

  const element = await page.$(errorText);
  return await page.evaluate(el => el.textContent, element);
};
