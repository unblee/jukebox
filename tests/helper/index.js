const supertest = require('supertest');
const storeHelper = require('./store_helper');

storeHelper.clearStore();
storeHelper.makeStub();

const app = require('../../src/app');

module.exports = {
  app,
  request: supertest(app),
  storeHelper
};
