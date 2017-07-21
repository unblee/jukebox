Vue.component("playlist", {
  props: ["playlist"],

  methods: {
    humanize_time(seconds) {
      const s = seconds % 60;
      const m = Math.floor(seconds / 60);
      let h = 0;
      if (m > 60) {
        h = Math.floor(m / 60);
        m %= 60;
      }
      padding = function(num) {
        return ("00" + num).slice(-2);
      };
      return `${padding(h)}:${padding(m)}:${padding(s)}`;
    },
    is_now_playing_content(idx) {
      if (!this.playlist.now_playing_content) {
        return false;
      }
      return this.playlist.now_playing_idx === idx;
    },
    is_playlist_empty() {
      if (!this.playlist.contents) return true;
      return this.playlist.contents.length === 0;
    },
    playlist_clear() {
      fetch("/playlist", { method: "DELETE" });
    }
  },

  template: `
  <div class="playlist">
    <div v-for="(content,idx) in playlist.contents" class="card playlist-content">
      <a :title="content.title"></a>
      <div class="card-content" :class="{'now-playing-content':is_now_playing_content(idx)}">
        <div class="columns">
          <div class="column is-9">
            {{ content.title }}
          </div>
          <div class="column">
            {{ humanize_time(content.length_seconds) }}
          </div>
        </div>
      </div>
    </div>
    <div title="Clear Playlist" class="card playlist-clear-button" :class="{ 'deactivate': is_playlist_empty() }">
      <a @click="playlist_clear()"></a>
      <i class="material-icons is-medium">delete_sweep</i>
    </div>
  </div>
  `
});
