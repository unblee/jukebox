const supertest = require('supertest');
const app = require('../../src/app');

module.exports = {
  app,
  request: supertest(app)
};
