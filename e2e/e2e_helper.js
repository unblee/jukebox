const sampleUrls = require('../tests/helper/sample_urls');

module.exports = {
  sampleUrls,
  E2E_WAIT_TIME: Number(process.env.E2E_WAIT_TIME) || 5000,
  E2E_PRESENT_WAIT_TIME: Number(process.env.E2E_PRESENT_WAIT_TIME) || 30000
};
