const KoaRouter = require('koa-router');
const PlayerController = require('./controller/player_controller');
const PlaylistController = require('./controller/playlist_controller');

module.exports = class Router extends KoaRouter {
  allBind(player, playlist) {
    this.player = player;
    this.playlist = playlist;
    this.bindPlayer(player);
    this.bindPlaylist(player, playlist);
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
};
