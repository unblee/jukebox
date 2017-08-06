Vue.component('player', {
  props: ['player'],

  methods: {
    isPlaylistEmpty() {
      return !this.player.playlist || this.player.playlist.length === 0;
    },
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
    playerLoopOneToggle() {
      if (this.player.oneLoop) {
        fetch('/player/loop/one/off', { method: 'POST' });
      } else {
        fetch('/player/loop/one/on', { method: 'POST' });
      }
    },
    playerLoopPlaylistToggle() {
      if (this.player.playlistLoop) {
        fetch('/player/loop/playlist/off', { method: 'POST' });
      } else {
        fetch('/player/loop/playlist/on', { method: 'POST' });
      }
    },
    playerShuffleModeToggle() {
      if (this.player.shuffleMode) {
        fetch('/player/loop/shuffle/off', { method: 'POST' });
      } else {
        fetch('/player/loop/shuffle/on', { method: 'POST' });
      }
    }
  },
  computed: {
    existThumbnail() {
      return this.player.nowPlayingContent && this.player.nowPlayingContent.thumbnailLink;
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
    <div class="player-overlay is-flex">
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
            <a title="Prev" :class="{ 'deactivate': !player.playlistLoop || isPlaylistEmpty() }" @click="playerPrev()">
              <i class="material-icons is-large is-pushable">skip_previous</i>
            </a>
          </div>
          <div class="column">
            <div v-if="player.nowPlaying">
              <a title="Pause" @click="playerPause()" :class="{ 'deactivate': isPlaylistEmpty() && !player.nowPlayingContent }">
                <i class="material-icons is-large is-pushable">pause</i>
              </a>
            </div>
            <div v-else>
              <a title="Play" @click="playerStart()" :class="{ 'deactivate': isPlaylistEmpty() && !player.nowPlayingContent }">
                <i class="material-icons is-large is-pushable">play_arrow</i>
              </a>
            </div>
          </div>
          <div class="column">
            <a title="Next" @click="playerNext()" :class="{ 'deactivate': isPlaylistEmpty() }">
              <i class="material-icons is-large is-pushable">skip_next</i>
            </a>
          </div>
        </div>
      </div>
      <div class="player-other-controller">
        <a class="icon" @click="mute = !mute">
          <i class="material-icons" v-if="!mute">volume_up</i>
          <i class="material-icons" v-else>volume_off</i>
        </a>
        <input type="range" v-model.number="volume" max="1.5" min="0" step="0.01" @dblclick="volume = 1">
        <div class="columns has-text-centered is-mobile">
          <div class="column">
            <a title="One Loop" :class="[{ 'is-loop-active': player.oneLoop }, { 'deactivate': isPlaylistEmpty() && !player.nowPlayingContent }]" @click="playerLoopOneToggle()">
              <i class="material-icons is-medium">repeat_one</i>
            </a>
          </div>
          <div class="column">
            <a title="Playlist Loop" :class="[{ 'is-loop-active': player.playlistLoop }, { 'deactivate': isPlaylistEmpty() }]" @click="playerLoopPlaylistToggle()">
              <i class="material-icons is-medium">repeat</i>
            </a>
          </div>
          <div class="column">
            <a title="Shuffle" :class="[{ 'is-loop-active': player.shuffleMode }, { 'deactivate': isPlaylistEmpty() }]" @click="playerShuffleModeToggle()">
              <i class="material-icons is-medium">shuffle</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
});
