module.exports = class PlayerController {
  constructor(player) {
    this.player = player;
  }

  async start(ctx) {
    await this.player.start();
    ctx.status = 200;
  }

  async next(ctx) {
    await this.player.stop();
    await this.player.startNext();
    ctx.status = 200;
  }

  async prev(ctx) {
    await this.player.stop();
    await this.player.startPrev();
    ctx.status = 200;
  }

  async pause(ctx) {
    await this.player.pause();
    ctx.status = 200;
  }

  async restart(ctx) {
    await this.player.restart();
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
    await this.player.stop();
    await this.player.startSpecific(Number(ctx.params.index));
    ctx.status = 200;
  }

  async volume(ctx) {
    this.player.setVolume(ctx.request.body.volume);
    ctx.status = 200;
  }

  async volumeOff(ctx) {
    this.player.setVolume(0);
    ctx.status = 200;
  }

  async volumeOn(ctx) {
    this.player.setVolume(this.player.status.prevVolume);
    ctx.status = 200;
  }
};
