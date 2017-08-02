const KoaRouter = require("koa-router");
const PlayerController = require("./controller/player_controller");

module.exports = class Router extends KoaRouter {
  constructor(player, playlist) {
    super();
    this.player = player;
    this.playlist = playlist;

    const player_controller = new PlayerController(player);
    this.player_controller = player_controller;

    this.post("/playlist", playlist.add());
    this.delete("/playlist", playlist.clear());
    this.delete("/playlist/:index", playlist.remove());

    this.get(
      "/player/status",
      player_controller.status.bind(player_controller)
    );
    this.post("/player/start", player_controller.start.bind(player_controller));
    this.post("/player/stop", player_controller.stop.bind(player_controller));
    this.post("/player/next", player_controller.next.bind(player_controller));
    this.post("/player/prev", player_controller.prev.bind(player_controller));
    this.post(
      "/player/loop/one/on",
      player_controller.one_loop_on.bind(player_controller)
    );
    this.post(
      "/player/loop/one/off",
      player_controller.one_loop_off.bind(player_controller)
    );
    this.post(
      "/player/loop/playlist/on",
      player_controller.playlist_loop_on.bind(player_controller)
    );
    this.post(
      "/player/loop/playlist/off",
      player_controller.playlist_loop_off.bind(player_controller)
    );
  }
};
