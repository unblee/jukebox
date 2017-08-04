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

  async pause(ctx) {
    this.player.pause();
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

  async shuffle_mode_on(ctx) {
    this.player.set_shuffle_mode(true);
    ctx.status = 200;
  }

  async shuffle_mode_off(ctx) {
    this.player.set_shuffle_mode(false);
    ctx.status = 200;
  }

  async status(ctx) {
    ctx.body = this.player.fetch_status();
    ctx.status = 200;
  }

  async seek(ctx) {
    this.player.destroy();
    this.player.start_specific(ctx.params.index);
    ctx.status = 200;
  }
};
