const supertest = require('supertest');
const storeHelper = require('./store_helper');

storeHelper.clearStore();
storeHelper.makeStub();

const { app, server } = require('../../src/app');

module.exports = {
  app,
  server,
  request: supertest(app),
  storeHelper,
  reload() {
    app.context.jukebox.reload();
  }
};
