const speaker = require('speaker');
const mpg123Util = require('node-mpg123-util');
const decoder = require('lame').Decoder;
const EventEmitter = require('events').EventEmitter;

module.exports = class Speaker extends EventEmitter {
  constructor({ volume = 1 } = {}) {
    super();
    this._volume = volume;

    this._decodedStream = null;
    this._audioStream = null;
    this._speaker = speaker();
  }

  get volume() {
    return this._volume;
  }

  set volume(volume) {
    if (this._decodedStream) {
      mpg123Util.setVolume(this._decodedStream.mh, volume);
    }
    this._volume = volume;
  }

  start(stream) {
    this._decodedStream = stream.pipe(decoder());
    mpg123Util.setVolume(this._decodedStream.mh, this.volume);

    this._audioStream = this._decodedStream.pipe(this._speaker);
    this._audioStream.on('close', () => {
      this.stop();
    });

    this.emit('start');
  }

  pause() {
    this._decodedStream.unpipe(this._speaker);
    this.emit('paused');
  }

  resume() {
    this._decodedStream.pipe(this._speaker);
    this.emit('resumed');
  }

  stop() {
    if (this._audioStream) {
      this._audioStream.removeAllListeners('close');
      this._audioStream = null;
    }
    if (this._decodedStream) {
      try {
        this._decodedStream.unpipe(this._speaker).end();
      } catch (e) {
        console.error(e);
      }
      this._decodedStream = null;
    }
    this.emit('stopped');
  }
};
