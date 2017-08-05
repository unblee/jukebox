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
    this.player.startNext();
    ctx.status = 200;
  }

  async prev(ctx) {
    this.player.destroy();
    this.player.startPrev();
    ctx.status = 200;
  }

  async pause(ctx) {
    this.player.pause();
    ctx.status = 200;
  }

  async setLoopMode(ctx) {
    this.player.setLoopMode(ctx.params.mode);
    ctx.status = 200;
  }

  async shuffleModeOn(ctx) {
    this.player.setShuffleMode(true);
    ctx.status = 200;
  }

  async shuffleModeOff(ctx) {
    this.player.setShuffleMode(false);
    ctx.status = 200;
  }

  async status(ctx) {
    ctx.body = this.player.fetchStatus();
    ctx.status = 200;
  }

  async seek(ctx) {
    this.player.destroy();
    this.player.startSpecific(Number(ctx.params.index));
    ctx.status = 200;
  }
};
