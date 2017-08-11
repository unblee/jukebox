const { server, reload, storeHelper } = require('../tests/helper');
const enableDestroy = require('server-destroy');

enableDestroy(server);

module.exports = {
  before(done) {
    storeHelper.makeStub();
    done();
  },

  after() {
    storeHelper.clearStore();
    server.destroy();
  },

  beforeEach(done) {
    storeHelper.clearStore();
    reload();
    done();
  },

  reporter(results, done) {
    done();

    // force exit
    const code = results.failed || results.errors ? 1 : 0;
    setTimeout(() => {
      console.warn(`Force exit server with code ${code}.`);
      process.exit(code);
    }, 3000);
  }
};
