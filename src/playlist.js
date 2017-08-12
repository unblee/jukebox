const shuffle = require('lodash.shuffle');
const random = require('lodash.random');
const EventEmitter = require('events').EventEmitter;

module.exports = class Playlist extends EventEmitter {
  constructor(queue = []) {
    super();
    this.queue = queue;
  }

  adds(tracks = [], { shuffleAdd = false, shuffleStartPos = 0 } = {}) {
    tracks.map(track => this.add(track, { shuffleAdd, shuffleStartPos }));
  }

  add(track, { shuffleAdd = false, shuffleStartPos = 0 } = {}) {
    if (shuffleAdd) {
      const pos = random(shuffleStartPos, this.queue.length);
      this.push(track, pos);
    } else {
      this.push(track);
    }
  }

  dequeue() {
    this.queue.shift();
    this.emit('updated');
  }

  pullAll() {
    return this.queue;
  }

  pull(idx = 0) {
    if (this.isEmpty()) {
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
    this.emit('updated');
  }

  replace(queue = []) {
    this.queue = queue;
    if (!queue.length) {
      this.emit('cleared');
    }
    this.emit('updated');
  }

  remove(index) {
    this.queue.splice(index, 1);
    this.emit('updated');
    this.emit('removed', { index });
  }

  moveToTop(content) {
    const index = this.queue.indexOf(content);
    this.queue.splice(index, 1);
    this.queue.unshift(content);
  }

  shuffle() {
    this.queue = shuffle(this.queue);
    this.emit('updated');
  }

  move(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;
    const [content] = this.queue.splice(oldIndex, 1);
    this.queue.splice(newIndex, 0, content);
    this.emit('updated');
    this.emit('moved', { oldIndex, newIndex, content });
  }

  length() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  toJson() {
    return this.queue.map(x => x.toJson());
  }
};
