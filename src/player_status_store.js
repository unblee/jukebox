const fs = require("fs");
const path = require("path");
const ENCODE_TYPE = "utf8";
const Track = require("./track");

module.exports = class PlayerStatusStore {
  read_sync() {
    const status = JSON.parse(fs.readFileSync(this.store_path, ENCODE_TYPE));
    if (status.playlist) {
      status.playlist = status.playlist.map(x => new Track(x));
    }
    return status;
  }

  write_sync(content, { pretty = false } = {}) {
    const data = JSON.stringify(content, null, pretty ? "  " : null);
    fs.writeFileSync(this.store_path, data, ENCODE_TYPE);
  }

  exists_sync() {
    return fs.existsSync(this.store_path);
  }

  get store_path() {
    return path.join(__dirname, "..", "store", "player_status.json");
  }
};
