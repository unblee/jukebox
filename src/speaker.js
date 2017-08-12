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
    this._decoder.on('format', data => {
      this._speaker._format(data);
    });

    this._stream.on('error', err => console.error('error on stream, ', err));
    this._decoder.on('error', err => console.error('error on decoder, ', err));
    this._pcmVolume.on('error', err => console.error('error on pcmVolume, ', err));
    this._speaker.on('error', err => console.error('error on speaker, ', err));

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
    if (this._stream && this._pcmVolume) {
      this._stream.end();
      this._pcmVolume.unpipe(this._speaker);
    }
    this.emit('stopped');
  }
};
