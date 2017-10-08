Vue.component('playlist-item', {
  props: ['track', 'idx', 'mode'],
  computed: {
    humanizeTime() {
      return Util.humanizeTimeFromSeconds(this.content.lengthSeconds);
    },
    historyMode() {
      return this.mode === 'history';
    },
    playlistMode() {
      return this.mode !== 'history';
    },
    content() {
      return this.historyMode ? this.track.track : this.track;
    },
    ...mapGetters(['isNowPlayingIdx']),
    ...mapState(['history'])
  },
  methods: {
    ...mapActions(['deleteTrack', 'playMusic', 'addTracks']),
    async addFromHistory() {
      try {
        this.addTracks([this.history[this.idx].track.link]);
      } catch (e) {
        console.error(e);
      }
    }
  },

  template: `
    <a class="panel-block is-block playlist-content"
    :class="{
      'now-playing-content is-active':isNowPlayingIdx(idx),
    }"
    :title="content.title"
    @click="() => playlistMode && playMusic(idx)"
    >
      <div class="columns is-mobile">
        <div class="column is-1 align-self-center has-text-centered thumbnail-wrapper">
          <span class="panel-icon" v-if="playlistMode && isNowPlayingIdx(idx)">
            <i class="material-icons icon">equalizer</i>
          </span>
          <img :src="content.thumbnailLink" v-else class=" playlist-thumbnail">
        </div>
        <div class="column is-7">
          <div class="columns is-mobile">
            <div class="column is-2 has-text-centered play-count" v-if="historyMode">
              <span class="tag is-light is-rounded">{{ track.playCount }}</span>
            </div>
            <div class="column playlist-content-title" :class="{'is-10': historyMode}">
              {{ content.title }}
            </div>
          </div>
        </div>
        <div class="column has-text-centered is-2">
          {{ humanizeTime }}
        </div>
        <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
          <copy-link-button class="is-flex" :link="content.link" tooltip-duration="1000"></copy-link-button>
        </div>
        <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
          <a class="is-flex in-content-button add-content-button" @click.prevent.stop="addFromHistory" v-if="historyMode">
            <i class="material-icons icon" title="Add to Playlist">library_add</i>
          </a>
          <a class="is-flex in-content-button" @click.prevent.stop="deleteTrack(idx)" v-else>
            <i class="material-icons icon" title="Delete">&#xE872;</i>
          </a>
        </div>
      </div>
    </a>`
});
