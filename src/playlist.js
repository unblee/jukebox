const ytdl = require("ytdl-core");
const Event = require("events");

module.exports = class Playlist {
  constructor(providers = [], ev) {
    this.providers = providers;
    this.ev = ev;
    this.queue = [];
  }

  add() {
    return async ctx => {
      const unavailable_links = await this._add(ctx.request.body);

      if (unavailable_links.length !== 0) {
        ctx.body = unavailable_links;
        return;
      } else {
        ctx.body = [];
      }

      ctx.status = 200;
    };
  }

  // return links that unsupported provider or unavailable link
  async _add(links = []) {
    const validated = await this._validate_links(links);
    this.push(validated.available_links);
    this.ev.emit("update-status");
    return validated.unavailable_links;
  }

  async _validate_links(links = []) {
    const validated = await Promise.all(
      links.map(async link => {
        try {
          const provider = this.providers.find(provider =>
            provider.pattern.test(link)
          );

          if (!provider) {
            throw new Error("This link belongs to an unsupported provider");
          }

          const provider_name = provider.name;
          const length_seconds = await provider.get_length_seconds(link);
          const title = await provider.get_title(link);
          const id = provider.get_id(link);
          const thumbnail_link = provider.get_thumbnail_link(link);

          if (!length_seconds) {
            throw new Error(
              `This '${provider_name}' link can not be played at the moment`
            );
          }

          return {
            provider: provider_name,
            link,
            length_seconds,
            title,
            id,
            thumbnail_link
          };
        } catch (e) {
          return {
            link,
            err_msg: e && e.message
          };
        }
      })
    );

    return {
      available_links: validated.filter(x => !x.err_msg),
      unavailable_links: validated.filter(x => x.err_msg)
    };
  }

  clear() {
    return ctx => {
      this.replace();
      ctx.status = 200;
    };
  }

  one_loop_on() {
    this.one_loop = true;
  }

  one_loop_off() {
    this.one_loop = false;
  }

  dequeue() {
    this.queue.shift();
    this.ev.emit("update-status");
  }

  pull_all() {
    return this.queue;
  }

  pull(idx = 0) {
    if (this.is_empty()) {
      return;
    }

    return this.queue[idx];
  }

  push(contents = []) {
    this.queue = this.queue.concat(contents);
    this.ev.emit("update-status");
  }

  replace(queue = []) {
    this.queue = queue;
    this.ev.emit("update-status");
  }

  length() {
    return this.queue.length;
  }

  is_empty() {
    return this.queue.length === 0;
  }

  remove() {
    return (ctx, index) => {
      this.queue.splice(index, 1);
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }
};
