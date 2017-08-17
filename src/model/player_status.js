const debug = require('debug')('jukebox:player_status');
const LoopMode = require('../constant/loop_mode');
const State = require('../constant/state');
const EventEmitter = require('events').EventEmitter;

module.exports = class PlayerStatus extends EventEmitter {
  constructor(params) {
    super();
    this.init(params);
  }

  init(
    {
      loopMode = LoopMode.NONE,
      state = State.STOPPED,
      shuffleMode = false,
      nowPlayingIdx = null,
      volume = 1
    } = {}
  ) {
    debug('init(%o)', { loopMode, state, shuffleMode, nowPlayingIdx, volume });
    this._loopMode = loopMode;
    this._state = state;
    this._shuffleMode = Boolean(shuffleMode);
    this._nowPlayingIdx = Number(nowPlayingIdx);
    this._volume = Number(volume);
    this._prevVolume = this._volume;
    this.emit('updated', this.serialize());
  }

  get loopMode() {
    return this._loopMode;
  }

  set loopMode(val) {
    debug('set loopMode = %s', val);
    this._loopMode = val;
    this._emitUpdated();
  }

  get state() {
    return this._state;
  }

  set state(val) {
    debug('set state = %s', val);
    this._state = val;
    this._emitUpdated();
  }

  get shuffleMode() {
    return this._shuffleMode;
  }

  set shuffleMode(val) {
    debug('set shuffleMode = %d', val);
    this._shuffleMode = val;
    this._emitUpdated();
  }

  get nowPlayingIdx() {
    return this._nowPlayingIdx;
  }

  set nowPlayingIdx(val) {
    debug('set nowPlayingIdx = %d', val);
    this._nowPlayingIdx = val;
    this._emitUpdated();
  }

  get volume() {
    return this._volume;
  }

  set volume(val) {
    debug('set volume = %d', val);
    if (val > 0) {
      this.prevVolume = val;
    }
    this._volume = val;
  }

  get prevVolume() {
    return this._prevVolume;
  }

  set prevVolume(val) {
    debug('set preVolume = %d', val);
    this._prevVolume = val;
  }

  serialize() {
    return {
      loopMode: this.loopMode,
      state: this.state,
      shuffleMode: this.shuffleMode,
      nowPlayingIdx: this.nowPlayingIdx,
      volume: this.volume
    };
  }

  /** * helper methods ** */

  play() {
    this.state = State.PLAYING;
  }

  stop() {
    this.state = State.STOPPED;
  }

  pause() {
    this.state = State.PAUSING;
  }

  resume() {
    this.state = State.PLAYING;
  }

  noLoopMode() {
    this.loopMode = LoopMode.NONE;
  }

  oneLoopMode() {
    this.loopMode = LoopMode.ONE;
  }

  playlistLoopMode() {
    this.loopMode = LoopMode.PLAYLIST;
  }

  enableShuffleMode() {
    this.shuffleMode = true;
  }

  disableShuffleMode() {
    this.shuffleMode = false;
  }

  setNowPlayingIdx(idx) {
    this.nowPlayingIdx = idx;
  }

  _emitUpdated() {
    this.emit('updated', this.serialize());
  }
};
