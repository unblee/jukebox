Vue.component('player', {
  props: ['player'],

  methods: {
    playerStart() {
      fetch('/player/start', { method: 'POST' });
    },
    playerPause() {
      fetch('/player/pause', { method: 'POST' });
    },
    playerNext() {
      fetch('/player/next', { method: 'POST' });
    },
    playerPrev() {
      fetch('/player/prev', { method: 'POST' });
    },
    playerLoopModeToggle() {
      const kinds = ['none', 'one', 'playlist'];
      const current = kinds.indexOf(this.player.loopMode);
      const next = typeof current === 'number' ? kinds[(current + 1) % kinds.length] : 'none';
      fetch(`/player/loop/${next}`, { method: 'POST' });
    },
    playerShuffleModeToggle() {
      if (this.player.shuffleMode) {
        fetch('/player/loop/shuffle/off', { method: 'POST' });
      } else {
        fetch('/player/loop/shuffle/on', { method: 'POST' });
      }
    },
    restart() {
      fetch('/player/restart', { method: 'POST' });
    }
  },
  computed: {
    existThumbnail() {
      return this.player.nowPlayingContent && this.player.nowPlayingContent.thumbnailLink;
    },
    isPlaylistEmpty() {
      return !this.player.playlist || this.player.playlist.length === 0;
    },
    mute: {
      get() {
        return !this.volume;
      },
      set(isMute) {
        fetch(`/player/volume/${isMute ? 'off' : 'on'}`, { method: 'POST' });
      }
    },
    volume: {
      get() {
        return this.player.volume;
      },
      set(volume) {
        // TODO: Remove eslint-disable-line when introduce webpack and lodash.throttle
        // _.throttle(() => { // eslint-disable-line
        const body = JSON.stringify({ volume });
        const headers = {
          'Content-Type': 'application/json'
        };
        fetch('/player/volume', { method: 'POST', body, headers });
        // }, 500);
      }
    }
  },

  template: `
  <div class="player is-flex black-background">
    <img v-if="existThumbnail" :src="player.nowPlayingContent.thumbnailLink" alt="Image" class="player-thumbnail is-block">
    <div class="image player-no-content"  v-if="isPlaylistEmpty"></div>
    <div class="player-overlay is-flex" :class="{ 'player-overlay--stop': existThumbnail &&  player.state !== 'playing' }">
      <h1 class="title is-4 player-title is-marginless">
        <a :href="player.nowPlayingContent.link" target="_blank"
        v-if="player.nowPlayingContent"
        class="has-text-white" :title="player.nowPlayingContent.title">
          {{ player.nowPlayingContent.title }}
        </a>
        <span v-else>&nbsp;</span>
      </h1>
      <div class="player-main-controller has-text-centered">
        <div class="columns is-mobile">
          <div class="column">
            <a title="Prev" :class="{ 'deactivate': player.loopMode !== 'playlist' || isPlaylistEmpty }" @click="playerPrev()">
              <i class="material-icons is-large is-pushable">skip_previous</i>
            </a>
          </div>
          <div class="column">
            <div v-if="player.state === 'playing'">
              <a title="Pause" @click="playerPause()" :class="{ 'deactivate': isPlaylistEmpty && !player.nowPlayingContent }">
                <i class="material-icons is-large is-pushable">pause</i>
              </a>
            </div>
            <div v-else>
              <a title="Play" @click="playerStart()" :class="{ 'deactivate': isPlaylistEmpty && !player.nowPlayingContent }">
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
        <div class="columns has-text-centered is-mobile">
          <div class="column is-2">
            <a @click="restart">
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
            <a title="Queue" v-if="player.loopMode === 'none'" @click="playerLoopModeToggle()">
              <i class="material-icons is-medium">arrow_forward</i>
            </a>
            <a title="One Loop" class="is-loop-active" v-if="player.loopMode === 'one'" @click="playerLoopModeToggle()">
              <i class="material-icons is-medium">repeat_one</i>
            </a>
            <a title="Playlist Loop" class="is-loop-active" v-if="player.loopMode === 'playlist'" @click="playerLoopModeToggle()">
              <i class="material-icons is-medium">repeat</i>
            </a>
          </div>
          <div class="column">
            <a title="Shuffle" :class="[{ 'is-loop-active': player.shuffleMode }, { 'deactivate': isPlaylistEmpty }]" @click="playerShuffleModeToggle()">
              <i class="material-icons is-medium">shuffle</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
});
