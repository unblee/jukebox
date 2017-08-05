const fs = require('fs');
const path = require('path');

const ENCODE_TYPE = 'utf8';
const Track = require('./track');

module.exports = class PlayerStatusStore {
  readSync() {
    const status = JSON.parse(fs.readFileSync(this.storePath, ENCODE_TYPE));
    if (status.playlist) {
      status.playlist = status.playlist.map(x => new Track(x));
    }
    return status;
  }

  writeSync(content, { pretty = false } = {}) {
    const data = JSON.stringify(content, null, pretty ? '  ' : null);
    fs.writeFileSync(this.storePath, data, ENCODE_TYPE);
  }

  existsSync() {
    return fs.existsSync(this.storePath);
  }

  static get storePath() {
    return path.join(__dirname, '..', 'store', 'playerStatus.json');
  }
};
