/* eslint-disable sonarjs/no-identical-functions */
import { getConfig } from "./config";

const mockedXPayResponse = {
  html: '<html>\n<head>\n<title>\nGestione Pagamento Fraud detection</title>\n<script type="text/javascript" language="javascript">\nfunction moveWindow() {\n    document.tdsFraudForm.submit();\n}\n</script>\n</head>\n<body>\n<form name="tdsFraudForm" action="https://coll-ecommerce.nexi.it/ecomm/ecomm/TdsMerchantServlet" method="POST">\n<input type="hidden" name="action"     value="fraud">\n<input type="hidden" name="merchantId" value="31320986">\n<input type="hidden" name="description" value="7090069933_1606392234626">\n<input type="hidden" name="gdiUrl"      value="">\n<input type="hidden" name="gdiNotify"   value="">\n</form>\n<script type="text/javascript">\n  moveWindow();\n</script>\n</body>\n</html>\n',
  status: "CREATED",
  authOutcome: "OK",
  authCode: "123",
  redirectUrl:
    "http://localhost:8080/payment-gateway/request-payments/xpay/2d75ebf8-c789-46a9-9a22-edf1976a8917"
};
const mockedXPayBadResponse = {
  html: undefined,
  status: "CREATED",
  authOutcome: "OK",
  authCode: "123",
  redirectUrl:
    "http://localhost:8080/payment-gateway/request-payments/xpay/2d75ebf8-c789-46a9-9a22-edf1976a8917"
};

export function transactionFetch(
  url: string,
  onResponse: (data: any) => void,
  onError: (e: string) => void
) {
  if (url.includes("xpay")) {
    onResponse(mockedXPayBadResponse);
  } else {
    fetch(url)
      .then((resp) => {
        if (resp.ok || (resp.status < 400 && resp.status >= 300)) {
          return resp.json();
        }
        // TO DO Error handling for status !==200
        throw new Error("Generic Server Error");
      })
      .then(onResponse)
      .catch(onError);
  }
}

export function transactionPolling(
  url: string,
  onResponse: (data: any) => void,
  onError: (e: string) => void
) {
  setInterval(() => {
    if (url.includes("xpay")) {
      onResponse(mockedXPayResponse);
    } else {
      fetch(url)
        .then((resp) => {
          if (resp.ok || (resp.status < 400 && resp.status >= 300)) {
            return resp.json();
          }
          // TO DO Error handling for status !==200
          throw new Error("Generic Server Error");
        })
        .then(onResponse)
        .catch((e) => {
          onError(e);
        });
    }
  }, getConfig().API_GET_INTERVAL);
}
