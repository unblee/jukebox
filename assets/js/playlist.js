Vue.component('playlist', {
  props: ['data'],
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
    movedPlaylist({ newIndex, oldIndex }) {
      if (newIndex !== oldIndex) {
        fetch(`/playlist/${oldIndex}/move/${newIndex}`, { method: 'POST' });
        this.$emit('moved-playlist', { newIndex, oldIndex });
      }
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
    },
    playlist() {
      return this.data;
    }
  },

  template: `
  <div class="scroll-view-wrapper playlist">
    <div class="scroll-view">
      <div class="tracks">
        <draggable class="panel scroll-view"
                  v-show="playlist && playlist.contents && playlist.contents.length"
                  :list="playlist.contents"
                  @end="movedPlaylist">
          <a v-for="(content,idx) in playlist.contents" class="panel-block playlist-content is-paddingless"
              :class="{'now-playing-content is-active':isNowPlayingContent(idx)}"
              :title="content.title"
              @click="playMusic(idx)"
              >
              <div class="control columns is-marginless is-mobile">
                <div class="column is-1 align-self-center has-text-centered is-paddingless-vertical thumbnail-wrapper">
                  <span class="panel-icon" v-if="isNowPlayingContent(idx)">
                    <i class="material-icons icon">equalizer</i>
                  </span>
                  <img :src="content.thumbnailLink" v-else class="is-block">
                </div>
                <div class="column is-7 playlist-content-title-wrapper">
                  {{ content.title }}
                </div>
                <div class="column has-text-centered is-2">
                  {{ humanizeTime(content.lengthSeconds) }}
                </div>
                <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
                  <a class="is-flex in-content-button copy-link-button" @click.prevent.stop="copyUrl" :data-clipboard-text="content.link">
                    <i class="material-icons icon" title="Copy Link">link</i>
                  </a>
                </div>
                <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
                  <a class="is-flex in-content-button" @click.prevent.stop="deleteContent(idx)">
                    <i class="material-icons icon" title="Delete">&#xE872;</i>
                  </a>
                </div>
              </div>
            </a>
          </draggable>
        </div>
      </div>
    <div class="panel playlist-controller">
      <div class="panel">
        <div class="panel-block playlist-border-top">
          <clear-playlist-modal ref="clearPlaylistModal"></clear-playlist-modal>
          <button
            title="Clear Playlist"
            class="button playlist-clear-button is-outlined is-fullwidth is-paddingless"
            :disabled="isPlaylistEmpty"
            @click="openClearPlaylistModal">
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
  </div>
  `
});
