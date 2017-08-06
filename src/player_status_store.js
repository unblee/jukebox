const fs = require('fs');
const path = require('path');

const ENCODE_TYPE = 'utf8';
const Track = require('./track');
const State = require('./state');

module.exports = class PlayerStatusStore {
  readSync() {
    const status = JSON.parse(fs.readFileSync(this.constructor.storePath, ENCODE_TYPE));
    if (status.playlist) {
      status.playlist = status.playlist.map(x => new Track(x));
    }

    // force stop music
    status.state = State.STOPPED;

    return status;
  }

  writeSync(content, { pretty = false } = {}) {
    const data = JSON.stringify(content, null, pretty ? '  ' : null);
    fs.writeFileSync(this.constructor.storePath, data, ENCODE_TYPE);
  }

  existsSync() {
    return fs.existsSync(this.constructor.storePath);
  }

  static get storePath() {
    return path.join(__dirname, '..', 'store', 'player_status.json');
  }
};
