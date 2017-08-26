Vue.component('playlist', {
  methods: {
    humanizeTime(seconds) {
      return Util.humanizeTimeFromSeconds(seconds);
    },
    openClearPlaylistModal() {
      this.$refs.clearPlaylistModal.open();
    },
    ...mapActions(['deleteContent', 'playMusic', 'moveTrack'])
  },
  computed: {
    ...mapState(['playlist']),
    ...mapGetters(['isPlaylistEmpty']),
    ...mapGetters(['isNowPlayingIdx'])
  },

  template: `
  <div class="scroll-view-wrapper playlist">
    <div class="scroll-view">
      <div class="tracks">
        <draggable class="panel scroll-view"
                  v-show="!isPlaylistEmpty"
                  :list="playlist"
                  @end="moveTrack">
          <a v-for="(content,idx) in playlist" class="panel-block playlist-content is-paddingless"
              :class="{'now-playing-content is-active':isNowPlayingIdx(idx)}"
              :title="content.title"
              @click="playMusic(idx)"
              >
              <div class="control columns is-marginless is-mobile">
                <div class="column is-1 align-self-center has-text-centered is-paddingless-vertical thumbnail-wrapper">
                  <span class="panel-icon" v-if="isNowPlayingIdx(idx)">
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
                  <copy-link-button class="is-flex" :link="content.link" tooltip-duration="1000"></copy-link-button>
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
