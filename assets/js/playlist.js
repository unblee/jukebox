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
    },
    delete_content(index) {
      fetch(`/playlist/${index}`, { method: "DELETE" });
    }
  },

  template: `
  <div class="playlist panel">
    <a v-for="(content,idx) in playlist.contents" class="panel-block playlist-content"
      :class="{'now-playing-content is-active':is_now_playing_content(idx)}"
      :title="content.title"
      >
      <div class="control columns">
        <div class="column is-8 playlist-content-title-wrapper is-clipped">
          {{ content.title }}
        </div>
        <div class="column has-text-centered is-2">
          {{ humanize_time(content.length_seconds) }}
        </div>
        <div class="column is-2 has-text-centered">
          <a class="has-text-white delete-content" @click="delete_content(idx)">
            <i class="material-icons">&#xE872;</i>
          </a>
        </div>
      </div>
    </a>
    <div title="Clear Playlist" class="card playlist-clear-button" :class="{ 'deactivate': is_playlist_empty() }">
      <a @click="playlist_clear()"></a>
      <i class="material-icons is-medium">delete_sweep</i>
    </div>
  </div>
  `
});
