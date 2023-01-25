module.exports = {
    preset: "jest-puppeteer",
    testRegex: "./*.vpos.test\\.js$",
    reporters: [
        'default',
        [ 'jest-junit', {
          outputDirectory: './test_reports',
          outputName: 'checkout-transaction-gateway-ui-TEST.xml',
        } ]
      ]
    };