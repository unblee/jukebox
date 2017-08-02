Vue.component("player", {
  props: ["player"],

  methods: {
    is_playlist_empty() {
      return !this.player.playlist || this.player.playlist.length === 0;
    },
    player_start() {
      fetch("/player/start", { method: "POST" });
    },
    player_stop() {
      fetch("/player/stop", { method: "POST" });
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
    }
  },

  template: `
  <div class="player">
    <div class="card has-text-centered">
      <div class="card-image">
        <figure class="image is-16by9 stripe-background">
          <img v-if="player.now_playing_content" :src="player.now_playing_content.thumbnail_link" alt="Image">
        </figure>
      </div>
      <div class="card-content">
        <div class="columns">
          <div class="column">
            <h1 v-if="player.now_playing_content" class="title is-4">
              {{ player.now_playing_content.title }}
            </h1>
          </div>
        </div>
        <div class="columns player-controler">
          <div class="column is-7 is-offset-2">
            <div class="columns">
              <div class="column">
                <a title="Prev" :class="{ 'deactivate': !player.playlist_loop || is_playlist_empty() }" @click="player_prev()">
                  <i class="material-icons is-large is-pushable">skip_previous</i>
                </a>
              </div>
              <div class="column">
                <div v-if="player.now_playing">
                  <a title="Stop" @click="player_stop()" :class="{ 'deactivate': is_playlist_empty() && !player.now_playing_content }">
                    <i class="material-icons is-large is-pushable">stop</i>
                  </a>
                </div>
                <div v-else>
                  <a title="Start" @click="player_start()" :class="{ 'deactivate': is_playlist_empty() && !player.now_playing_content }">
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
          <div class="column is-2 is-offset-1">
            <a title="One Loop" :class="[{ 'is-loop-active': player.one_loop }, { 'deactivate': is_playlist_empty() && !player.now_playing_content }]" @click="player_loop_one_toggle()">
              <i class="material-icons is-medium">repeat_one</i>
            </a>
            <a title="Playlist Loop" :class="[{ 'is-loop-active': player.playlist_loop }, { 'deactivate': is_playlist_empty() }]" @click="player_loop_playlist_toggle()">
              <i class="material-icons is-medium">repeat</i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
});
