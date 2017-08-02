module.exports = class PlaylistController {
  constructor(playlist) {
    this.playlist = playlist;
  }

  async add(ctx) {
    const unavailable_links = await this.playlist._add(ctx.request.body);

    if (unavailable_links.length !== 0) {
      ctx.body = unavailable_links;
    } else {
      ctx.body = [];
    }

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
