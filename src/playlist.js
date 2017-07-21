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

  // TODO: refactoring
  async _validate_links(links = []) {
    const validated = await Promise.all(
      links.map(async link => {
        const provider = this.providers.find(provider =>
          provider.pattern.test(link)
        );
        let err_msg = null;
        let provider_name = null;
        let length_seconds = null;
        let title = null;
        let id = null;
        let thumbnail_link = null;
        try {
          length_seconds = await provider.get_length_seconds(link);
          title = await provider.get_title(link);
        } catch (e) {
          // provider is undefined
          err_msg = "This link belongs to an unsupported provider";
        }
        if (!err_msg) {
          // provider is not undefined
          provider_name = provider.name;
          id = provider.get_id(link);
          thumbnail_link = provider.get_thumbnail_link(link);
        }
        if (!length_seconds && !err_msg) {
          // unavailable link
          err_msg = `This '${provider_name}' link can not be played at the moment`;
        }
        return {
          err_msg,
          provider: provider_name,
          link,
          length_seconds,
          title,
          id,
          thumbnail_link
        };
      })
    );

    const available_links = validated
      .filter(content => !content.err_msg)
      .map(content => {
        return {
          provider: content.provider,
          link: content.link,
          length_seconds: content.length_seconds,
          id: content.id,
          title: content.title,
          thumbnail_link: content.thumbnail_link
        };
      });
    const unavailable_links = validated
      .filter(content => content.err_msg)
      .map(content => {
        return {
          err_msg: content.err_msg,
          link: content.link
        };
      });

    return {
      available_links,
      unavailable_links
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
};
