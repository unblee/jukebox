const Track = require('../track');

module.exports = class PlaylistController {
  constructor(player, playlist) {
    this.player = player;
    this.playlist = playlist;
  }

  async add(ctx) {
    const links = ctx.request.body;
    const { tracks, errors } = await Track.createByLinks(links);
    this.playlist.adds(tracks, this._addOpts);

    ctx.body = errors;
    ctx.status = 200;
  }

  async clear(ctx) {
    this.playlist.replace();
    ctx.status = 200;
  }

  async remove(ctx) {
    this.playlist.remove(Number(ctx.params.index));
    ctx.status = 200;
  }

  async move(ctx) {
    this.playlist.move(Number(ctx.params.index), Number(ctx.params.newIndex));
    ctx.status = 200;
  }

  get _addOpts() {
    if (this.player.status.shuffleMode) {
      return {
        shuffleAdd: true,
        shuffleStartPos: this.player.status.nowPlayingIdx + 1
      };
    }
    return {};
  }
};
