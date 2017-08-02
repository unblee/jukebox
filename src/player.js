const Playlist = require("./playlist.js");
const Provider = require("./provider");
const speaker = require("speaker");
const decoder = require("lame").Decoder;

module.exports = class Player {
  constructor(playlist = new Playlist(), ev) {
    this.playlist = playlist;
    this.ev = ev;
    this.audio_stream = null;
    this.one_loop = false;
    this.playlist_loop = false;
    this.now_playing = false;
    this.now_playing_idx = 0;
    this.now_playing_content = null;
    this.next_play_content = null;
  }

  start() {
    if (this.now_playing) return;

    this._update_playing_content();
    if (!this.now_playing_content) return;

    this._play_music();
  }

  start_next() {
    if (this.one_loop) {
      // pass
    } else if (this.playlist_loop) {
      this._inc_playing_idx();
    } else {
      this.playlist.dequeue();
    }
    this.start();
  }

  start_prev() {
    if (this.one_loop) {
      // pass
    } else if (this.playlist_loop) {
      this._dec_playing_idx();
    } else {
      return; // disabled
    }
    this.start();
  }

  destroy() {
    this.audio_stream.removeAllListeners("close");
    try {
      this.audio_stream.destroy();
    } catch (e) {}
    this.now_playing = false;
    this.ev.emit("update-status");
  }

  set_one_loop(value) {
    this.one_loop = !!value;
    this.ev.emit("update-status");
  }

  set_playlist_loop(value) {
    this.playlist_loop = !!value;
    this.ev.emit("update-status");
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
    this.audio_stream = stream
      .pipe(decoder())
      .pipe(speaker())
      .on("close", () => {
        this.now_playing = false;
        this.ev.emit("update-status");
        this.start_next();
      });
  }
};
