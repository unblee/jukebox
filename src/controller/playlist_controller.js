const Track = require('../track');

module.exports = class PlaylistController {
  constructor(player, playlist) {
    this.player = player;
    this.playlist = playlist;
  }

  async add(ctx) {
    const links = ctx.request.body;
    const { tracks, errors } = await Track.create_by_links(links);
    this.playlist.adds(tracks, this._add_opts);

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

  get _add_opts() {
    if (this.player.shuffle_mode) {
      return {
        shuffle_add: true,
        shuffle_start_pos: this.player.now_playing_idx + 1,
      };
    }
    return {};
  }
};
