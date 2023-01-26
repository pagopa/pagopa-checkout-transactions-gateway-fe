const {createProxyMiddleware} = require("http-proxy-middleware");

const apiHost = "http://127.0.0.1:8080";
const requestPaymentBasePath = "/request-payments/*";

module.exports = function (app) {
    app.use(createProxyMiddleware(requestPaymentBasePath, {
        target: apiHost,
    }));
}
