const Playlist = require("./playlist.js");
const Provider = require("./provider");
const speaker = require("speaker")();
const decoder = require("lame").Decoder;

module.exports = class Player {
  constructor(playlist = new Playlist(), ev) {
    this.playlist = playlist;
    this.ev = ev;
    this.audio_stream = null;
    this.decoded_stream = null;
    this.one_loop = false;
    this.playlist_loop = false;
    this.now_playing = false;
    this.pausing = false;
    this.now_playing_idx = 0;
    this.now_playing_content = null;
    this.next_play_content = null;
  }

  _inc_playing_idx() {
    if (this.one_loop) return;
    this.now_playing_idx = (this.now_playing_idx + 1) % this.playlist.length();
  }

  _dec_playing_idx() {
    if (this.one_loop) return;
    this.now_playing_idx =
      (this.now_playing_idx + this.playlist.length() - 1) %
      this.playlist.length();
  }

  _start() {
    if (this.now_playing) return;
    if (this.pausing) return this._resume();

    this._update_playing_content();
    if (!this.now_playing_content) return;

    this._play_music();
  }

  _start_next() {
    if (this.one_loop) {
      // pass
    } else if (this.playlist_loop) {
      this._inc_playing_idx();
    } else {
      this.playlist.dequeue();
    }
    this._start();
  }

  _start_prev() {
    if (this.one_loop) {
      // pass
    } else if (this.playlist_loop) {
      this._dec_playing_idx();
    } else {
      return; // disabled
    }
    this._start();
  }

  _resume() {
    this.pausing = false;
    this.now_playing = true;
    this.decoded_stream.pipe(speaker);
    this.ev.emit("update-status");
  }

  _destroy() {
    this.audio_stream.removeAllListeners("close");
    try {
      this.decoded_stream.unpipe(speaker);
      this.decoded_stream.end();
    } catch (e) {}
    this.now_playing = false;
    this.pausing = false;
    this.ev.emit("update-status");
  }

  _update_playing_content(play_content = null) {
    if (play_content) {
      this.now_playing_content = this.next_play_content;
    } else if (this.playlist.is_empty()) {
      this.now_playing_content = null;
    } else {
      this.now_playing_content = this.playlist.pull(this.now_playing_idx);
    }
    this.ev.emit("update-status");
  }

  _play_music() {
    const provider = Provider.find_by_name(this.now_playing_content.provider);
    const stream = provider.create_stream(this.now_playing_content.link);

    // audio output to the speaker
    this.now_playing = true;
    this.ev.emit("update-status");
    this.decoded_stream = stream.pipe(decoder());
    this.audio_stream = this.decoded_stream.pipe(speaker).on("close", () => {
      this.now_playing = false;
      this.ev.emit("update-status");
      this._start_next();
    });
  }

  /*** controllers ***/

  start() {
    return ctx => {
      this._start();
      ctx.status = 200;
    };
  }

  next() {
    return ctx => {
      this._destroy();
      this._start_next();
      ctx.status = 200;
    };
  }

  prev() {
    return ctx => {
      this._destroy();
      this._start_prev();
      ctx.status = 200;
    };
  }

  pause() {
    return ctx => {
      this.decoded_stream.unpipe(speaker);
      this.now_playing = false;
      this.pausing = true;
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }

  one_loop_on() {
    return ctx => {
      this.one_loop = true;
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }

  one_loop_off() {
    return ctx => {
      this.one_loop = false;
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }

  playlist_loop_on() {
    return ctx => {
      this.playlist_loop = true;
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }

  playlist_loop_off() {
    return ctx => {
      this.playlist_loop = false;
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }

  status() {
    return ctx => {
      ctx.body = this.fetch_status();
    };
  }

  fetch_status() {
    return {
      one_loop: this.one_loop,
      playlist_loop: this.playlist_loop,
      now_playing: this.now_playing,
      now_playing_idx: this.now_playing_idx,
      now_playing_content: this.now_playing_content,
      playlist: this.playlist.pull_all()
    };
  }
};
