const EventEmitter = require('events').EventEmitter;
const HistoryItem = require('./history_item');

module.exports = class History extends EventEmitter {
  constructor(items = [], { maxLength = 100 } = {}) {
    super();
    this.items = items;
    this.maxLength = maxLength;
  }

  adds(tracks = []) {
    tracks.forEach(track => this._add(track));
    this.emit('updated');
  }

  add(track) {
    this._add(track);
    this.emit('updated');
  }

  findItemByTrack(trackWhere) {
    const keys = Object.keys(trackWhere);
    return this.items.find(item => keys.every(key => item.track[key] === trackWhere[key]));
  }

  get length() {
    return this.items.length;
  }

  toJson() {
    return this.items.map(x => x.toJson());
  }

  _add(track) {
    const existsItem = this.findItemByTrack({ provider: track.provider, id: track.id });
    if (existsItem) {
      existsItem.playCount += 1;
      existsItem.track = track; // update
      // move to top
      this.items.splice(this.items.indexOf(existsItem), 1);
      this.items.unshift(existsItem);
    } else {
      const item = new HistoryItem({ track });
      this.items.unshift(item);
    }

    // fix item length
    this.items.splice(this.maxLength);
  }
};
