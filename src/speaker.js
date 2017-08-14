const speaker = require('speaker');
const { Decoder: decoder } = require('lame');
const EventEmitter = require('events').EventEmitter;
const pcmVolume = require('pcm-volume');
const AwaitLock = require('await-lock');
const TimedStream = require('timed-stream');
const EvenizeStream = require('./util/evenize_stream');

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
      await this.startWithoutLock(stream);
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

  async startWithoutLock(stream) {
    return new Promise(resolve => {
      this._stream = stream;
      this._stream.on('error', err => console.error('error on stream, ', err));

      this._decoder = decoder();
      this._decoder.on('error', err => console.error('error on decoder, ', err));

      this._stream.pipe(this._decoder);

      this._decoder.on('format', data => {
        this._pcmVolume = pcmVolume();
        this._pcmVolume.setVolume(this.volume);
        this._pcmVolume.on('error', err => console.error('error on pcmVolume, ', err));

        const byteDepth = data.bitDepth / 8;
        this._timedStream = new TimedStream({
          rate: byteDepth * data.channels * data.sampleRate,
          period: 10
        });
        this._timedStream.on('error', err => console.error('error on timedStream, ', err));

        this._evenizeStream = new EvenizeStream();

        this._speaker = speaker();
        this._speaker.on('error', err => console.error('error on speaker, ', err));
        this._speaker._format(data);

        this._decoder
          .pipe(this._timedStream)
          .pipe(this._evenizeStream)
          .pipe(this._pcmVolume)
          .pipe(this._speaker)
          .on('close', () => this.stop());

        this.emit('start');
        resolve();
      });
    });
  }

  pauseWithoutLock() {
    this._timedStream.pauseStream();
    this.emit('paused');
  }

  resumeWithoutLock() {
    this._timedStream.resumeStream();
    this.emit('resumed');
  }

  stopWithoutLock() {
    if (this._stream) {
      this._stream.end();
    }
    if (this._timedStream) {
      this._timedStream.destroy();
    }
    this.emit('stopped');
  }
};
