const Playlist = require('./playlist.js');
const Player = require('./player.js');
const PlayerStatus = require('./player_status.js');
const History = require('./history');
const HistoryStore = require('./history_store.js');

module.exports = class JukeBox {
  constructor() {
    this.playlist = new Playlist();
    this.playerStatus = new PlayerStatus();

    this.historyStore = new HistoryStore();
    let initialHistoryItems = [];
    if (this.historyStore.existsSync()) {
      initialHistoryItems = this.historyStore.readSync();
    }

    this.history = new History(initialHistoryItems, { maxLength: process.env.MAX_HISTORY_LENGTH });
    this.player = new Player(this.playlist, this.playerStatus, this.history);
    this.player.load();
  }

  reload() {
    this.player.load();
  }
};
