const speaker = require('speaker');
const { Decoder: decoder } = require('lame');
const EventEmitter = require('events').EventEmitter;
const pcmVolume = require('pcm-volume');
const AwaitLock = require('await-lock');

module.exports = class Speaker extends EventEmitter {
  constructor({ volume = 1 } = {}) {
    super();
    this.lock = new AwaitLock();

    this._volume = volume;

    this._stream = null;
    this._decoder = null;
    this._pcmVolume = null;
    this._speaker = null;
  }

  get volume() {
    return this._volume;
  }

  set volume(volume) {
    if (this._pcmVolume) {
      this._pcmVolume.setVolume(volume);
    }
    this._volume = volume;
  }

  async start(stream) {
    await this.lock.acquireAsync();

    try {
      this.startWithoutLock(stream);
    } finally {
      this.lock.release();
    }
  }

  async pause() {
    await this.lock.acquireAsync();

    try {
      this.pauseWithoutLock();
    } finally {
      this.lock.release();
    }
  }

  async resume() {
    await this.lock.acquireAsync();

    try {
      this.resumeWithoutLock();
    } finally {
      this.lock.release();
    }
  }

  async stop() {
    await this.lock.acquireAsync();

    try {
      this.stopWithoutLock();
    } finally {
      this.lock.release();
    }
  }

  startWithoutLock(stream) {
    this._stream = stream;
    this._decoder = decoder();
    this._pcmVolume = pcmVolume();
    this._speaker = speaker();

    this._pcmVolume.setVolume(this.volume);
    this._decoder.on('format', data => this._speaker._format(data));

    this._stream
      .pipe(this._decoder)
      .pipe(this._pcmVolume)
      .pipe(this._speaker)
      .on('close', () => this.stop());

    this.emit('start');
  }

  pauseWithoutLock() {
    this._pcmVolume.unpipe(this._speaker);
    this.emit('paused');
  }

  resumeWithoutLock() {
    this._pcmVolume.pipe(this._speaker);
    this.emit('resumed');
  }

  stopWithoutLock() {
    if (this._speaker) {
      this._speaker.removeAllListeners();
    }

    // unpipe and close streams in order of opening
    const keys = ['_stream', '_decoder', '_pcmVolume', '_speaker'];
    keys.forEach((key, i) => {
      if (!this[key]) return;

      if (i + 1 < keys.length) {
        const nKey = keys[i + 1];
        if (this[nKey]) {
          this[key].unpipe(this[nKey]);
        }
      }

      this[key].end();
      this[key] = null;
    });

    this.emit('stopped');
  }
};
