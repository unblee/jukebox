Vue.component('player', {
  methods: {
    ...mapActions([
      'playerStart',
      'playerPause',
      'playerNext',
      'playerPrev',
      'playerRestart',
      'togglePlayerLoopMode',
      'togglePlayerShuffleMode',
      'setMute',
      'setVolume'
    ])
  },
  computed: {
    mute: {
      get() {
        return !this.status.volume;
      },
      set(isMute) {
        this.setMute(isMute);
      }
    },
    volume: {
      get() {
        return this.status.volume;
      },
      set(volume) {
        // TODO: Remove eslint-disable-line when introduce webpack and lodash.throttle
        // _.throttle(() => { // eslint-disable-line
        this.setVolume(volume);
        // }, 500);
      }
    },
    lengthTime() {
      return Util.humanizeTimeFromSeconds(this.lengthSeconds);
    },
    seekTime() {
      return Util.humanizeTimeFromSeconds(Math.floor(this.seekSeconds));
    },
    ...mapState(['status', 'seekSeconds']),
    ...mapGetters(['nowPlayingContent', 'isPlaylistEmpty', 'existThumbnail']),
    ...mapGetters({
      lengthSeconds: 'nowPlayingLengthSeconds'
    })
  },

  template: `
  <div class="player is-flex black-background">
    <img v-if="existThumbnail" :src="nowPlayingContent.thumbnailLink" alt="Image" class="player-thumbnail is-block">
    <div class="image player-no-content"  v-if="isPlaylistEmpty"></div>
    <div class="player-overlay is-flex" :class="{ 'player-overlay--stop': existThumbnail &&  status.state !== 'playing' }">
      <h1 class="title is-4 player-title is-marginless">
        <a :href="nowPlayingContent.link" target="_blank"
        v-if="nowPlayingContent"
        class="has-text-white" :title="nowPlayingContent.title">
          {{ nowPlayingContent.title }}
        </a>
        <span v-else>&nbsp;</span>
      </h1>
      <div class="player-main-controller has-text-centered">
        <div class="columns is-mobile">
          <div class="column">
            <a title="Prev" :class="{ 'deactivate': status.loopMode === 'none' || isPlaylistEmpty }" @click="playerPrev()">
              <i class="material-icons is-large is-pushable">skip_previous</i>
            </a>
          </div>
          <div class="column">
            <div v-if="status.state === 'playing'">
              <a title="Pause" @click="playerPause()" :class="{ 'deactivate': isPlaylistEmpty && !nowPlayingContent }">
                <i class="material-icons is-large is-pushable">pause</i>
              </a>
            </div>
            <div v-else>
              <a title="Play" @click="playerStart()" :class="{ 'deactivate': isPlaylistEmpty && !nowPlayingContent }">
                <i class="material-icons is-large is-pushable">play_arrow</i>
              </a>
            </div>
          </div>
          <div class="column">
            <a title="Next" @click="playerNext()" :class="{ 'deactivate': isPlaylistEmpty }">
              <i class="material-icons is-large is-pushable">skip_next</i>
            </a>
          </div>
        </div>
      </div>
      <div class="player-other-controller">
        <div class="columns has-text-centered is-mobile progressbar-block" v-if="nowPlayingContent">
          <div class="column is-3 seek-time has-text-right">{{ seekTime }}</div>
          <div class="column is-6 ">
            <seekbar :value="seekSeconds" :max="lengthSeconds"></seekbar>
          </div>
          <div class="column is-3 length-time has-text-left">{{ lengthTime }}</div>
        </div>
        <div class="columns has-text-centered is-mobile">
          <div class="column is-2">
            <a @click="playerRestart">
              <i class="material-icons is-medium">replay</i>
            </a>
          </div>
          <div class="column is-6 has-text-left">
            <a @click="mute = !mute">
              <i class="material-icons is-medium" v-if="!mute">volume_up</i>
              <i class="material-icons is-medium" v-else>volume_off</i>
            </a>
            <input type="range" v-model.number="volume" max="1.5" min="0" step="0.01" @dblclick="volume = 1" class="player-volume-bar">
          </div>
          <div class="column is-2">
            <a title="Queue" v-if="status.loopMode === 'none'" @click="togglePlayerLoopMode">
              <i class="material-icons is-medium">arrow_forward</i>
            </a>
            <a title="One Loop" class="is-loop-active" v-if="status.loopMode === 'one'" @click="togglePlayerLoopMode">
              <i class="material-icons is-medium">repeat_one</i>
            </a>
            <a title="Playlist Loop" class="is-loop-active" v-if="status.loopMode === 'playlist'" @click="togglePlayerLoopMode">
              <i class="material-icons is-medium">repeat</i>
            </a>
          </div>
          <div class="column">
            <a title="Shuffle" :class="[{ 'is-loop-active': status.shuffleMode }, { 'deactivate': isPlaylistEmpty }]" @click="togglePlayerShuffleMode">
              <i class="material-icons is-medium">shuffle</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
});
