const debug = require('debug')('jukebox:history');
const EventEmitter = require('events').EventEmitter;
const HistoryItem = require('./history_item');
const HistoryStore = require('../store/history_store.js');

module.exports = class History extends EventEmitter {
  constructor(items = [], { maxLength = 100 } = {}) {
    debug('create history with %d items', items.length);
    super();
    this.items = items;
    this.maxLength = maxLength;
    this.store = new HistoryStore();
  }

  adds(tracks = []) {
    tracks.forEach(track => this._add(track));
    this.emit('updated');
  }

  add(track) {
    this._add(track);
    this.emit('updated');
  }

  replace(items = []) {
    debug('replace all items with %d items', items.length);
    this.items = items;
    if (!items.length) {
      this.emit('cleared');
    }
    this.emit('updated');
  }

  findItemByTrack(trackWhere) {
    const keys = Object.keys(trackWhere);
    return this.items.find(item => keys.every(key => item.track[key] === trackWhere[key]));
  }

  get length() {
    return this.items.length;
  }

  serialize() {
    return this.items.map(x => x.serialize());
  }

  _add(track) {
    const existsItem = this.findItemByTrack({ provider: track.provider, id: track.id });
    if (existsItem) {
      const nextPlayCount = existsItem.playCount + 1;
      debug('update playCount of item (%s) to %d', track.id, nextPlayCount);

      existsItem.playCount = nextPlayCount;
      existsItem.track = track; // update

      // move to top
      this.items.splice(this.items.indexOf(existsItem), 1);
      this.items.unshift(existsItem);
    } else {
      debug('add new item, %s', track.id);
      const item = new HistoryItem({ track });
      this.items.unshift(item);
    }

    // fix item length
    this.items.splice(this.maxLength);
  }

  load() {
    if (this.store.existsSync()) {
      debug('load exists history');
      const xs = this.store.readSync();
      this.replace(xs);
    } else {
      debug('store is not found, set empty history');
      this.replace([]);
    }
  }

  save() {
    debug('save history');
    this.store.writeSync(this.serialize(), {
      pretty: process.env.NODE_ENV !== 'production'
    });
  }
};
