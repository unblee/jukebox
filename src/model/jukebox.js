const debug = require('debug')('jukebox:jukebox');
const Playlist = require('./playlist.js');
const Player = require('./player.js');
const PlayerStatus = require('./player_status.js');
const History = require('./history');

module.exports = class JukeBox {
  constructor() {
    debug('constructor()');
    this.playlist = new Playlist();
    this.playerStatus = new PlayerStatus();
    this.history = new History([], { maxLength: process.env.MAX_HISTORY_LENGTH });
    this.player = new Player(this.playlist, this.playerStatus, this.history);
    this.reload();
  }

  reload() {
    debug('reload()');
    this.player.load();
    this.history.load();
  }
};
