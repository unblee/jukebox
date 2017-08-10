const Provider = require('./provider');
const LoopMode = require('./loop_mode');
const State = require('./state');
const Speaker = require('./speaker');

module.exports = class Player {
  constructor(playlist, playerStatus, ev) {
    this.playlist = playlist;
    this.status = playerStatus;
    this.ev = ev;
    this.speaker = new Speaker({ volume: this.status.volume });

    this._onSpeakerStoppedEventBinded = () => this._onSpeakerStopped();

    this.playlist.on('removed', ({ index }) => {
      const nowIdx = this.status.nowPlayingIdx;
      if (index === nowIdx) {
        // start next track if loop mode is playlist
        this.stop();
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
        if (!this.nowPlayingStream) return;
        this.speaker.start(this.nowPlayingStream);
        this.speaker.on('stopped', this._onSpeakerStoppedEventBinded);
        this.status.play();
        this.ev.emit('update-status');
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
    this.speaker.pause();
    this.status.pause();
    this.ev.emit('update-status');
  }

  resume() {
    this.speaker.resume();
    this.status.resume();
    this.ev.emit('update-status');
  }

  stop() {
    this.speaker.removeListener('stopped', this._onSpeakerStoppedEventBinded);
    this.speaker.stop();
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
      const nowContent = this.nowPlayingContent;

      this.status.enableShuffleMode();
      this.playlist.shuffle();

      // current playing content moves to top if playing music
      if ([State.PLAYING, State.PAUSING].includes(this.status.state)) {
        this.playlist.moveToTop(nowContent);
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

  setVolume(vol) {
    this.speaker.volume = vol;
    this.status.volume = vol;
    this.ev.emit('update-status');
  }

  _onSpeakerStopped() {
    this.status.stop();
    this.startNext();
  }
};
