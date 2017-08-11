const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const PlayerStatusStore = require('../../src/player_status_store');
const HistoryStore = require('../../src/history_store');

const testStoreDir = path.join(__dirname, '..', '..', 'store');
const testPlayerStatusStorePath = path.join(testStoreDir, 'test_player_status.json');
const testHistoryStorePath = path.join(testStoreDir, 'test_history.json');

module.exports = {
  paths: {
    testPlayerStatusStorePath
  },
  makeStub() {
    return {
      PlayerStatusStore: {
        storePath: sinon.stub(PlayerStatusStore, 'storePath').get(() => testPlayerStatusStorePath)
      },
      HistoryStore: {
        storePath: sinon.stub(HistoryStore, 'storePath').get(() => testHistoryStorePath)
      }
    };
  },
  clearStore() {
    [testPlayerStatusStorePath, testHistoryStorePath].forEach(p => {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    });
  }
};
