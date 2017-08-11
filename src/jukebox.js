const Playlist = require('./playlist.js');
const Player = require('./player.js');
const PlayerStatus = require('./player_status.js');

module.exports = class JukeBox {
  constructor() {
    this.playlist = new Playlist();
    this.playerStatus = new PlayerStatus();
    this.player = new Player(this.playlist, this.playerStatus);
    this.player.load();
  }

  reload() {
    this.player.load();
  }
};
