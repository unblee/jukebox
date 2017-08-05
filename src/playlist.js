const shuffle = require('lodash.shuffle');
const random = require('lodash.random');
const EventEmitter = require('events').EventEmitter;

module.exports = class Playlist extends EventEmitter {
  constructor(ev, queue = []) {
    super();
    this.ev = ev;
    this.queue = queue;
  }

  adds(tracks = [], { shuffle_add = false, shuffle_start_pos = 0 } = {}) {
    tracks.map(track => this.add(track, { shuffle_add, shuffle_start_pos }));
  }

  add(track, { shuffle_add = false, shuffle_start_pos = 0 } = {}) {
    if (shuffle_add) {
      const pos = random(shuffle_start_pos, this.queue.length);
      this.push(track, pos);
    } else {
      this.push(track);
    }
  }

  dequeue() {
    this.queue.shift();
    this.ev.emit('update-status');
  }

  pull_all() {
    return this.queue;
  }

  pull(idx = 0) {
    if (this.is_empty()) {
      return null;
    }

    return this.queue[idx];
  }

  push(content, pos = null) {
    if (pos === null) {
      this.queue.push(content);
    } else {
      this.queue.splice(pos, 0, content);
    }
    this.ev.emit('update-status');
  }

  replace(queue = []) {
    this.queue = queue;
    this.ev.emit('update-status');
  }

  remove(index) {
    this.queue.splice(index, 1);
    this.ev.emit('update-status');
    this.emit('removed', { index });
  }

  shuffle() {
    this.queue = shuffle(this.queue);
    this.ev.emit('update-status');
  }

  length() {
    return this.queue.length;
  }

  is_empty() {
    return this.queue.length === 0;
  }

  to_json() {
    return this.queue.map(x => x.to_json());
  }
};
