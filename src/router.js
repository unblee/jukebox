const KoaRouter = require('koa-router');
const PlayerController = require('./controller/player_controller');
const PlaylistController = require('./controller/playlist_controller');
const HistoryController = require('./controller/history_controller');

module.exports = class Router extends KoaRouter {
  allBind(player, playlist, history) {
    this.player = player;
    this.playlist = playlist;
    this.history = history;
    this.bindPlayer(player);
    this.bindPlaylist(player, playlist);
    this.bindHistory(history);
  }

  bindPlayer(player) {
    const c = new PlayerController(player);
    this.playerController = c;

    this.get('/player/status', c.status.bind(c));
    this.post('/player/start', c.start.bind(c));
    this.post('/player/pause', c.pause.bind(c));
    this.post('/player/next', c.next.bind(c));
    this.post('/player/prev', c.prev.bind(c));
    this.post('/player/seek/:index', c.seek.bind(c));
    this.post('/player/volume', c.volume.bind(c));
    this.post('/player/volume/on', c.volumeOn.bind(c));
    this.post('/player/volume/off', c.volumeOff.bind(c));
    this.post('/player/loop/:mode', c.setLoopMode.bind(c));
    this.post('/player/loop/shuffle/on', c.shuffleModeOn.bind(c));
    this.post('/player/loop/shuffle/off', c.shuffleModeOff.bind(c));
  }

  bindPlaylist(player, playlist) {
    const c = new PlaylistController(player, playlist);
    this.playlistController = c;

    this.post('/playlist', c.add.bind(c));
    this.delete('/playlist', c.clear.bind(c));
    this.delete('/playlist/:index', c.remove.bind(c));
  }

  bindHistory(history) {
    const c = new HistoryController(history);
    this.historyController = c;

    this.get('/history', c.getAll.bind(c));
  }
};
