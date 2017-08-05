Vue.component('playlist', {
  props: ['playlist'],
  data() {
    return {
      clipboard: null,
    };
  },
  created() {
    this.clipboard = new Clipboard('.copy-link-button');
  },

  methods: {
    copyUrl(e) {
      this.clipboard.onClick(e);
    },
    humanize_time(seconds) {
      const s = seconds % 60;
      const m = Math.floor(seconds % 3600 / 60);
      const h = Math.floor(seconds / 3600);
      const padding = num => (`00${num}`).slice(-2);
      return `${padding(h)}:${padding(m)}:${padding(s)}`;
    },
    is_now_playing_content(idx) {
      return (
        this.playlist.now_playing_content &&
        this.playlist.now_playing_idx === idx
      );
    },
    playlist_clear() {
      fetch('/playlist', { method: 'DELETE' });
    },
    delete_content(index) {
      fetch(`/playlist/${index}`, { method: 'DELETE' });
    },
    play_music(index) {
      fetch(`/player/seek/${index}`, { method: 'POST' });
    },
  },
  computed: {
    is_playlist_empty() {
      return !this.playlist.contents || this.playlist.contents.length === 0;
    },
  },

  template: `
  <div class="playlist is-flex"
    :class="{
      'has-content': playlist && playlist.contents && playlist.contents.length
    }">
    <div class="panel scroll-view" v-show="playlist && playlist.contents && playlist.contents.length">
      <a v-for="(content,idx) in playlist.contents" class="panel-block playlist-content is-paddingless"
          :class="{'now-playing-content is-active':is_now_playing_content(idx)}"
          :title="content.title"
          @click="play_music(idx)"
          >
          <div class="control columns is-marginless is-mobile">
            <div class="column is-1 align-self-center has-text-centered is-paddingless-vertical thumbnail-wrapper">
              <span class="panel-icon" v-if="is_now_playing_content(idx)">
                <i class="material-icons icon">equalizer</i>
              </span>
              <img :src="content.thumbnail_link" v-else class="is-block">
            </div>
            <div class="column is-7 playlist-content-title-wrapper">
              {{ content.title }}
            </div>
            <div class="column has-text-centered is-2">
              {{ humanize_time(content.length_seconds) }}
            </div>
            <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
              <a class="is-flex in-content-button copy-link-button" @click.prevent.stop="copyUrl" :data-clipboard-text="content.link">
                <i class="material-icons icon" title="Copy Link">link</i>
              </a>
            </div>
            <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
              <a class="is-flex in-content-button" @click.prevent.stop="delete_content(idx)">
                <i class="material-icons icon" title="Delete">&#xE872;</i>
              </a>
            </div>
          </div>
        </a>
    </div>
    <div class="panel">
      <div class="panel-block playlist-border-top">
        <button
          title="Clear Playlist"
          class="button playlist-clear-button is-outlined is-fullwidth is-paddingless"
          :disabled="is_playlist_empty"
          @click="playlist_clear">
          <i class="material-icons icon">delete_sweep</i>
        </button>
      </div>
      <div class="panel-block">
        <p class="control">
          <links-sender></links-sender>
        </p>
      </div>
    </div>
  </div>
  `,
});
