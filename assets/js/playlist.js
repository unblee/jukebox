Vue.component('playlist', {
  methods: {
    openClearPlaylistModal() {
      this.$refs.clearPlaylistModal.open();
    },
    ...mapActions(['moveTrack'])
  },
  computed: {
    ...mapState(['playlist']),
    ...mapGetters(['isPlaylistEmpty', 'isNowPlayingIdx'])
  },

  template: `
  <div class="scroll-view-wrapper playlist">
    <div class="scroll-view">
      <draggable class="panel"
                v-show="!isPlaylistEmpty"
                :list="playlist"
                @end="moveTrack">
        <playlist-item v-for="(content,idx) in playlist" mode="playlist" :track="content" :idx="idx" />
      </draggable>
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
