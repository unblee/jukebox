const debug = require('debug')('jukebox:player');
const Provider = require('../provider/index');
const LoopMode = require('../constant/loop_mode');
const State = require('../constant/state');
const Speaker = require('./speaker');
const PlayerStatusStore = require('../store/player_status_store.js');
const EventEmitter = require('events').EventEmitter;

module.exports = class Player extends EventEmitter {
  constructor(playlist, playerStatus, history) {
    super();
    this.playlist = playlist;
    this.status = playerStatus;
    this.history = history;
    this.speaker = null;
    this.store = new PlayerStatusStore();

    this._onSpeakerStoppedEventBinded = () => this._onSpeakerStopped();

    this.playlist.on('removed', ({ index }) => {
      const nowIdx = this.status.nowPlayingIdx;
      if (index === nowIdx) {
        // start next track if loop mode is playlist
        this.stop();
      } else if (index < nowIdx) {
        this.status.setNowPlayingIdx(nowIdx - 1);
        this.emit('updated-status');
      }
    });

    this.playlist.on('cleared', () => {
      this.stop();
      this.status.setNowPlayingIdx(0);
    });

    this.playlist.on('updated', () => {
      this.emit('updated-status');
    });

    this.playlist.on('moved', ({ oldIndex, newIndex }) => {
      const playingIndex = this.status.nowPlayingIdx;
      if (playingIndex === oldIndex) {
        this.status.setNowPlayingIdx(newIndex);
      } else if (newIndex <= playingIndex && playingIndex < oldIndex) {
        this.status.setNowPlayingIdx(playingIndex + 1);
      } else if (oldIndex < playingIndex && playingIndex <= newIndex) {
        this.status.setNowPlayingIdx(playingIndex - 1);
      }

      this.emit('updated-status');
    });

    this.status.on('updated', () => {
      this.emit('updated-status');
    });
  }

  async start() {
    debug('start(), state is %s', this.status.state);
    switch (this.status.state) {
      case State.PLAYING:
        debug('music is already playing (skip)');
        return;

      case State.PAUSING:
        this.resume();
        return;

      case State.STOPPED:
        if (!this.nowPlayingStream) {
          debug('music stream is not found, so skip start()');
          return;
        }
        debug('start music, %o', this.nowPlayingContent);
        this.speaker = new Speaker({ volume: this.status.volume });
        // Call start async to early notify and improve UX
        this.speaker.start(this.nowPlayingStream).catch(e => console.error(e));
        this.speaker.on('stopped', this._onSpeakerStoppedEventBinded);
        this.speaker.on('updatedSeek', ({ seekSeconds }) =>
          this.emit('updatedSeek', { seekSeconds })
        );
        this.status.play();

        debug('add history, %o', this.nowPlayingContent);
        this.history.add(this.nowPlayingContent);

        this.emit('updated-status');
        return;

      default:
        throw new Error(`invalid state: ${this.status.state}`);
    }
  }

  async startSpecific(index) {
    // always not consume queue.
    this.status.setNowPlayingIdx(index);
    await this.start();
  }

  async startNext() {
    debug('startNext(), loopMode is %s', this.status.loopMode);
    switch (this.status.loopMode) {
      case LoopMode.NONE:
        this.playlist.remove(this.status.nowPlayingIdx);
        await this.start();
        return;

      case LoopMode.ONE:
        this._incPlayingIdx();
        await this.start();
        return;

      case LoopMode.PLAYLIST:
        this._incPlayingIdx();
        if (this.status.shuffleMode && !this.status.nowPlayingIdx) {
          debug('start playlist from the beginning and shuffle playlist');
          this.playlist.shuffle();
        }
        await this.start();
        return;

      default:
        throw new Error(`invalid loop mode: ${this.status.loopMode}`);
    }
  }

  async startPrev() {
    debug('startPrev(), loopMode is %s', this.status.loopMode);
    switch (this.status.loopMode) {
      case LoopMode.NONE:
        debug('startPrev() is disabled when loopMode is %s, so skip startPrev()', LoopMode.NONE);
        return;

      case LoopMode.ONE:
        this._decPlayingIdx();
        await this.start();
        return;

      case LoopMode.PLAYLIST:
        this._decPlayingIdx();
        await this.start();
        return;

      default:
        throw new Error(`invalid loop mode: ${this.status.loopMode}`);
    }
  }

  async pause() {
    debug('pause()');
    await this.speaker.pause();
    this.status.pause();
    this.emit('updated-status');
  }

  async resume() {
    debug('resume()');
    await this.speaker.resume();
    this.status.resume();
    this.emit('updated-status');
  }

  async stop() {
    debug('stop()');
    if (this.speaker) {
      this.speaker.removeListener('stopped', this._onSpeakerStoppedEventBinded);
      await this.speaker.stop();
      this.speaker = null;
    }
    this.status.stop();
    this.emit('updated-status');
  }

  async restart() {
    debug('restart()');
    await this.stop();
    await this.start();
  }

  setLoopMode(loopMode) {
    switch (loopMode) {
      case LoopMode.ONE:
        this.status.oneLoopMode();
        return;

      case LoopMode.PLAYLIST:
        this.status.playlistLoopMode();
        return;

      case LoopMode.NONE:
        this.status.noLoopMode();
        return;

      default:
        throw new Error(`invalid loop mode: ${loopMode}`);
    }
  }

  setShuffleMode(value) {
    if (value) {
      const nowContent = this.nowPlayingContent;

      this.status.enableShuffleMode();
      this.playlist.shuffle();

      // current playing content moves to top if playing music
      if ([State.PLAYING, State.PAUSING].includes(this.status.state)) {
        debug(
          'current music exist when enabling shuffle mode, so move current playing content to top'
        );
        this.playlist.moveToTop(nowContent);
        this.status.setNowPlayingIdx(0);
      }
    } else {
      this.status.disableShuffleMode();
    }

    this.emit('updated-status');
  }

  serialize() {
    return Object.assign(this.status.serialize(), {
      playlist: this.playlist.serialize()
    });
  }

  _incPlayingIdx() {
    this.status.setNowPlayingIdx((this.status.nowPlayingIdx + 1) % this.playlist.length());
  }

  _decPlayingIdx() {
    this.status.setNowPlayingIdx(
      (this.status.nowPlayingIdx + (this.playlist.length() - 1)) % this.playlist.length()
    );
  }

  get nowPlayingStream() {
    const content = this.nowPlayingContent;
    if (!content) return null;
    const provider = Provider.findByName(content.provider);
    return provider.createStream(content.link);
  }

  get nowPlayingContent() {
    const idx = this.status.nowPlayingIdx;
    return idx < this.playlist.length() ? this.playlist.pull(idx) : null;
  }

  get seekSeconds() {
    return this.speaker && this.speaker.seekSeconds;
  }

  setVolume(vol) {
    if (this.speaker) {
      this.speaker.volume = vol;
    }
    this.status.volume = vol;
    this.emit('updated-status');
  }

  async _onSpeakerStopped() {
    debug('_onSpeakerStopped()');
    await this.stop();

    switch (this.status.loopMode) {
      case LoopMode.NONE:
        await this.startNext();
        return;

      case LoopMode.ONE:
        await this.start();
        return;

      case LoopMode.PLAYLIST:
        await this.startNext();
        return;

      default:
        throw new Error(`invalid loop mode: ${this.status.loopMode}`);
    }
  }

  load() {
    if (this.store.existsSync()) {
      debug('load exists player status');
      const x = this.store.readSync();
      this.playlist.replace(x.playlist);
      this.status.init(x);
    } else {
      debug('store is not found, load default player status');
      this.playlist.replace([]);
      this.status.init();
    }
  }

  save() {
    debug('save player');
    this.store.writeSync(this.serialize(), {
      pretty: process.env.NODE_ENV !== 'production'
    });
  }
};
