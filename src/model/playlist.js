const shuffle = require('lodash.shuffle');
const random = require('lodash.random');
const EventEmitter = require('events').EventEmitter;
const debug = require('debug')('jukebox:playlist');

module.exports = class Playlist extends EventEmitter {
  constructor(tracks = []) {
    debug('create playlist with %d tracks', tracks.length);
    super();
    this.queue = tracks;
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

  pullAll() {
    return this.queue;
  }

  pull(idx = 0) {
    if (this.isEmpty()) {
      debug('warn: there is no track');
      return null;
    }

    return this.queue[idx];
  }

  push(track, pos = null) {
    if (pos === null) {
      debug('add track to last pos, %s', track.id);
      this.queue.push(track);
    } else {
      debug('add track to %d pos, %s', pos, track.id);
      if (pos >= this.queue.length) {
        debug('warn: insert position (%d) >= playlist length (%d)', pos, this.queue.length);
      }
      this.queue.splice(pos, 0, track);
    }
    this.emit('updated');
  }

  replace(tracks = []) {
    debug('replace all tracks with %d tracks', tracks.length);
    this.queue = tracks;
    if (!tracks.length) {
      this.emit('cleared');
    }
    this.emit('updated');
  }

  remove(index) {
    if (index < this.queue.length) {
      debug('remove %d th track');
      this.queue.splice(index, 1);
      this.emit('updated');
      this.emit('removed', { index });
    } else {
      debug('warn: specified removed %d th track is not found', index);
    }
  }

  moveToTop(track) {
    const index = this.queue.indexOf(track);
    if (index === -1) {
      debug('warn: specified moved track is not found, %s', track.id);
    } else {
      this.move(index, 0);
    }
  }

  move(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;
    const [content] = this.queue.splice(oldIndex, 1);
    if (!content) {
      debug('warn: specified moved %d th track is not found', oldIndex);
    } else {
      debug('move %d th track to %d position', oldIndex, newIndex);
      this.queue.splice(newIndex, 0, content);
      this.emit('updated');
      this.emit('moved', { oldIndex, newIndex, content });
    }
  }

  length() {
    return this.queue.length;
  }

  shuffle() {
    debug('shuffle playlist');
    this.queue = shuffle(this.queue);
    this.emit('updated');
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  serialize() {
    return this.queue.map(x => x.serialize());
  }
};
