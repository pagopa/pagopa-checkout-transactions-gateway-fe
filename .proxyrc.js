const {createProxyMiddleware} = require("http-proxy-middleware");

const apiHost = "http://127.0.0.1:8080";
const vposBasePath = "/request-payments/vpos/*";

module.exports = function (app) {
    app.use(createProxyMiddleware(vposBasePath, {
        target: apiHost,
    }));
}