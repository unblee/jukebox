module.exports = class HistoryItem {
  constructor({ track, playCount = 1, updatedAt = null }) {
    this.track = track;
    this.playCount = playCount;
    this.updatedAt = updatedAt || Date.now();
  }

  toJson() {
    return {
      playCount: this.playCount,
      updatedAt: this.updatedAt,
      track: this.track.toJson()
    };
  }
};
