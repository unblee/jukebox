const Playlist = require('./playlist.js');
const Provider = require('./provider');
const speaker = require('speaker');
const lame = require('lame');
const mpg123Util = require('node-mpg123-util');

const { Decoder } = lame;

module.exports = class Player {
  constructor(playlist = new Playlist(), ev) {
    this.playlist = playlist;
    this.ev = ev;
    this.audioStream = null;
    this.decodedStream = null;
    this.oneLoop = false;
    this.playlistLoop = false;
    this.shuffleMode = false;
    this.nowPlaying = false;
    this.pausing = false;
    this.nowPlayingIdx = 0;
    this.nowPlayingContent = null;
    this.nextPlayContent = null;
    this.spkr = null;
    this.volumeValue = 1;
    this.prevVolumeValue = this.volumeValue;
    this.playlist.on('removed', ({ index }) => {
      if (index === this.nowPlayingIdx) {
        // stop and move playing index to the next music
        this.destroy();
        this._updatePlayingContent();
      } else if (index < this.nowPlayingIdx) {
        // adjust playing index
        --this.nowPlayingIdx;
        this.ev.emit('update-status');
      }
    });
  }

  start() {
    if (this.nowPlaying) return;
    if (this.pausing) {
      this.resume();
      return;
    }

    this._updatePlayingContent();
    if (!this.nowPlayingContent) return;

    this._playMusic();
  }

  startNext() {
    if (this.oneLoop) {
      // pass
    } else if (this.playlistLoop) {
      this._incPlayingIdx();
      if (this.shuffleMode && !this.nowPlayingIdx) {
        this.playlist.shuffle();
      }
    } else {
      this.playlist.dequeue();
    }
    this.start();
  }

  startPrev() {
    if (this.oneLoop) {
      // pass
    } else if (this.playlistLoop) {
      this._decPlayingIdx();
    } else {
      return; // disabled
    }
    this.start();
  }

  startSpecific(index) {
    // always not consume queue.
    this.nowPlayingIdx = +index;
    this.start();
  }

  pause() {
    this.decodedStream.unpipe(this.spkr);
    this.nowPlaying = false;
    this.pausing = true;
    this.ev.emit('update-status');
  }

  resume() {
    this.pausing = false;
    this.nowPlaying = true;
    this.decodedStream.pipe(this.spkr);
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
    this.nowPlaying = false;
    this.pausing = false;
    this.ev.emit('update-status');
  }

  setOneLoop(value) {
    this.oneLoop = !!value;
    this.ev.emit('update-status');
  }

  setPlaylistLoop(value) {
    this.playlistLoop = !!value;
    this.ev.emit('update-status');
  }

  setShuffleMode(value) {
    this.shuffleMode = !!value;
    if (this.shuffleMode) {
      this.playlist.shuffle();
      this.nowPlayingIdx = 0;

      // current playing content moves to top if playing music
      if (this.nowPlaying) {
        const nowContentIdx = this.playlist.queue.indexOf(this.nowPlayingContent);
        if (nowContentIdx) {
          this.playlist.queue.splice(nowContentIdx, 1);
          this.playlist.queue.unshift(this.nowPlayingContent);
        }
      }
    }
    this.ev.emit('update-status');
  }

  fetchStatus() {
    return {
      oneLoop: this.oneLoop,
      playlistLoop: this.playlistLoop,
      shuffleMode: this.shuffleMode,
      nowPlaying: this.nowPlaying,
      nowPlayingIdx: this.nowPlayingIdx,
      nowPlayingContent: this.nowPlayingContent,
      volume: this.volumeValue,
      playlist: this.playlist.toJson()
    };
  }

  setStatus(status) {
    this.setOneLoop(status.oneLoop);
    this.setPlaylistLoop(status.playlistLoop);
    this.setShuffleMode(status.shuffleMode);
    this.playlist.replace(status.playlist);

    // set update nowPlaying, nowPlayingIdx and nowPlayingContent
    if (status.nowPlayingIdx) {
      this.nowPlayingIdx = status.nowPlayingIdx;
      this.nowPlayingContent = status.nowPlayingContent;
      if (status.nowPlaying) {
        this.startSpecific(this.nowPlayingIdx);
      }
    }
  }

  _incPlayingIdx() {
    if (this.oneLoop) return;
    this.nowPlayingIdx = (this.nowPlayingIdx + 1) % this.playlist.length();
  }

  _decPlayingIdx() {
    if (this.oneLoop) return;
    this.nowPlayingIdx =
      (this.nowPlayingIdx + (this.playlist.length() - 1)) % this.playlist.length();
  }

  _updatePlayingContent(playContent = null) {
    if (playContent) {
      this.nowPlayingContent = this.nextPlayContent;
    } else if (this.playlist.isEmpty()) {
      this.nowPlayingContent = null;
    } else {
      this.nowPlayingContent = this.playlist.pull(this.nowPlayingIdx);
    }
    this.ev.emit('update-status');
  }

  _playMusic() {
    const provider = Provider.findByName(this.nowPlayingContent.provider);
    const stream = provider.createStream(this.nowPlayingContent.link);

    // audio output to the speaker
    this.nowPlaying = true;
    this.ev.emit('update-status');
    const decoder = new Decoder({
      channels: 2,
      bitDepth: 16,
      sampleRate: 44100,
      bitRate: 128,
      outSampleRate: 22050,
      mode: lame.STEREO
    });
    mpg123Util.setVolume(decoder.mh, this.volumeValue);
    this.decodedStream = stream.pipe(decoder);
    this.spkr = speaker();
    this.audioStream = this.decodedStream.pipe(this.spkr);
    this.audioStream.on('close', () => {
      this.nowPlaying = false;
      this.pausing = false;
      this.destroy();
      this.ev.emit('update-status');
      this.startNext();
    });
  }

  get volume() {
    return this.volumeValue;
  }

  set volume(vol) {
    if (this.volumeValue > 0) {
      this.prevVolumeValue = this.volumeValue;
    }
    this.volumeValue = vol;
    mpg123Util.setVolume(this.decodedStream.mh, this.volumeValue);
    this.ev.emit('update-status');
  }
};
