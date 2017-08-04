const fs = require("fs");
const path = require("path");
const ENCODE_TYPE = "utf8";

module.exports = class PlayerStatusStore {
  read_sync() {
    return JSON.parse(fs.readFileSync(this.store_path, ENCODE_TYPE));
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
