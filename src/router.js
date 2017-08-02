const KoaRouter = require("koa-router");
const PlayerController = require("./controller/player_controller");
const PlaylistController = require("./controller/playlist_controller");

module.exports = class Router extends KoaRouter {
  all_bind(player, playlist) {
    this.bind_player(player);
    this.bind_playlist(playlist);
  }

  bind_player(player) {
    const c = new PlayerController(player);
    this.player_controller = c;
    this.player = player;

    this.get("/player/status", c.status.bind(c));
    this.post("/player/start", c.start.bind(c));
    this.post("/player/pause", c.pause.bind(c));
    this.post("/player/next", c.next.bind(c));
    this.post("/player/prev", c.prev.bind(c));
    this.post("/player/loop/one/on", c.one_loop_on.bind(c));
    this.post("/player/loop/one/off", c.one_loop_off.bind(c));
    this.post("/player/loop/playlist/on", c.playlist_loop_on.bind(c));
    this.post("/player/loop/playlist/off", c.playlist_loop_off.bind(c));
    this.post("/player/loop/shuffle/on", c.shuffle_mode_on.bind(c));
    this.post("/player/loop/shuffle/off", c.shuffle_mode_off.bind(c));
  }

  bind_playlist(playlist) {
    const c = new PlaylistController(playlist);
    this.playlist_controller = c;
    this.playlist = playlist;

    this.post("/playlist", c.add.bind(c));
    this.delete("/playlist", c.clear.bind(c));
    this.delete("/playlist/:index", c.remove.bind(c));
  }
};
