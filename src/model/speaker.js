const speaker = require('speaker');
const EventEmitter = require('events').EventEmitter;
const pcmVolume = require('pcm-volume');
const AwaitLock = require('await-lock');
const TimedStream = require('timed-stream');
const FFmpeg = require('fluent-ffmpeg');
const Debug = require('debug');
const FixedMultipleSizeStream = require('../util/fixed_multiple_size_stream');

const debug = Debug('jukebox:speaker');
const debugStream = {
  source: Debug('jukebox:speaker:stream:source'),
  pcmVolume: Debug('jukebox:speaker:stream:pcmVolume'),
  speaker: Debug('jukebox:speaker:stream:speaker'),
  timed: Debug('jukebox:speaker:stream:timed'),
  ffmpeg: Debug('jukebox:speaker:stream:ffmpeg'),
  readableFFmpeg: Debug('jukebox:speaker:stream:readableFFmpeg'),
  fixedMultipleSize: Debug('jukebox:speaker:stream:fixedMultipleSize')
};

const DEFAULT_SPEAKER_BUFFER_TIME = 50;

module.exports = class Speaker extends EventEmitter {
  constructor({ volume = 1 } = {}) {
    debug('create speaker, %o', { volume });
    super();
    this.lock = new AwaitLock();

    this._bufferTime =
      Number(process.env.JUKEBOX_SPEAKER_BUFFER_TIME) || DEFAULT_SPEAKER_BUFFER_TIME;
    this._forceMute = (() => {
      const x = process.env.JUKEBOX_FORCE_MUTE;
      return x && ['true', 'yes', '1'].includes(x.toLowerCase());
    })();
    this.volume = volume;

    this._seekBuffer = 0;

    this._stream = null;
    this._pcmVolume = null;
    this._speaker = null;
    this._timedStream = null;
    this._ffmpeg = null;
    this._readableFFmpeg = null;
    this._fixedMultipleSizeStream = null;
  }

  get seekSeconds() {
    const { sampleRate, byteDepth, channels } = this.constructor.format;
    return this._seekBuffer / byteDepth / channels / sampleRate;
  }

  get seekBuffer() {
    return this._seekBuffer;
  }

  set seekBuffer(value) {
    this._seekBuffer = value;
    this.emit('updatedSeek', { seekSeconds: this.seekSeconds });
  }

  get volume() {
    return this._volume;
  }

  set volume(volume) {
    debug('set volume = %d', volume);
    this._volume = this._forceMute ? 0 : volume;
    if (this._pcmVolume) {
      this._pcmVolume.setVolume(this._volume);
    }
  }

  async start(stream) {
    await this._executeWithLock(this.startWithoutLock, stream);
  }

  async pause() {
    await this._executeWithLock(this.pauseWithoutLock);
  }

  async resume() {
    await this._executeWithLock(this.resumeWithoutLock);
  }

  async stop() {
    await this._executeWithLock(this.stopWithoutLock);
  }

  async _executeWithLock(method, ...args) {
    await this.lock.acquireAsync();

    let res;
    try {
      res = method.apply(this, args);
      if (res && res.then) res = await res;
    } finally {
      this.lock.release();
    }

    return res;
  }

  async startWithoutLock(stream) {
    debug('start');

    return new Promise(resolve => {
      const { sampleRate, byteDepth, channels } = this.constructor.format;

      this._stream = stream;
      this._stream.on('error', err => console.error('error on stream, ', err));
      this._stream.on('data', data => debugStream.source('received %d buffers', data.length));

      this._ffmpeg = new FFmpeg()
        .format('s16le')
        .audioFrequency(sampleRate)
        .withAudioChannels(channels);
      this._ffmpeg.on('error', err => console.error('error on ffmpeg, ', err));
      this._ffmpeg.on('data', data => debugStream.ffmpeg('received %d buffers', data.length));

      this._timedStream = new TimedStream({
        rate: byteDepth * channels * sampleRate,
        period: 10
      });
      this._timedStream.on('error', err => console.error('error on timedStream, ', err));
      this._timedStream.on('data', data => debugStream.timed('received %d buffers', data.length));
      this._timedStream.pauseStream();

      this._fixedMultipleSizeStream = new FixedMultipleSizeStream({
        multipleNumber: byteDepth * channels
      });
      this._fixedMultipleSizeStream.on('error', err =>
        console.error('error on fixedMultipleSizeStream, ', err)
      );
      this._fixedMultipleSizeStream.on('data', data =>
        debugStream.fixedMultipleSize('received %d buffers', data.length)
      );

      this._pcmVolume = pcmVolume();
      this._pcmVolume.setVolume(this.volume);
      this._pcmVolume.on('error', err => console.error('error on pcmVolume, ', err));
      this._pcmVolume.on('data', data => debugStream.pcmVolume('received %d buffers', data.length));

      this.seekBuffer = 0;
      this._pcmVolume.on('data', data => {
        this.seekBuffer += data.length;
      });

      this._speaker = speaker();
      this._speaker.on('error', err => console.error('error on speaker, ', err));
      this._speaker.on('data', data => debugStream.speaker('received %d buffers', data.length));

      this._readableFFmpeg = this._ffmpeg
        .input(this._stream)
        .pipe()
        .on('error', err => console.error('error on readableFFmpeg, ', err))
        .on('data', data => debugStream.readableFFmpeg('received %d buffers', data.length))
        .once('data', data => {
          debug('received first data from ffmpeg, %d', data.length);
          this._readableFFmpeg.pipe(this._timedStream);
          this._timedStream.resumeStream();

          setTimeout(() => {
            this._timedStream
              .pipe(this._fixedMultipleSizeStream)
              .pipe(this._pcmVolume)
              .pipe(this._speaker)
              .on('close', () => this.stop());

            debug('started');
            this.emit('start');
            resolve();
          }, this._bufferTime);
        });
    });
  }

  pauseWithoutLock() {
    debug('pause');
    this._timedStream.pauseStream();
    this._timedStream.unpipe(this._fixedMultipleSizeStream);
    this.emit('paused');
  }

  async resumeWithoutLock() {
    debug('resume');
    return new Promise(resolve => {
      this._timedStream.resumeStream();
      setTimeout(() => {
        this._timedStream.pipe(this._fixedMultipleSizeStream);
        debug('resumed');
        this.emit('resumed');
        resolve();
      }, this._bufferTime);
    });
  }

  stopWithoutLock() {
    debug('stop');
    if (this._stream) {
      this._stream.destroy();
      this._timedStream.destroy();
      this._pcmVolume.unpipe(this._speaker);
      this._speaker.end();
    } else {
      debug('warn: has not started yet');
    }
    this.emit('stopped');
  }

  static get format() {
    return {
      sampleRate: 44100,
      bitDepth: 16,
      byteDepth: 16 / 8,
      channels: 2
    };
  }
};
