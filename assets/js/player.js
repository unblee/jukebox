Vue.component("player", {
  props: ["player"],

  methods: {
    is_playlist_empty() {
      return !this.player.playlist || this.player.playlist.length === 0;
    },
    player_start() {
      fetch("/player/start", { method: "POST" });
    },
    player_pause() {
      fetch("/player/pause", { method: "POST" });
    },
    player_next() {
      fetch("/player/next", { method: "POST" });
    },
    player_prev() {
      fetch("/player/prev", { method: "POST" });
    },
    player_loop_one_toggle() {
      if (this.player.one_loop) {
        fetch("/player/loop/one/off", { method: "POST" });
      } else {
        fetch("/player/loop/one/on", { method: "POST" });
      }
    },
    player_loop_playlist_toggle() {
      if (this.player.playlist_loop) {
        fetch("/player/loop/playlist/off", { method: "POST" });
      } else {
        fetch("/player/loop/playlist/on", { method: "POST" });
      }
    },
    player_shuffle_mode_toggle() {
      if (this.player.shuffle_mode) {
        fetch("/player/loop/shuffle/off", { method: "POST" });
      } else {
        fetch("/player/loop/shuffle/on", { method: "POST" });
      }
    }
  },
  computed: {
    exist_thumbnail() {
      return (
        this.player.now_playing_content &&
        this.player.now_playing_content.thumbnail_link
      );
    }
  },

  template: `
  <div class="player is-flex black-background">
    <img v-if="exist_thumbnail" :src="player.now_playing_content.thumbnail_link" alt="Image" class="player-thumbnail is-block">
    <div class="player-overlay is-flex">
      <h1 class="title is-4 player-title is-marginless">
        <a :href="player.now_playing_content.link" target="_blank"
        v-if="player.now_playing_content"
        class="has-text-white" :title="player.now_playing_content.title">
          {{ player.now_playing_content.title }}
        </a>
        <span v-else>&nbsp;</span>
      </h1>
      <div class="player-main-controller has-text-centered">
        <div class="columns is-mobile">
          <div class="column">
            <a title="Prev" :class="{ 'deactivate': !player.playlist_loop || is_playlist_empty() }" @click="player_prev()">
              <i class="material-icons is-large is-pushable">skip_previous</i>
            </a>
          </div>
          <div class="column">
            <div v-if="player.now_playing">
              <a title="Pause" @click="player_pause()" :class="{ 'deactivate': is_playlist_empty() && !player.now_playing_content }">
                <i class="material-icons is-large is-pushable">pause</i>
              </a>
            </div>
            <div v-else>
              <a title="Play" @click="player_start()" :class="{ 'deactivate': is_playlist_empty() && !player.now_playing_content }">
                <i class="material-icons is-large is-pushable">play_arrow</i>
              </a>
            </div>
          </div>
          <div class="column">
            <a title="Next" @click="player_next()" :class="{ 'deactivate': is_playlist_empty() }">
              <i class="material-icons is-large is-pushable">skip_next</i>
            </a>
          </div>
        </div>
      </div>
      <div class="player-other-controller">
        <div class="columns has-text-centered is-mobile">
          <div class="column">
            <a title="One Loop" :class="[{ 'is-loop-active': player.one_loop }, { 'deactivate': is_playlist_empty() && !player.now_playing_content }]" @click="player_loop_one_toggle()">
              <i class="material-icons is-medium">repeat_one</i>
            </a>
          </div>
          <div class="column">
            <a title="Playlist Loop" :class="[{ 'is-loop-active': player.playlist_loop }, { 'deactivate': is_playlist_empty() }]" @click="player_loop_playlist_toggle()">
              <i class="material-icons is-medium">repeat</i>
            </a>
          </div>
          <div class="column">
            <a title="Shuffle" :class="[{ 'is-loop-active': player.shuffle_mode }, { 'deactivate': is_playlist_empty() }]" @click="player_shuffle_mode_toggle()">
              <i class="material-icons is-medium">shuffle</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
});
