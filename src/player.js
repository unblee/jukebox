const Provider = require('./provider');
const speaker = require('speaker');
const decoder = require('lame').Decoder;
const LoopMode = require('./loop_mode');
const State = require('./state');

module.exports = class Player {
  constructor(playlist, playerStatus, ev) {
    this.playlist = playlist;
    this.status = playerStatus;
    this.ev = ev;
    this.audioStream = null;
    this.decodedStream = null;
    this.spkr = null;

    this.playlist.on('removed', ({ index }) => {
      const nowIdx = this.status.nowPlayingIdx;
      if (index === nowIdx) {
        // stop and move playing index to the next music
        this.destroy();
      } else if (index < nowIdx) {
        // adjust playing index
        this.status.setNowPlayingIdx(nowIdx - 1);
        this.ev.emit('update-status');
      }
    });

    this.status.on('updated', () => {
      this.ev.emit('update-status');
    });
  }

  start() {
    switch (this.status.state) {
      case State.PLAYING:
        // pass
        return;

      case State.PAUSING:
        this.resume();
        return;

      case State.STOPPED:
        this._playMusic();
        return;

      default:
        throw new Error(`invalid state: ${this.status.state}`);
    }
  }

  startSpecific(index) {
    // always not consume queue.
    this.status.setNowPlayingIdx(index);
    this.start();
  }

  startNext() {
    switch (this.status.loopMode) {
      case LoopMode.NONE:
        this.playlist.dequeue();
        this.start();
        return;

      case LoopMode.ONE:
        this.start();
        return;

      case LoopMode.PLAYLIST:
        this._incPlayingIdx();
        if (this.status.shuffleMode && !this.status.nowPlayingIdx) {
          this.playlist.shuffle();
        }
        this.start();
        return;

      default:
        throw new Error(`invalid loop mode: ${this.status.loopMode}`);
    }
  }

  startPrev() {
    switch (this.status.loopMode) {
      case LoopMode.NONE:
        // disabled
        return;

      case LoopMode.ONE:
        this.start();
        return;

      case LoopMode.PLAYLIST:
        this._decPlayingIdx();
        this.start();
        return;

      default:
        throw new Error(`invalid loop mode: ${this.status.loopMode}`);
    }
  }

  pause() {
    this.decodedStream.unpipe(this.spkr);
    this.status.pause();
    this.ev.emit('update-status');
  }

  resume() {
    this.decodedStream.pipe(this.spkr);
    this.status.resume();
    this.ev.emit('update-status');
  }

  destroy() {
    if (this.audioStream) this.audioStream.removeAllListeners('close');
    if (this.decodedStream) {
      try {
        this.decodedStream.unpipe(this.spkr).end();
      } catch (e) {
        console.error(e);
      }
    }
    this.status.stop();
    this.ev.emit('update-status');
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
      this.status.enableShuffleMode();
      this.playlist.shuffle();

      // current playing content moves to top if playing music
      if ([State.PLAYING, State.PAUSING].includes(this.status.state)) {
        this.playlist.moveToTop(this.status.nowPlayingIdx);
        this.status.setNowPlayingIdx(0);
      }
    } else {
      this.status.disableShuffleMode();
    }

    this.ev.emit('update-status');
  }

  fetchStatus() {
    return Object.assign(this.status.toJson(), {
      playlist: this.playlist.toJson()
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

  _playMusic() {
    const content = this.nowPlayingContent;
    if (!content) return;
    const provider = Provider.findByName(content.provider);
    const stream = provider.createStream(content.link);

    // audio output to the speaker
    this.decodedStream = stream.pipe(decoder());
    this.spkr = speaker();
    this.audioStream = this.decodedStream.pipe(this.spkr);
    this.audioStream.on('close', () => {
      this.destroy();
      this.status.stop();
      this.ev.emit('update-status');
      this.startNext();
    });

    this.status.play();
    this.ev.emit('update-status');
  }

  get nowPlayingContent() {
    const idx = this.status.nowPlayingIdx;
    return idx < this.playlist.length() ? this.playlist.pull(idx) : null;
  }
};
