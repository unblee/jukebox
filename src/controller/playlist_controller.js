module.exports = class PlaylistController {
  constructor(player, playlist) {
    this.player = player;
    this.playlist = playlist;
  }

  async add(ctx) {
    const opts = this.player.shuffle_mode
      ? {
          shuffle_add: true,
          shuffle_start_pos: this.player.now_playing_idx + 1
        }
      : {};
    ctx.body = await this.playlist.add(ctx.request.body, opts); // unavailable_links
    ctx.status = 200;
  }

  async clear(ctx) {
    this.playlist.replace();
    ctx.status = 200;
  }

  async remove(ctx, index) {
    this.playlist.remove(index);
    ctx.status = 200;
  }
};
