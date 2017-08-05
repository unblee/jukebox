const Playlist = require('./playlist.js');
const Provider = require('./provider');
const speaker = require('speaker');
const decoder = require('lame').Decoder;

module.exports = class Player {
  constructor(playlist = new Playlist(), ev) {
    this.playlist = playlist;
    this.ev = ev;
    this.audio_stream = null;
    this.decoded_stream = null;
    this.one_loop = false;
    this.playlist_loop = false;
    this.shuffle_mode = false;
    this.now_playing = false;
    this.pausing = false;
    this.now_playing_idx = 0;
    this.now_playing_content = null;
    this.next_play_content = null;
    this.spkr = null;

    this.playlist.on('removed', ({ index }) => {
      if (index === this.now_playing_idx) {
        // stop and move playing index to the next music
        this.destroy();
        this._update_playing_content();
      } else if (index < this.now_playing_idx) {
        // adjust playing index
        --this.now_playing_idx;
        this.ev.emit('update-status');
      }
    });
  }

  start() {
    if (this.now_playing) return;
    if (this.pausing) return this.resume();

    this._update_playing_content();
    if (!this.now_playing_content) return;

    this._play_music();
  }

  start_next() {
    if (this.one_loop) {
      // pass
    } else if (this.playlist_loop) {
      this._inc_playing_idx();
      if (this.shuffle_mode && !this.now_playing_idx) {
        this.playlist.shuffle();
      }
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

  start_specific(index) {
    // always not consume queue.
    this.now_playing_idx = +index;
    this.start();
  }

  pause() {
    this.decoded_stream.unpipe(this.spkr);
    this.now_playing = false;
    this.pausing = true;
    this.ev.emit('update-status');
  }

  resume() {
    this.pausing = false;
    this.now_playing = true;
    this.decoded_stream.pipe(this.spkr);
    this.ev.emit('update-status');
  }

  destroy() {
    if (this.audio_stream) this.audio_stream.removeAllListeners('close');
    try {
      this.decoded_stream.unpipe(this.spkr).end();
    } catch (e) {}
    this.now_playing = false;
    this.pausing = false;
    this.ev.emit('update-status');
  }

  set_one_loop(value) {
    this.one_loop = !!value;
    this.ev.emit('update-status');
  }

  set_playlist_loop(value) {
    this.playlist_loop = !!value;
    this.ev.emit('update-status');
  }

  set_shuffle_mode(value) {
    this.shuffle_mode = !!value;
    if (this.shuffle_mode) {
      this.playlist.shuffle();
      this.now_playing_idx = 0;

      // current playing content moves to top if playing music
      if (this.now_playing) {
        const now_content_idx = this.playlist.queue.indexOf(
          this.now_playing_content,
        );
        if (now_content_idx) {
          this.playlist.queue.splice(now_content_idx, 1);
          this.playlist.queue.unshift(this.now_playing_content);
        }
      }
    }
    this.ev.emit('update-status');
  }

  fetch_status() {
    return {
      one_loop: this.one_loop,
      playlist_loop: this.playlist_loop,
      shuffle_mode: this.shuffle_mode,
      now_playing: this.now_playing,
      now_playing_idx: this.now_playing_idx,
      now_playing_content: this.now_playing_content,
      playlist: this.playlist.to_json(),
    };
  }

  set_status(status) {
    this.set_one_loop(status.one_loop);
    this.set_playlist_loop(status.playlist_loop);
    this.set_shuffle_mode(status.shuffle_mode);
    this.playlist.replace(status.playlist);

    // set update now_playing, now_playing_idx and now_playing_content
    if (status.now_playing_idx) {
      this.now_playing_idx = status.now_playing_idx;
      this.now_playing_content = status.now_playing_content;
      if (status.now_playing) {
        this.start_specific(this.now_playing_idx);
      }
    }
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
    this.ev.emit('update-status');
  }

  _play_music() {
    const provider = Provider.find_by_name(this.now_playing_content.provider);
    const stream = provider.create_stream(this.now_playing_content.link);

    // audio output to the speaker
    this.now_playing = true;
    this.ev.emit('update-status');
    this.decoded_stream = stream.pipe(decoder());
    this.spkr = speaker();
    this.audio_stream = this.decoded_stream.pipe(this.spkr);
    this.audio_stream.on('close', () => {
      this.now_playing = false;
      this.pausing = false;
      this.destroy();
      this.ev.emit('update-status');
      this.start_next();
    });
  }
};
