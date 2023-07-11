const {createProxyMiddleware} = require("http-proxy-middleware");

const apiHost = "http://127.0.0.1:8080";
const vposBasePath = "/payment-transactions-gateway/web/v1/vpos/**";
const xpayBasePath = "/payment-transactions-gateway/web/v1/xpay/**";

module.exports = function (app) {
    app.use(createProxyMiddleware(vposBasePath, {
        target: apiHost,
    }));
    app.use(createProxyMiddleware(xpayBasePath, {
        target: apiHost,
    }));
}
