const Playlist = require('./playlist.js');
const Player = require('./player.js');
const PlayerStatus = require('./player_status.js');
const PlayerStatusStore = require('./player_status_store.js');

module.exports = class JukeBox {
  constructor() {
    this.init();
  }

  init() {
    this.playerStatusStore = new PlayerStatusStore();
    if (this.playerStatusStore.existsSync()) {
      const x = this.playerStatusStore.readSync();
      this.playlist = new Playlist(x.playlist);
      this.playerStatus = new PlayerStatus(x);
    } else {
      this.playlist = new Playlist();
      this.playerStatus = new PlayerStatus();
    }

    this.player = new Player(this.playlist, this.playerStatus);
  }
};
