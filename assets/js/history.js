Vue.component('history', {
  props: ['history'],
  data() {
    return {
      clipboard: null
    };
  },
  created() {
    this.clipboard = new Clipboard('.copy-link-button');
  },
  methods: {
    copyUrl(e) {
      this.clipboard.onClick(e);
    },
    humanizeTime(seconds) {
      const s = seconds % 60;
      const m = Math.floor(seconds / 60) % 60;
      const h = Math.floor(seconds / 3600);
      const padding = num => `00${num}`.slice(-2);
      return `${padding(h)}:${padding(m)}:${padding(s)}`;
    },
    isNowPlayingContent(idx) {
      return this.playlist.nowPlayingContent && this.playlist.nowPlayingIdx === idx;
    },
    openClearPlaylistModal() {
      this.$refs.clearPlaylistModal.open();
    },
    deleteContent(index) {
      fetch(`/playlist/${index}`, { method: 'DELETE' });
    },
    playMusic(index) {
      fetch(`/player/seek/${index}`, { method: 'POST' });
    }
  },
  computed: {
    isPlaylistEmpty() {
      return !this.playlist.contents || this.playlist.contents.length === 0;
    }
  },

  template: `
  <div class="history is-flex"
    :class="{
      'has-content': history && history.length
    }">
    <div class="panel scroll-view" v-show="history && history.length">
      <a v-for="(content,idx) in history" class="panel-block history-content is-paddingless"
          :title="content.track.title"
          >
          <div class="control columns is-marginless is-mobile">
            <div class="column is-1 align-self-center has-text-centered is-paddingless-vertical thumbnail-wrapper">
              <img :src="content.track.thumbnailLink" class="is-block">
            </div>
            <div class="column is-7 playlist-content-title-wrapper">
              {{ content.track.title }}
            </div>
            <div class="column has-text-centered is-2">
              {{ humanizeTime(content.track.lengthSeconds) }}
            </div>
            <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
              <a class="is-flex in-content-button copy-link-button" @click.prevent.stop="copyUrl" :data-clipboard-text="content.link">
                <i class="material-icons icon" title="Copy Link">link</i>
              </a>
            </div>
            <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
              <a class="is-flex in-content-button" @click.prevent.stop="deleteContent(idx)">
                A
              </a>
            </div>
          </div>
        </a>
    </div>
  </div>
  `
});
