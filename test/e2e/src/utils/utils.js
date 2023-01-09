export const getErrorMessage = async () => {
  const errorDialBoxXPath = '/html/body/div[2]/div[3]/div';

  await page.waitForXPath(errorDialBoxXPath);

  const errorText =
    'body > div.MuiModal-root.MuiDialog-root.css-zw3mfo-MuiModal-root-MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper.css-hz1bth-MuiDialog-container > div';
  await page.waitForSelector(errorText);
  const element = await page.$(errorText);
  return await page.evaluate(el => el.textContent, element);
};
