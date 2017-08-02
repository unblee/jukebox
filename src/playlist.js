const ytdl = require("ytdl-core");
const Provider = require("./provider");
const shuffle = require("lodash.shuffle");
const random = require("lodash.random");

module.exports = class Playlist {
  constructor(ev) {
    this.ev = ev;
    this.queue = [];
  }

  // return links that unsupported provider or unavailable link
  async add(links = [], { shuffle_add = false, shuffle_start_pos = 0 } = {}) {
    const validated = await this.validate_links(links);

    if (shuffle_add) {
      validated.available_links.forEach(link => {
        const pos = random(shuffle_start_pos, this.queue.length);
        this.push(link, pos);
      });
    } else {
      validated.available_links.forEach(link => this.push(link));
    }

    this.ev.emit("update-status");
    return validated.unavailable_links;
  }

  async validate_links(links = []) {
    const validated = await Promise.all(
      links.map(async link => {
        try {
          const provider = Provider.find_by_link(link);

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

  push(content, pos = null) {
    if (pos === null) {
      this.queue.push(content);
    } else {
      this.queue.splice(pos, 0, content);
    }
    this.ev.emit("update-status");
  }

  replace(queue = []) {
    this.queue = queue;
    this.ev.emit("update-status");
  }

  remove(index) {
    this.queue.splice(index, 1);
    this.ev.emit("update-status");
  }

  shuffle() {
    this.queue = shuffle(this.queue);
    this.ev.emit("update-status");
  }

  length() {
    return this.queue.length;
  }

  is_empty() {
    return this.queue.length === 0;
  }
};
