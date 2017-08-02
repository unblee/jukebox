const Playlist = require("./playlist.js");
const speaker = require("speaker");
const decoder = require("lame").Decoder;

module.exports = class Player {
  constructor(playlist = new Playlist(), providers = [], ev) {
    this.playlist = playlist;
    this.ev = ev;
    this.providers = providers;
    this.audio_stream = null;
    this.one_loop = false;
    this.playlist_loop = false;
    this.now_playing = false;
    this.now_playing_idx = 0;
    this.now_playing_content = null;
    this.next_play_content = null;
    this.next_play_prev = false;
  }

  _inc_playing_idx() {
    if (this.one_loop) return;

    this.now_playing_idx++;
    if (this.now_playing_idx >= this.playlist.length()) {
      this.now_playing_idx = 0;
    }
  }

  _dec_playing_idx() {
    if (this.one_loop) return;

    this.now_playing_idx--;
    if (this.now_playing_idx < 0) {
      this.now_playing_idx = this.playlist.length() - 1;
    }
  }

  start() {
    return ctx => {
      this._start();
      ctx.status = 200;
    };
  }

  _start_next() {
    if (!this.playlist_loop) {
      this.playlist.dequeue();
    } else {
      this._inc_playing_idx();
    }
    // fetch next play content
    this.next_play_content = this.playlist.pull(this.now_playing_idx);
    this._start();
  }

  _start_prev() {
    this.next_play_prev = false;
    this._dec_playing_idx();
    // fetch next play content
    this.next_play_content = this.playlist.pull(this.now_playing_idx);
    this._start();
  }

  _start() {
    if (this.now_playing) return;

    if (this.playlist.is_empty()) {
      this.now_playing_content = null;
      this.ev.emit("update-status");
      return;
    }

    this.now_playing_content = this.next_play_content;

    if (!this.now_playing_content) {
      this.now_playing_content = this.playlist.pull(this.now_playing_idx);
    }

    const provider = this.providers.find(provider => {
      return provider.name === this.now_playing_content.provider;
    });
    const provider_stream = provider.create_stream(
      this.now_playing_content.link
    );

    // audio output to the speaker
    this.now_playing = true;
    this.ev.emit("update-status");
    this.audio_stream = provider_stream
      .pipe(decoder())
      .pipe(speaker())
      .on("close", () => {
        this.now_playing = false;
        this.ev.emit("update-status");
        if (this.one_loop) {
          this._start();
        } else if (this.next_play_prev) {
          this._start_prev();
        } else {
          this._start_next();
        }
      });
  }

  next() {
    return ctx => {
      this.now_playing = false;
      try {
        this.audio_stream.destroy();
      } catch (e) {}
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }

  prev() {
    return ctx => {
      if (!this.playlist_loop) {
        ctx.status = 200;
        return;
      }
      this.now_playing = false;
      this.next_play_prev = true;
      try {
        this.audio_stream.destroy();
      } catch (e) {}
      this.ev.emit("update-status");
      ctx.status = 200;
    };
  }

  stop() {
    return ctx => {
      this.now_playing = false;

      this.audio_stream.removeAllListeners("close");
      try {
        this.audio_stream.destroy();
      } catch (e) {}
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
