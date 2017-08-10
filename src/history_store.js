const fs = require('fs');
const path = require('path');

const ENCODE_TYPE = 'utf8';
const Track = require('./track');
const HistoryItem = require('./history_item');

module.exports = class HistoryStore {
  readSync() {
    const items = JSON.parse(fs.readFileSync(this.constructor.storePath, ENCODE_TYPE));
    return items.map(item => new HistoryItem(
      Object.assign(item, {
        track: new Track(item.track)
      })
    ));
  }

  writeSync(content, { pretty = false } = {}) {
    const data = JSON.stringify(content, null, pretty ? '  ' : null);
    fs.writeFileSync(this.constructor.storePath, data, ENCODE_TYPE);
  }

  existsSync() {
    return fs.existsSync(this.constructor.storePath);
  }

  static get storePath() {
    return path.join(__dirname, '..', 'store', 'history.json');
  }
};
