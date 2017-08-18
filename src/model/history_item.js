const debug = require('debug')('jukebox:history_item');

module.exports = class HistoryItem {
  constructor({ track, playCount = 1, updatedAt = null }) {
    debug('create history item, %o', { track_id: track.id, playCount, updatedAt });
    this.track = track;
    this.playCount = playCount;
    this.updatedAt = updatedAt || Date.now();
  }

  serialize() {
    return {
      playCount: this.playCount,
      updatedAt: this.updatedAt,
      track: this.track.serialize()
    };
  }
};
