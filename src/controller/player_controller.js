module.exports = class PlayerController {
  constructor(player) {
    this.player = player;
  }

  async start(ctx) {
    this.player.start();
    ctx.status = 200;
  }

  async next(ctx) {
    this.player.destroy();
    this.player.start_next();
    ctx.status = 200;
  }

  async prev(ctx) {
    this.player.destroy();
    this.player.start_prev();
    ctx.status = 200;
  }

  async stop(ctx) {
    this.player.destroy();
    ctx.status = 200;
  }

  async one_loop_on(ctx) {
    this.player.set_one_loop(true);
    ctx.status = 200;
  }

  async one_loop_off(ctx) {
    this.player.set_one_loop(false);
    ctx.status = 200;
  }

  async playlist_loop_on(ctx) {
    this.player.set_playlist_loop(true);
    ctx.status = 200;
  }

  async playlist_loop_off(ctx) {
    this.player.set_playlist_loop(false);
    ctx.status = 200;
  }

  async status(ctx) {
    ctx.body = this.player.fetch_status();
    ctx.status = 200;
  }
};
