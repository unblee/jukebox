const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const PlayerStatusStore = require('../../src/player_status_store');

const testPlayerStatusStorePath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'store',
  'test_player_status.json'
);

module.exports = {
  paths: {
    testPlayerStatusStorePath
  },
  makeStub() {
    return {
      PlayerStatusStore: {
        storePath: sinon.stub(PlayerStatusStore, 'storePath').get(() => testPlayerStatusStorePath)
      }
    };
  },
  clearStore() {
    if (fs.existsSync()) {
      fs.unlinkSync(testPlayerStatusStorePath);
    }
  }
};
