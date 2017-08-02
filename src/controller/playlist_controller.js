module.exports = class PlaylistController {
  constructor(playlist) {
    this.playlist = playlist;
  }

  async add(ctx) {
    ctx.body = await this.playlist.add(ctx.request.body); // unavailable_links
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
